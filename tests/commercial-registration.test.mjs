import test from 'node:test';
import assert from 'node:assert/strict';
import { createCommercialRegistration, consumeProofFragment } from '../src/services/commercialRegistration.mjs';

test('closed registration policy is read by hostname without sending administrative identity', async () => {
  const calls = [];
  const client = createCommercialRegistration({ baseUrl: 'http://localhost/api/v1', hostname: 'a.test', websiteId: 'A', fetchImpl: async (url, options) => { calls.push({ url, options }); return new Response(JSON.stringify({ websiteId: 'A', registrationEnabled: false, notice: null })); } });
  assert.equal((await client.policy()).registrationEnabled, false);
  assert.match(calls[0].url, /sites\/a.test\/registration-policy\/$/);
  assert.equal(calls[0].options.credentials, 'omit');
  assert.equal(calls[0].options.headers.Authorization, undefined);
});
test('proof fragment is removed before any request and is not moved to a query string', () => {
  const actions = [];
  const token = consumeProofFragment({ hash: '#token=one-use-secret', pathname: '/verificar-cuenta' }, { replaceState: (...args) => actions.push(args) });
  assert.equal(token, 'one-use-secret');
  assert.deepEqual(actions, [[null, '', '/verificar-cuenta']]);
});
test('existing identity login stays ephemeral and completion uses only explicit proof and bearer', async () => {
  const calls = [];
  const client = createCommercialRegistration({ baseUrl: 'http://localhost/api/v1', hostname: 'a.test', websiteId: 'A', fetchImpl: async (url, options) => { calls.push({ url, options }); return new Response(JSON.stringify(url.endsWith('/auth/token/') ? { access: 'identity-token' } : { status: 'COMPLETE' })); } });
  const identity = await client.existingIdentity('existing@test', 'existing-password');
  await client.complete({ token: 'proof', purpose: 'REGISTER' }, identity);
  assert.equal(calls[1].options.headers.Authorization, 'Bearer identity-token');
  assert.deepEqual(JSON.parse(calls[1].options.body), { token: 'proof', purpose: 'REGISTER' });
  assert.equal(calls.some(call => /select-company|register\//.test(call.url)), false);
});
test('wrong-tenant policy and proof errors remain actionable', async () => {
  const client = createCommercialRegistration({ baseUrl: 'http://localhost/api/v1', hostname: 'a.test', websiteId: 'A', fetchImpl: async () => new Response(JSON.stringify({ websiteId: 'B' })) });
  await assert.rejects(client.policy(), /empresa/);
  const failed = createCommercialRegistration({ baseUrl: 'http://localhost/api/v1', hostname: 'a.test', websiteId: 'A', fetchImpl: async () => new Response(JSON.stringify({ code: 'NOTICE_CHANGED', message: 'Revisa el aviso', fields: { noticeVersion: 'Obligatorio' } }), { status: 409 }) });
  await assert.rejects(failed.complete({ token: 'secret' }), error => error.status === 409 && error.code === 'NOTICE_CHANGED' && error.fields.noticeVersion === 'Obligatorio');
});
