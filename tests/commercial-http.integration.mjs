// Real local Django/PostgreSQL + Next, no authentication or HTTP mocks.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import http from 'node:http';
import { createCommercialSession } from '../src/services/commercialSession.mjs';

const context = JSON.parse(await readFile(process.argv[2] || '../.tools/b4c-http-context.json', 'utf8'));
assert.equal(context.database, 'test_apudig_b4c_http');
assert.equal(context.backend, 'http://127.0.0.1:8770/api/v1');
const results = [];
const memory = () => { const values = new Map(); return { getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key), values }; };
const storageA = memory(), storageB = memory();
const clientA = createCommercialSession({ baseUrl: context.backend, hostname: context.hostA, websiteId: context.websiteA, storage: storageA });
const clientB = createCommercialSession({ baseUrl: context.backend, hostname: context.hostB, websiteId: context.websiteB, storage: storageB });
const profilePath = host => `/storefront/sites/${host}/account/`;
const customer = context.auth.customer;
async function api(path, { token, method = 'GET', body, headers = {} } = {}) {
  const response = await fetch(context.backend + path, { method, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...headers }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  const data = response.status === 204 ? null : await response.json();
  return { status: response.status, data, etag: response.headers.get('ETag'), cors: response.headers.get('Access-Control-Allow-Origin') };
}
function next(path, hostname) {
  return new Promise((resolve, reject) => {
    const request = http.get(`http://127.0.0.1:8771${path}`, { headers: { Host: `${hostname}:8771` } }, response => { let body = ''; response.on('data', chunk => { body += chunk; }); response.on('end', () => resolve({ status: response.statusCode, body })); });
    request.on('error', reject);
  });
}
async function check(name, action) { await action(); results.push({ name, passed: true }); }
const tokens = storage => JSON.parse([...storage.values.values()][0]);

await check('SSR account routes contain no customer PII or JWT and unknown hosts remain 404', async () => {
  for (const path of ['/cuenta', '/cuenta/perfil', '/cuenta/solicitudes', '/admin', '/login', '/catalog', '/admin/catalog_admin', '/shop']) {
    const response = await next(path, context.hostA);
    assert.equal(response.status, 200, path);
    assert.equal(response.body.includes(customer.email), false);
    assert.equal(response.body.includes(customer.password), false);
  }
  assert.equal((await next('/cuenta', 'unknown.b4d1.localhost')).status, 404);
});
await check('customer without employee membership enters real account A', async () => {
  const profile = await clientA.login(customer.email, customer.password);
  assert.equal(profile.websiteId, context.websiteA);
  assert.equal(profile.contactVerified, true);
  assert.equal(profile.capabilities.prepareOrders, false);
  assert.equal(profile.capabilities.registration, false);
  for (const field of ['roles', 'permissions', 'customerId', 'priceList', 'warehouse', 'supplier']) assert.equal(JSON.stringify(profile).includes(field), false);
});
await check('commercial tokens cannot access labor catalog, CMS or company selection', async () => {
  const token = tokens(storageA).access;
  for (const path of ['/catalog/products/', '/websites/current/', '/auth/me/']) assert.ok([401, 403].includes((await api(path, { token })).status));
  assert.ok([401, 403].includes((await api('/auth/select-company/', { token, method: 'POST', body: { company_id: context.websiteA } })).status));
  assert.equal((await api(profilePath(context.hostA), { token: context.auth.worker.token })).status, 401);
});
await check('A and B are independent; cross-domain refresh and profile are denied', async () => {
  const profileB = await clientB.login(customer.email, customer.password);
  assert.equal(profileB.websiteId, context.websiteB);
  const tokenA = tokens(storageA);
  assert.equal((await api(profilePath(context.hostB), { token: tokenA.access })).status, 401);
  assert.equal((await api('/auth/refresh/', { method: 'POST', body: { refresh: tokenA.refresh, hostname: context.hostB } })).status, 401);
  const switched = await api(profilePath(context.hostB) + 'session/', { token: tokenA.access, method: 'POST', body: {} });
  assert.equal(switched.status, 200);
  assert.equal(switched.data.websiteId, context.websiteB);
});
await check('real refresh preserves commercial purpose and hostname', async () => {
  const renewed = await api('/auth/refresh/', { method: 'POST', body: { refresh_token: tokens(storageA).refresh, hostname: context.hostA } });
  assert.equal(renewed.status, 200);
  assert.equal(renewed.data.context, 'commercial');
  assert.equal((await api(profilePath(context.hostA), { token: renewed.data.access })).status, 200);
  assert.ok([401, 403].includes((await api('/catalog/products/', { token: renewed.data.access })).status));
});
await check('admin approval/revocation is live with ETag; CMS cannot administer accounts', async () => {
  const path = `/websites/${context.websiteA}/commercial-accounts/${context.commercialAccounts.customerA}/`;
  const row = await api(path, { token: context.auth.admin.token });
  assert.equal(row.status, 200);
  const approved = await api(path, { token: context.auth.admin.token, method: 'PATCH', headers: { 'If-Match': row.etag }, body: { wholesaleApproved: true } });
  assert.equal(approved.status, 200);
  assert.equal((await clientA.profile()).wholesaleApproved, true);
  const conflict = await api(path, { token: context.auth.admin.token, method: 'PATCH', headers: { 'If-Match': row.etag }, body: { wholesaleApproved: false } });
  assert.equal(conflict.status, 412);
  const revoked = await api(path, { token: context.auth.admin.token, method: 'PATCH', headers: { 'If-Match': approved.etag }, body: { wholesaleApproved: false } });
  assert.equal(revoked.status, 200);
  assert.equal((await clientA.profile()).wholesaleApproved, false);
  assert.equal((await api(`/websites/${context.websiteA}/commercial-accounts/`, { token: context.auth.editor.token })).status, 403);
});
await check('existing worker login/catalog/CMS contracts still work', async () => {
  const worker = context.auth.worker;
  const legacy = await api('/auth/token/', { method: 'POST', body: { email: worker.email, password: worker.password } });
  assert.equal(legacy.status, 200);
  assert.ok(Array.isArray(legacy.data.companies));
  assert.equal((await api('/catalog/products/', { token: worker.token })).status, 200);
  assert.equal((await api('/websites/current/', { token: context.auth.admin.token })).status, 200);
  const noMembership = await api('/auth/token/', { method: 'POST', body: { email: customer.email, password: customer.password } });
  assert.equal(noMembership.status, 200);
  assert.deepEqual(noMembership.data.companies, []);
});
await check('real CORS allowlist distinguishes local integration from unknown origin', async () => {
  const allowed = `http://${context.hostA}:8771`;
  assert.equal((await api(profilePath(context.hostA), { token: tokens(storageA).access, headers: { Origin: allowed } })).cors, allowed);
  assert.equal((await api(profilePath(context.hostA), { token: tokens(storageA).access, headers: { Origin: 'https://untrusted.example.test' } })).cors, null);
});
await check('server logout invalidates A access and refresh while B remains authorized', async () => {
  const old = tokens(storageA);
  await clientA.logout();
  assert.equal((await api(profilePath(context.hostA), { token: old.access })).status, 401);
  assert.equal((await api('/auth/refresh/', { method: 'POST', body: { refresh: old.refresh, hostname: context.hostA } })).status, 401);
  assert.equal((await clientB.profile()).websiteId, context.websiteB);
});
await check('registration and commerce remain disabled without creating requests', async () => {
  const published = await api(`/storefront/sites/${context.hostA}/content/`);
  assert.equal(published.data.commerceEnabled, false);
  const cart = await next('/cart', context.hostA);
  assert.equal(cart.status, 200);
  assert.equal(cart.body.includes('Mi carrito'), true);
  assert.equal(cart.body.includes('sf-cart-page'), true);
  assert.equal(cart.body.includes('Las cotizaciones comerciales estaran disponibles proximamente'), false);
});
await writeFile(process.argv[3] || '../.tools/b4d1-http.json', JSON.stringify({ database: context.database, type: 'real isolated HTTP; synthetic verification only, no email delivery', results, total: results.length, realRegistration: false, commerceEnabled: false }, null, 2));
console.log(`${results.length} commercial HTTP checks passed`);
