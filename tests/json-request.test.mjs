import test from 'node:test';
import assert from 'node:assert/strict';
import { jsonRequest } from '../src/services/http/jsonRequest.mjs';

test('effect cleanup aborts an in-flight fetch without logging an application error', async () => {
  const controller = new AbortController();
  const logs = [];
  const pending = jsonRequest('/catalog', { signal: controller.signal }, {
    fetchImpl: (_url, { signal }) => new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(signal.reason), { once: true })),
    logError: (...values) => logs.push(values),
  });
  controller.abort();
  await assert.rejects(pending, error => error === controller.signal.reason && error.name === 'AbortError');
  assert.deepEqual(logs, []);
});
test('a request canceled before dispatch never calls fetch', async () => {
  const controller = new AbortController();
  controller.abort(new Error('Company changed'));
  let calls = 0;
  await assert.rejects(jsonRequest('/catalog', { signal: controller.signal }, { fetchImpl: () => { calls++; }, logError: () => assert.fail('Cancellation must not be logged') }), error => error === controller.signal.reason);
  assert.equal(calls, 0);
});
test('cancellation while reading JSON propagates instead of resolving an empty result', async () => {
  const controller = new AbortController();
  const pending = jsonRequest('/catalog', { signal: controller.signal }, {
    fetchImpl: async () => ({ ok: true, json: async () => { controller.abort(); throw controller.signal.reason; } }),
    logError: () => assert.fail('Cancellation must not be logged'),
  });
  await assert.rejects(pending, { name: 'AbortError' });
});
test('HTTP errors keep status, code, fields and concurrency headers', async () => {
  for (const status of [401, 403, 404, 412, 428, 503]) {
    const logs = [];
    await assert.rejects(jsonRequest('/catalog', {}, {
      fetchImpl: async () => new Response(JSON.stringify({ message: 'Acceso denegado', code: 'DENIED', fields: { product: 'Invalid' } }), { status, headers: { ETag: '"revision"', 'Retry-After': '5' } }),
      logError: (...values) => logs.push(values),
    }), error => error.status === status && error.code === 'DENIED' && error.fields.product === 'Invalid' && error.etag === '"revision"' && error.retryAfter === '5');
    assert.equal(logs.length, 1);
  }
});
test('JSON data and withResponse remain compatible with existing consumers', async () => {
  const body = { results: [], total: 0 };
  const options = { fetchImpl: async () => new Response(JSON.stringify(body), { headers: { ETag: '"tag"' } }) };
  assert.deepEqual(await jsonRequest('/catalog', {}, options), body);
  assert.deepEqual(await jsonRequest('/catalog', { withResponse: true }, options), { data: body, etag: '"tag"', status: 200 });
  const failure = new TypeError('Network unavailable');
  let logged;
  await assert.rejects(jsonRequest('/catalog', {}, { fetchImpl: async () => { throw failure; }, logError: (_label, error) => { logged = error; } }), error => error === failure);
  assert.equal(logged, failure);
});
