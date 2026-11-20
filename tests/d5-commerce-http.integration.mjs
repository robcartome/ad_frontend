import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import http from 'node:http';
import { createCommercialSession } from '../src/services/commercialSession.mjs';

const context = JSON.parse(await readFile('../.tools/b4c-http-context.json', 'utf8'));
assert.equal(context.database, 'test_apudig_b4c_http');
assert.equal(context.backend, 'http://127.0.0.1:8770/api/v1');
const scenario = process.argv[2] || 'active';
assert.ok(['active', 'changed', 'disabled'].includes(scenario));
const results = [];
const memory = () => { const data = new Map(); return { getItem: key => data.get(key) || null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) }; };
const account = host => createCommercialSession({ baseUrl: context.backend, hostname: host, websiteId: host === context.hostA ? context.websiteA : context.websiteB, storage: memory() });
const client = account(context.hostA);
await client.login(context.auth.customer.email, context.auth.customer.password);
async function check(name, operation) { await operation(); results.push({ name, passed: true }); }
const statePath = '../.tools/d5-request-context.json';
async function api(path, token, body, method = body ? 'POST' : 'GET', extra = {}) {
  const response = await fetch(context.backend + path, { method, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}), ...extra }, ...(body ? { body: JSON.stringify(body) } : {}) });
  return { response, data: await response.json() };
}
const publicSite = host => `/storefront/sites/${host}/`;
if (scenario === 'active') {
  const product = (await api(publicSite(context.hostA) + `products/${context.productA}/`)).data.product;
  const items = [{ productId: product.id, unitId: product.unitId, quantity: 1 }];
  let offer, row;
  await check('persistent admin opt-in enables only A and does not enable registration', async () => {
    assert.equal((await api(publicSite(context.hostA) + 'content/')).data.commerceEnabled, true);
    assert.equal((await api(publicSite(context.hostB) + 'content/')).data.commerceEnabled, false);
    assert.equal((await api(publicSite(context.hostA) + 'registration-policy/')).data.registrationEnabled, false);
    assert.equal((await client.profile()).capabilities.prepareOrders, true);
  });
  await check('verified retail confirms and persists exactly one request with explicit consent and idempotency', async () => {
    const notice = await client.privacy();
    await client.acceptPrivacy(notice.version);
    offer = await client.cartReview(items);
    assert.equal(offer.total, '70.80');
    const confirmed = await client.cartReview(items, offer.offerFingerprint);
    assert.equal(confirmed.confirmed, true);
    const key = crypto.randomUUID();
    row = await client.prepareRequest(items, offer.offerFingerprint, 'Synthetic', key, true);
    const replay = await client.prepareRequest(items, offer.offerFingerprint, 'Synthetic', key, true);
    assert.equal(row.id, replay.id);
    assert.equal(row.status, 'PREPARED');
    assert.match(row.whatsappUrl, /^https:\/\/wa\.me\/51900000001\?text=/);
    assert.equal(row.whatsappUrl.includes(context.auth.customer.email), false);
    await assert.rejects(client.prepareRequest(items, offer.offerFingerprint, 'Changed', key, true), error => error.status === 409);
    assert.equal((await client.requests()).count, 1);
    assert.equal((await client.requestDetail(row.id)).status, 'PREPARED');
    await writeFile(statePath, JSON.stringify({ id: row.id, items, fingerprint: offer.offerFingerprint }));
  });
  await check('B cannot obtain A request even for the same identity; ERP/CMS and anonymous cannot prepare', async () => {
    const b = account(context.hostB);
    await b.login(context.auth.customer.email, context.auth.customer.password);
    assert.equal((await b.requests()).count, 0);
    await assert.rejects(b.requestDetail(row.id), error => error.status === 404);
    const path = publicSite(context.hostA) + 'account/order-requests/';
    assert.equal((await api(path, null, {})).response.status, 401);
    assert.ok([401, 403].includes((await api(path, context.auth.editor.token, {})).response.status));
  });
  await check('enabled SSR routes contain no private customer credentials or request snapshots', async () => {
    for (const path of ['/', '/shop', `/shop/${context.productA}`, '/cart', '/cuenta/carrito', '/cuenta/solicitudes']) {
      const result = await new Promise((resolve, reject) => {
        const req = http.get('http://127.0.0.1:8771' + path, { headers: { Host: context.hostA + ':8771' } }, response => { let body = ''; response.on('data', value => { body += value; }); response.on('end', () => resolve({ status: response.statusCode, body })); }); req.on('error', reject);
      });
      assert.equal(result.status, 200, path);
      assert.equal(result.body.includes(context.auth.customer.password), false);
      assert.equal(result.body.includes(context.auth.customer.email), false);
      assert.equal(result.body.includes(row.reference), false);
    }
  });
} else {
  const state = JSON.parse(await readFile(statePath, 'utf8'));
  if (scenario === 'changed') {
    await check('price change invalidates old confirmation and withholds historical stale WhatsApp link', async () => {
      await assert.rejects(client.cartReview(state.items, state.fingerprint), error => error.status === 409);
      const detail = await client.requestDetail(state.id);
      assert.equal(detail.whatsappUrl, null);
      assert.equal(detail.reviewRequired, true);
      assert.equal(detail.status, 'PREPARED');
      assert.equal((await client.cartReview(state.items)).total, '84.96');
    });
  } else {
    await check('admin opt-out closes creation immediately and cancellation/history remain private', async () => {
      const path = `/websites/${context.websiteA}/catalog-settings/`;
      const current = await api(path, context.auth.admin.token);
      const result = await api(path, context.auth.admin.token, { commerceEnabled: false }, 'PATCH', { 'If-Match': current.response.headers.get('ETag') });
      assert.equal(result.response.status, 200);
      assert.equal((await client.profile()).capabilities.prepareOrders, false);
      const offer = await client.cartReview(state.items);
      await assert.rejects(client.prepareRequest(state.items, offer.offerFingerprint, '', crypto.randomUUID(), true), error => error.status === 403);
      assert.equal((await client.requestDetail(state.id)).whatsappUrl, null);
      assert.equal((await client.cancelRequest(state.id)).status, 'CANCELLED');
      assert.equal((await client.requests()).count, 1);
    });
  }
}
await writeFile(`../.tools/d5-http-${scenario}.json`, JSON.stringify({ database: context.database, total: results.length, results, externalSMTP: 'disabled', whatsapp: 'server URL validated; not opened or sent', realDataWrites: false }, null, 2));
console.log(`${results.length} D5 ${scenario} checks passed`);
