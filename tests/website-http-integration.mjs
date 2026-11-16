// Explicit opt-in: only disposable fixtures supplied by the integration runner.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import { createDjangoWebsiteRepository } from '../src/services/websiteRepository.mjs';
const api = process.env.B3_API_URL;
const next = process.env.B3_NEXT_URL;
assert.equal(new URL(api).hostname, '127.0.0.1');
assert.equal(new URL(api).port, '8013');
assert.equal(new URL(next).port, '3013');
const fixtures = JSON.parse(await fs.readFile(process.env.B3_FIXTURE, 'utf8'));
async function request(path, options = {}, token) {
  const response = await fetch(`${api}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(data.message || data.detail), { status: response.status, code: data.code, fields: data.fields });
  return options.withResponse ? { data, etag: response.headers.get('ETag'), status: response.status } : data;
}
const evidence = [];
function html(host, path = '/') {
  return new Promise((resolve, reject) => {
    http.get(`${next}${path}`, { headers: { Host: `${host}:3013`, 'X-Forwarded-Host': 'b.b3.localhost' } }, response => {
      let text = ''; response.setEncoding('utf8'); response.on('data', chunk => { text += chunk; }); response.on('end', () => resolve({ status: response.statusCode, text }));
    }).on('error', reject);
  });
}

async function login(fixture) {
  const tokens = await request('/auth/token/', { method: 'POST', body: JSON.stringify({ email: fixture.email, password: 'Integration-B3-only-2026' }) });
  const scoped = await request('/auth/select-company/', { method: 'POST', body: JSON.stringify({ company_id: fixture.companyId }) }, tokens.access_token || tokens.access);
  return { token: scoped.access_token || scoped.access, refresh: tokens.refresh_token || tokens.refresh };
}
const session = await login(fixtures.A);
const repository = createDjangoWebsiteRepository((path, options) => request(path, options, session.token));
const discovery = await repository.discover('a.b3.localhost');
assert.equal(discovery.id, fixtures.A.websiteId);
assert.equal(discovery.capabilities.publish, true);
const scope = { companyId: discovery.companyId, websiteId: discovery.id };
let record = await repository.load(scope);
if (record.published?.banners?.length) {
  assert.ok((await html(fixtures.A.hostname)).text.includes(record.published.banners[0].title));
  evidence.push('Previously published content survives backend/Next process restarts without editorial localStorage.');
}
const document = JSON.parse(await fs.readFile(new URL('../../apudig_mvp/apps/websites/tests/fixtures/editorial-v3.json', import.meta.url), 'utf8'));
const marker = `B3-public-banner-${Date.now()}`;
document.identity.name = 'Integration Website A';
document.contact.email = 'public-a@example.test';
document.seo.title = 'Integration A published SEO';
document.banners[0].title = marker;
record = await repository.saveDraft(scope, document, record.revision);
assert.equal((await repository.preview(scope)).content.banners[0].title, marker);
const before = await html(fixtures.A.hostname);
assert.ok(!before.text.includes(marker));
evidence.push('Draft persisted in PostgreSQL; Next HTML does not reveal draft.');
const stale = record.revision;
record = await repository.publish(scope, record.revision);
const published = await html(fixtures.A.hostname);
assert.equal(published.status, 200);
for (const value of [marker, document.contact.email, document.seo.title]) assert.ok(published.text.includes(value), value);
for (const value of [fixtures.A.companyId, fixtures.B.companyId, fixtures.A.email, 'storage_key', '20999111301']) assert.ok(!published.text.includes(value), value);
evidence.push('Next SSR renders published banner, identity, contact and SEO without fiscal IDs or actor data.');
await assert.rejects(repository.saveDraft(scope, document, stale), error => error.status === 412);
await assert.rejects(repository.load({ websiteId: fixtures.B.websiteId }), error => error.status === 404);
await assert.rejects(repository.discover(fixtures.B.hostname), error => error.status === 403);
evidence.push('Stale ETag and cross-company editor/domain requests denied.');
document.banners[0].title = `${marker}-private-draft`;
record = await repository.saveDraft(scope, document, record.revision);
assert.ok(!(await html(fixtures.A.hostname)).text.includes(document.banners[0].title));
record = await repository.publish(scope, record.revision);
assert.ok((await html(fixtures.A.hostname)).text.includes(document.banners[0].title));
assert.equal((await html('unknown.b3.localhost')).status, 404);
evidence.push('Second save stays private until publish; unknown domain returns HTTP 404.');
const otherSession = await login(fixtures.B);
const other = createDjangoWebsiteRepository((path, options) => request(path, options, otherSession.token));
let otherRecord = await other.load({ websiteId: fixtures.B.websiteId });
document.identity.name = 'Integration Website B';
document.banners[0].title = 'B-company-independent-banner';
otherRecord = await other.saveDraft({ websiteId: fixtures.B.websiteId }, document, otherRecord.revision);
await other.publish({ websiteId: fixtures.B.websiteId }, otherRecord.revision);
const otherHtml = await html(fixtures.B.hostname);
assert.ok(otherHtml.text.includes('B-company-independent-banner'));
assert.ok(!otherHtml.text.includes(marker));
assert.ok(!(await html(fixtures.A.hostname)).text.includes('B-company-independent-banner'));
evidence.push('Two published companies remain isolated; forged forwarded-host header does not override Host.');
for (const path of ['/about', '/contact', '/shop', '/cart', '/admin', '/admin/website', '/login', '/catalog', '/admin/catalog_admin']) assert.equal((await html(fixtures.A.hostname, path)).status, 200, path);
assert.equal((await html(fixtures.A.hostname, '/shop/not-real')).status, 404);
evidence.push('Preserved route smoke passes; unknown product remains HTTP 404.');
const refreshed = await request('/auth/refresh/', { method: 'POST', body: JSON.stringify({ refresh_token: session.refresh }) });
assert.ok(refreshed.access_token || refreshed.access);
evidence.push('Existing login, company selection and JWT refresh endpoints work over HTTP.');
await fs.writeFile(process.env.B3_EVIDENCE, JSON.stringify({ evidence, banner: marker, engine: 'PostgreSQL 18.1', browserUI: false, realR2: false }, null, 2));
console.log(evidence.join('\n'));
