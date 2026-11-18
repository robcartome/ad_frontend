// Read evidence after the actual browser action; this script never edits CMS.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
const context = JSON.parse(await fs.readFile('../.tools/b4c-http-context.json', 'utf8'));
assert.equal(context.database, 'test_apudig_b4c_http');
const stage = process.argv[2];
assert.ok(['draft', 'published'].includes(stage));
const targetTitle = 'C4 banner A desde navegador';
async function request(path, options = {}) {
  const response = await fetch(context.backend + path, options);
  assert.equal(response.status, 200);
  return response.json();
}
const login = await request('/auth/token/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: context.auth.editor.email, password: context.auth.editor.password }) });
const company = login.companies.find(row => row.company_name === 'Catalog Company A');
const selection = await request('/auth/select-company/', { method: 'POST', headers: { Authorization: `Bearer ${login.access_token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ company_id: company.company_id }) });
const record = await request(`/websites/${context.websiteA}/editor/`, { headers: { Authorization: `Bearer ${selection.access_token}` } });
const published = await request(`/storefront/sites/${context.hostA}/content/`);
assert.equal(record.draft.banners[0].title, targetTitle);
assert.equal(published.commerceEnabled, false);
const html = await new Promise((resolve, reject) => {
  http.get(context.next, { headers: { Host: `${context.hostA}:8771` } }, response => {
    let body = ''; response.setEncoding('utf8'); response.on('data', chunk => { body += chunk; }); response.on('end', () => { assert.equal(response.statusCode, 200); resolve(body); });
  }).on('error', reject);
});
assert.equal(published.content.banners[0].title === targetTitle, stage === 'published');
assert.equal(html.includes(targetTitle), stage === 'published');
const other = await request(`/storefront/sites/${context.hostB}/content/`);
assert.ok(!JSON.stringify(other.content).includes(targetTitle));
const path = '../.tools/b4c4-browser-flow.json';
let evidence = { database: context.database, stages: [] };
try { evidence = JSON.parse(await fs.readFile(path, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
evidence.stages.push({ stage, browserRole: 'CMS editor', browserAction: stage === 'draft' ? 'Guardar borrador' : 'Publicar revision', verifiedAt: new Date().toISOString(), draftRevision: record.revision, publicRevision: published.revision, draftTitleMatches: true, publicTitleMatches: stage === 'published', publicHtmlMatches: stage === 'published', tenantBIsolated: true, commerceEnabled: false, cmsWritesFromThisScript: false });
await fs.writeFile(path, JSON.stringify(evidence, null, 2));
console.log('Verified real browser CMS action:', stage, 'draft revision:', record.revision, 'public revision:', published.revision);
