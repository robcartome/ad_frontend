import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import http from 'node:http';
import { createCommercialSession } from '../src/services/commercialSession.mjs';

const context = JSON.parse(await readFile('../.tools/b4c-http-context.json', 'utf8'));
assert.equal(context.database, 'test_apudig_b4c_http');
assert.equal(context.backend, 'http://127.0.0.1:8770/api/v1');
const mode = process.argv[2] || 'before';
assert.ok(['before', 'after'].includes(mode));
const data = new Map();
const client = createCommercialSession({ baseUrl: context.backend, hostname: context.hostA, websiteId: context.websiteA, storage: { getItem: key => data.get(key) || null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) } });
await client.login(context.auth.customer.email, context.auth.customer.password);
const results = [];
async function check(name, action) { await action(); results.push({ name, passed: true }); }
const publicData = async path => (await fetch(context.backend + path)).json();
const beforePath = '../.tools/b4d3-offer-before.json';
if (mode === 'before') {
  const product = (await publicData(`/storefront/sites/${context.hostA}/products/${context.productA}/`)).product;
  const items = [{ productId: product.id, unitId: product.unitId, quantity: 1 }];
  let offer;
  await check('real verified session receives and confirms current offer with orders disabled', async () => {
    offer = await client.cartReview(items);
    assert.equal(offer.total, '70.80');
    assert.equal(offer.ordersEnabled, false);
    assert.equal((await client.cartReview(items, offer.offerFingerprint)).confirmed, true);
    const published = await publicData(`/storefront/sites/${context.hostA}/content/`);
    await writeFile(beforePath, JSON.stringify({ items, fingerprint: offer.offerFingerprint, revision: published.revision }));
  });
  await check('price and customer tampering fail without altering the selected cart', async () => {
    await assert.rejects(client.cartReview([{ ...items[0], price: '0.01' }]), error => error.status === 400);
    await assert.rejects(client.cartReview([{ ...items[0], quantity: true }]), error => error.status === 400);
    assert.equal(items[0].quantity, 1);
  });
  await check('registration is closed and no provider is simulated as real delivery', async () => {
    const policy = await publicData(`/storefront/sites/${context.hostA}/registration-policy/`);
    assert.equal(policy.registrationEnabled, false);
    assert.equal(policy.notice, null);
    const response = await fetch(`${context.backend}/storefront/sites/${context.hostA}/registrations/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'closed@integration.invalid', name: 'Synthetic', noticeVersion: 'not-configured', consent: true }) });
    assert.equal(response.status, 503);
    assert.equal((await response.json()).code, 'REGISTRATION_DISABLED');
  });
  await check('own request history is empty and creation stays blocked without side effects', async () => {
    const history = await client.requests();
    assert.equal(history.ordersEnabled, false);
    assert.equal(history.count, 0);
    await assert.rejects(client.prepareRequest(items, offer.offerFingerprint, '', crypto.randomUUID(), true), error => error.status === 403 && error.code === 'COMMERCE_DISABLED');
    assert.equal((await client.requests()).count, 0);
    await assert.rejects(client.privacy(), error => error.status === 503 && error.code === 'PRIVACY_UNAVAILABLE');
  });
  await check('account/cart and registration SSR contain no private account information', async () => {
    for (const path of ['/cuenta/carrito', '/registro', '/verificar-cuenta', '/recuperar-cuenta']) {
      const response = await new Promise((resolve, reject) => {
        const request = http.get(`http://127.0.0.1:8771${path}`, { headers: { Host: `${context.hostA}:8771` } }, response => { let body = ''; response.on('data', chunk => { body += chunk; }); response.on('end', () => resolve({ status: response.statusCode, body })); });
        request.on('error', reject);
      });
      assert.equal(response.status, 200, path);
      assert.equal(response.body.includes(context.auth.customer.email), false);
      assert.equal(response.body.includes(context.auth.customer.password), false);
    }
  });
} else {
  const before = JSON.parse(await readFile(beforePath, 'utf8'));
  await check('live ERP price change invalidates prior confirmation without republishing CMS', async () => {
    await assert.rejects(client.cartReview(before.items, before.fingerprint), error => error.status === 409 && error.code === 'OFFER_CHANGED');
    const updated = await client.cartReview(before.items);
    assert.equal(updated.total, '84.96');
    assert.equal((await client.cartReview(before.items, updated.offerFingerprint)).confirmed, true);
    const published = await publicData(`/storefront/sites/${context.hostA}/content/`);
    assert.equal(published.revision, before.revision);
    assert.equal(published.commerceEnabled, false);
  });
}
await writeFile(`../.tools/b4d23-http-${mode}.json`, JSON.stringify({ database: context.database, results, total: results.length, emailDelivery: 'not attempted; disabled', ordersEnabled: false }, null, 2));
console.log(`${results.length} D2/D3 ${mode} HTTP checks passed`);
