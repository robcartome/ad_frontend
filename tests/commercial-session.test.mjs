import test from 'node:test';
import assert from 'node:assert/strict';
import { commercialSessionKey, createCommercialSession } from '../src/services/commercialSession.mjs';
import { createCommercialAccountsRepository } from '../src/services/commercialAccountsRepository.mjs';

const config = { baseUrl: 'http://localhost:8000/api/v1', hostname: 'a.test', websiteId: 'website-A' };
const profile = { context: 'commercial', websiteId: 'website-A', contactVerified: true, user: { name: 'Customer' } };
const tokens = { context: 'commercial', websiteId: 'website-A', access: 'commercial-access', refresh: 'commercial-refresh' };
function store() {
  const values = new Map([['access_token', 'labor-token']]);
  return { values, getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
}
function transport(responses, calls) {
  return async (url, options) => {
    calls.push({ url, options });
    const response = responses.shift();
    if (response instanceof Error) throw response;
    return new Response(JSON.stringify(response?.data || {}), { status: response?.status || 200, headers: { 'Content-Type': 'application/json' } });
  };
}

test('commercial login uses existing credentials endpoint and separate origin-local storage', async () => {
  const storage = store(), calls = [];
  const client = createCommercialSession({ ...config, storage, fetchImpl: transport([{ data: tokens }, { data: profile }], calls) });
  assert.deepEqual(await client.login('customer@test', 'secret'), profile);
  assert.match(calls[0].url, /\/auth\/token\/$/);
  assert.deepEqual(JSON.parse(calls[0].options.body), { email: 'customer@test', password: 'secret', context: 'commercial', hostname: 'a.test' });
  assert.equal(storage.getItem('access_token'), 'labor-token');
  assert.equal(JSON.parse(storage.getItem(commercialSessionKey('website-A'))).access, tokens.access);
  assert.notEqual(commercialSessionKey('website-A'), commercialSessionKey('website-B'));
  for (const { options } of calls) { assert.equal(options.credentials, 'omit'); assert.equal(options.cache, 'no-store'); }
  assert.equal(calls[1].options.headers.Authorization, 'Bearer commercial-access');
});

test('expired access refreshes in its original hostname and purpose without company selection', async () => {
  const storage = store(), calls = [];
  storage.setItem(commercialSessionKey('website-A'), JSON.stringify(tokens));
  const client = createCommercialSession({ ...config, storage, fetchImpl: transport([{ status: 401 }, { data: { ...tokens, access: 'renewed', refresh: undefined } }, { data: profile }], calls) });
  assert.deepEqual(await client.profile(), profile);
  assert.deepEqual(JSON.parse(calls[1].options.body), { refresh_token: tokens.refresh, hostname: 'a.test' });
  assert.equal(calls[2].options.headers.Authorization, 'Bearer renewed');
  assert.equal(calls.some(call => /select-company/.test(call.url)), false);
  assert.equal(JSON.parse(storage.getItem(commercialSessionKey('website-A'))).refresh, tokens.refresh);
});

test('revoked refresh clears only commercial storage and propagates structured failure', async () => {
  const storage = store();
  storage.setItem(commercialSessionKey('website-A'), JSON.stringify(tokens));
  const client = createCommercialSession({ ...config, storage, fetchImpl: transport([{ status: 401 }, { status: 403, data: { code: 'COMMERCIAL_ACCESS_DENIED', message: 'Revocada' } }], []) });
  await assert.rejects(client.profile(), error => error.status === 403 && error.code === 'COMMERCIAL_ACCESS_DENIED');
  assert.equal(client.hasSession(), false);
  assert.equal(storage.getItem('access_token'), 'labor-token');
});

test('logout requires actual server revocation and preserves the labor context', async () => {
  const storage = store(), calls = [];
  storage.setItem(commercialSessionKey('website-A'), JSON.stringify(tokens));
  const client = createCommercialSession({ ...config, storage, fetchImpl: transport([new Error('offline'), { data: {} }], calls) });
  await assert.rejects(client.logout(), /offline/);
  assert.equal(client.hasSession(), true);
  await client.logout();
  assert.equal(client.hasSession(), false);
  assert.equal(storage.getItem('access_token'), 'labor-token');
  assert.equal(JSON.parse(calls[1].options.body).refresh_token, tokens.refresh);
});

test('identity exchange is explicit and rejects another website response', async () => {
  const storage = store(), calls = [];
  const client = createCommercialSession({ ...config, storage, fetchImpl: transport([{ data: { ...tokens, websiteId: 'website-B' } }], calls) });
  await assert.rejects(client.enterFromIdentity('existing-identity'), /empresa/);
  assert.equal(calls[0].options.headers.Authorization, 'Bearer existing-identity');
  assert.deepEqual(JSON.parse(calls[0].options.body), {});
  assert.equal(client.hasSession(), false);
});

test('admin approval sends scoped account and revision, without changing its price list', async () => {
  const calls = [];
  const repo = createCommercialAccountsRepository(async (path, options) => { calls.push({ path, options }); return {}; });
  await repo.approve('website-A', { id: 'account-A', etag: '"account-opaque"' }, false);
  assert.equal(calls[0].path, '/websites/website-A/commercial-accounts/account-A/');
  assert.equal(calls[0].options.headers['If-Match'], '"account-opaque"');
  assert.deepEqual(JSON.parse(calls[0].options.body), { wholesaleApproved: false });
});

test('cart review uses the commercial session and only server confirmation authorizes the summary', async () => {
  const storage = store(), calls = [];
  storage.setItem(commercialSessionKey('website-A'), JSON.stringify(tokens));
  const offer = { websiteId: 'website-A', items: [], offerFingerprint: 'a'.repeat(64), ordersEnabled: false, confirmed: false };
  const client = createCommercialSession({ ...config, storage, fetchImpl: transport([{ data: offer }, { data: { ...offer, confirmed: true } }], calls) });
  const items = [{ productId: 'product', unitId: 'unit', quantity: 2 }];
  assert.equal((await client.cartReview(items)).confirmed, false);
  assert.equal((await client.cartReview(items, offer.offerFingerprint)).confirmed, true);
  assert.match(calls[0].url, /account\/cart\/quote\/$/);
  assert.match(calls[1].url, /account\/cart\/confirm\/$/);
  assert.equal(calls[0].options.headers.Authorization, 'Bearer commercial-access');
  assert.deepEqual(JSON.parse(calls[1].options.body), { items, offerFingerprint: offer.offerFingerprint });
});

test('request retries after refresh keep the same idempotency key and explicit sharing decision', async () => {
  const storage = store(), calls = [];
  storage.setItem(commercialSessionKey('website-A'), JSON.stringify(tokens));
  const client = createCommercialSession({ ...config, storage, fetchImpl: transport([{ status: 401 }, { data: { ...tokens, access: 'renewed', refresh: undefined } }, { data: { websiteId: 'website-A', reference: 'synthetic-reference', whatsappUrl: null } }], calls) });
  await client.prepareRequest([], 'a'.repeat(64), 'Synthetic note', 'same-key', true);
  assert.equal(calls[0].options.headers['Idempotency-Key'], 'same-key');
  assert.equal(calls[2].options.headers['Idempotency-Key'], 'same-key');
  assert.equal(JSON.parse(calls[2].options.body).shareConfirmed, true);
  assert.equal(calls[2].options.headers.Authorization, 'Bearer renewed');
  assert.equal(storage.getItem('access_token'), 'labor-token');
});
