import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeProduct, normalizeCategory, productOffer, categoryProducts } from '../src/lib/commerce/catalog.mjs';
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

test('Category rails filter the full selection without inventing offers or changing source order', () => {
  const products = [
    { id: 'a', category: 'tools', price: 10, originalPrice: null },
    { id: 'b', category: 'paint', price: null, originalPrice: 100 },
    { id: 'c', category: 'tools', price: 15, originalPrice: 20 },
    { id: 'd', category: 'paint', price: 25, originalPrice: 25 },
  ];
  assert.deepEqual(categoryProducts(products).map(product => product.id), ['c', 'a', 'b', 'd']);
  assert.deepEqual(categoryProducts(products, 'tools').map(product => product.id), ['c', 'a']);
  assert.deepEqual(categoryProducts(products, 'paint').map(product => product.id), ['b', 'd']);
  assert.deepEqual(categoryProducts(products, 'missing'), []);
  assert.deepEqual(products.map(product => product.id), ['a', 'b', 'c', 'd']);
  assert.equal(productOffer(categoryProducts(products, 'paint')[0]), null);
});

test('Public service scopes and encodes requests without admin credentials and maps pagination', async () => {
  let called;
  const controller = new AbortController();
  const service = createStorefrontProductsService({ baseUrl: 'https://example.com/api/v1/', hostname: 'a.example.com', websiteId: 'site-a', fetchImpl: async (url, options) => {
    called = { url, options };
    return { ok: true, json: async () => ({ websiteId: 'site-a', count: 42, limit: 6, offset: 12, facets: { categories: [], brands: [] }, results: [{ id: 1, name: 'Taladro', price: '20', currency: 'PEN', unitId: 'unit-a' }] }) };
  } });
  const page = await service.list({ search: 'broca & acero', category: 'a/b', limit: 6, offset: 12, signal: controller.signal });
  assert.equal(called.url.pathname, '/api/v1/storefront/sites/a.example.com/products/');
  assert.equal(called.url.searchParams.get('search'), 'broca & acero');
  assert.equal(called.url.searchParams.get('offset'), '12');
  assert.equal(called.options.credentials, 'omit');
  assert.equal(called.options.cache, 'no-store');
  assert.equal(called.options.signal.aborted, false);
  controller.abort();
  assert.equal(called.options.signal.aborted, true);
  assert.deepEqual(called.options.headers, { Accept: 'application/json' });
  assert.equal(page.count, 42);
  assert.equal(page.results[0].price, 20);
});

test('Public service rejects cross-store data, malformed pages and HTTP errors without demo fallback', async () => {
  for (const body of [{ websiteId: 'other', count: 0, results: [] }, { websiteId: 'a', results: [] }, { websiteId: 'a', count: 0, results: [{}] }]) {
    const service = createStorefrontCategoriesService({ baseUrl: 'https://example.com', hostname: 'a.example.com', websiteId: 'a', fetchImpl: async () => ({ ok: true, json: async () => body }) });
    await assert.rejects(service.list());
  }
  const service = createStorefrontProductsService({ baseUrl: 'https://example.com', hostname: 'a.example.com', websiteId: 'a', fetchImpl: async () => ({ ok: false, status: 503, json: async () => ({ code: 'UNAVAILABLE', message: 'Temporalmente no disponible' }) }) });
  await assert.rejects(service.list(), error => error.status === 503 && error.code === 'UNAVAILABLE');
});

test('Product details validate identity and categories support paginated responses', async () => {
  const config = { baseUrl: 'https://example.com', hostname: 'a.example.com', websiteId: 'a', fetchImpl: async () => ({ ok: true, json: async () => ({ websiteId: 'a', product: { id: 3, name: 'Taladro', currency: 'PEN', unitId: 'unit-a', price: null, saleUnits: [{ unitId: 'unit-a', unit: 'Unidad', price: null }] } }) }) };
  const service = createStorefrontProductsService(config);
  assert.equal((await service.detail(3)).id, '3');
  await assert.rejects(service.detail(4), error => error.status === 502);
  const categories = createStorefrontCategoriesService({ ...config, fetchImpl: async () => ({ ok: true, json: async () => ({ websiteId: 'a', count: 1, limit: 100, offset: 0, results: [{ id: 3, name: 'Herramientas' }] }) }) });
  assert.equal((await categories.list()).results[0].id, '3');
});

test('Home category selection requests featured products from that tenant and category rather than filtering the initial page', async () => {
  const requested = [];
  const service = createStorefrontProductsService({ baseUrl: 'https://example.com/api/v1', hostname: 'a.example.com', websiteId: 'A', fetchImpl: async (url, options) => {
    requested.push({ url, options });
    const category = url.searchParams.get('category');
    return { ok: true, json: async () => ({ websiteId: 'A', count: 1, limit: 12, offset: 0, results: [{ id: category + '-featured', name: 'Featured', unitId: 'unit', currency: 'PEN', price: null }], facets: { categories: [], brands: [] } }) };
  } });
  for (const category of ['tools', 'paint']) {
    const page = await service.list({ category: [category], featured: true, ordering: 'featured', limit: 12 });
    assert.equal(page.results[0].id, category + '-featured');
    assert.equal(page.results[0].price, null);
  }
  for (const { url, options } of requested) {
    assert.equal(url.pathname, '/api/v1/storefront/sites/a.example.com/products/');
    assert.equal(url.searchParams.get('featured'), 'true');
    assert.equal(url.searchParams.get('limit'), '12');
    assert.equal(options.credentials, 'omit');
    assert.equal(options.headers.Authorization, undefined);
  }
});
