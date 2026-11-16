import test from 'node:test';
import assert from 'node:assert/strict';
import { requestHostname, resolveRequestHostname, fetchPublicWebsite } from '../src/lib/storefront/public-website.mjs';
import { createDjangoWebsiteRepository } from '../src/services/websiteRepository.mjs';

test('request host is normalized without accepting forwarded lists or paths', () => {
  assert.equal(requestHostname('A.B3.TEST:3000'), 'a.b3.test');
  for (const value of ['https://a.test', 'a.test,b.test', 'a.test/path', 'a.test:99999', null]) assert.equal(requestHostname(value), null);
});
test('local override is explicit, validated and never applies to production or other hosts', () => {
  const dev = { nodeEnv: 'development', devHostname: 'a.b3.localhost' };
  assert.equal(resolveRequestHostname('localhost:3000', dev), 'a.b3.localhost');
  assert.equal(resolveRequestHostname('localhost:3000', { nodeEnv: 'development' }), 'localhost');
  assert.equal(resolveRequestHostname('localhost:3000', { ...dev, nodeEnv: 'production' }), 'localhost');
  assert.equal(resolveRequestHostname('b.b3.localhost:3000', dev), 'b.b3.localhost');
  assert.equal(resolveRequestHostname('unknown.b3.localhost:3000', dev), 'unknown.b3.localhost');
  for (const bad of ['https://a.test', 'a.test:3000', '127.0.0.1', '../a.test', 'a..test'])
    assert.equal(resolveRequestHostname('localhost:3000', { ...dev, devHostname: bad }), null);
});
test('tenant content and metadata follow the resolved hostname and unpublished sites return 404', async () => {
  const fetcher = async url => {
    const hostname = decodeURIComponent(url.split('/').at(-3));
    if (!['a.b3.localhost', 'b.b3.localhost'].includes(hostname)) return { ok: false, status: 404 };
    return { ok: true, json: async () => ({ hostname, commerceEnabled: false, content: { schemaVersion: 3, identity: { name: hostname }, seo: { title: `SEO ${hostname}` } } }) };
  };
  const config = { nodeEnv: 'development', devHostname: 'a.b3.localhost' };
  const a = await fetchPublicWebsite('http://localhost/api', resolveRequestHostname('localhost:3000', config), fetcher);
  const b = await fetchPublicWebsite('http://localhost/api', resolveRequestHostname('b.b3.localhost:3000', config), fetcher);
  assert.equal(a.content.seo.title, 'SEO a.b3.localhost');
  assert.equal(b.content.identity.name, 'b.b3.localhost');
  for (const host of ['unknown.b3.localhost', 'unpublished.b3.localhost', 'localhost'])
    await assert.rejects(fetchPublicWebsite('http://localhost/api', host, fetcher), error => error.status === 404);
});
test('SSR public reads are anonymous no-store and never fall back to demo', async () => {
  const fixture = { hostname: 'a.b3.test', commerceEnabled: false, content: { schemaVersion: 3 } };
  const result = await fetchPublicWebsite('http://localhost:8013/api/v1', fixture.hostname, async (url, options) => {
    assert.equal(url, 'http://localhost:8013/api/v1/storefront/sites/a.b3.test/content/');
    assert.equal(options.cache, 'no-store');
    assert.equal(options.headers.Authorization, undefined);
    return { ok: true, json: async () => fixture };
  });
  assert.deepEqual(result, fixture);
  await assert.rejects(fetchPublicWebsite('http://localhost/api', 'unknown.test', async () => ({ ok: false, status: 404 })), error => error.status === 404);
});
test('repository preserves ETag, HTTP errors and uses discovered UUID for every operation', async () => {
  const scope = { companyId: 'company-a', websiteId: 'a-uuid' };
  const calls = [];
  const repository = createDjangoWebsiteRepository(async (path, options) => { calls.push({ path, options }); return { data: { revision: 3 }, etag: '"3"' }; });
  assert.equal((await repository.load(scope)).etag, '"3"');
  await repository.restore(scope, 'revision-id', 3);
  assert.equal(calls[1].path, '/websites/a-uuid/restore/');
  assert.equal(calls[1].options.headers['If-Match'], '"3"');
  for (const status of [401, 403, 404, 412, 428, 413, 429, 503]) {
    const error = Object.assign(new Error('Backend error'), { status, code: 'ERROR', fields: { 'banners.0.title': 'Invalid' } });
    const failed = createDjangoWebsiteRepository(async () => { throw error; });
    await assert.rejects(failed.saveDraft(scope, {}, 3), cause => cause === error);
  }
});
