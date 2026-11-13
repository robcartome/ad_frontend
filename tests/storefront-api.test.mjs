import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeProduct, normalizeCategory, productOffer } from '../src/lib/commerce/catalog.mjs';
import { createStorefrontProductsService } from '../src/services/storefrontProductsService.mjs';
import { createStorefrontCategoriesService } from '../src/services/storefrontCategoriesService.mjs';

test('Public DTO handles decimal strings, missing prices and strips private fields', () => {
  const product = normalizeProduct({ id: 12, name: 'Taladro', price: '189.90', original_price: '239.90', category: { id: 4 }, cost: 50, warehouses: ['private'], image_url: 'https://example.com/photo.jpg' });
  assert.equal(product.price, 189.9);
  assert.equal(product.category, '4');
  assert.equal(product.cost, undefined);
  assert.equal(product.warehouses, undefined);
  assert.deepEqual(productOffer(product), { percent: 20, savings: 50 });
  for (const price of [null, undefined, '', ' ', -1, 'invalid', Infinity, false]) {
    const result = normalizeProduct({ id: 1, name: 'PVC', price, original_price: 20 });
    assert.equal(result.price, null);
    assert.equal(productOffer(result), null);
  }
  assert.equal(productOffer({ price: 0, originalPrice: 20 }).percent, 100);
  assert.equal(productOffer({ price: 20, originalPrice: 10 }), null);
  assert.equal(normalizeProduct({ id: 1, name: 'PVC', image_url: 'javascript:alert(1)' }).imageUrl, null);
  assert.equal(normalizeCategory({ id: 1, name: 'Herramientas', parent_id: 4 }).parentId, '4');
});

test('Public service scopes and encodes requests without admin credentials and maps pagination', async () => {
  let called;
  const controller = new AbortController();
  const service = createStorefrontProductsService({ baseUrl: 'https://example.com/api/public/', storeId: 'store/a', fetchImpl: async (url, options) => {
    called = { url, options };
    return { ok: true, json: async () => ({ store_id: 'store/a', count: 42, results: [{ id: 1, name: 'Taladro', price: '20' }] }) };
  } });
  const page = await service.list({ search: 'broca & acero', category: 'a/b', limit: 6, offset: 12, signal: controller.signal });
  assert.equal(called.url.pathname, '/api/public/stores/store%2Fa/products/');
  assert.equal(called.url.searchParams.get('search'), 'broca & acero');
  assert.equal(called.url.searchParams.get('offset'), '12');
  assert.equal(called.options.credentials, 'omit');
  assert.equal(called.options.cache, 'no-store');
  assert.equal(called.options.signal, controller.signal);
  assert.deepEqual(called.options.headers, { Accept: 'application/json' });
  assert.equal(page.count, 42);
  assert.equal(page.results[0].price, 20);
});

test('Public service rejects cross-store data, malformed pages and HTTP errors without demo fallback', async () => {
  for (const body of [{ store_id: 'other', count: 0, results: [] }, { store_id: 'a', results: [] }, { store_id: 'a', count: 0, results: [{}] }]) {
    const service = createStorefrontCategoriesService({ baseUrl: 'https://example.com', storeId: 'a', fetchImpl: async () => ({ ok: true, json: async () => body }) });
    await assert.rejects(service.list());
  }
  const service = createStorefrontProductsService({ baseUrl: 'https://example.com', storeId: 'a', fetchImpl: async () => ({ ok: false, status: 503 }) });
  await assert.rejects(service.list(), /503/);
});

test('Product details validate identity and categories support paginated responses', async () => {
  const config = { baseUrl: 'https://example.com', storeId: 'a', fetchImpl: async () => ({ ok: true, json: async () => ({ store_id: 'a', product: { id: 3, name: 'Taladro' } }) }) };
  const service = createStorefrontProductsService(config);
  assert.equal((await service.detail(3)).id, '3');
  await assert.rejects(service.detail(4), /Identificador/);
  const categories = createStorefrontCategoriesService({ ...config, fetchImpl: async () => ({ ok: true, json: async () => ({ store_id: 'a', count: 1, results: [{ id: 3, name: 'Herramientas' }] }) }) });
  assert.equal((await categories.list()).results[0].id, '3');
});
