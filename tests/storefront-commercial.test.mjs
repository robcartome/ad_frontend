import test from 'node:test';
import assert from 'node:assert/strict';
import { createStorefrontProductsService } from '../src/services/storefrontProductsService.mjs';
import { createStorefrontCategoriesService } from '../src/services/storefrontCategoriesService.mjs';
import { SHOP_SORT_OPTIONS } from '../src/lib/commerce/shop-filters.mjs';

const product = { id: 'product-a', name: 'Producto autorizado', currency: 'USD', price: '0.00', unitId: 'pack', unit: 'Paquete', availability: 'unknown', saleUnits: [{ unitId: 'base', unit: 'Unidad', price: null, availability: 'unknown' }, { unitId: 'pack', unit: 'Paquete', price: '0.00', availability: 'available' }], price_purchase: '1234', stock_by_warehouse: ['private'], images: ['https://media.example.test/product.webp'] };
const page = { websiteId: 'site-a', count: 52, offset: 24, limit: 24, results: [product], facets: { categories: [{ id: 'category-a', name: 'Categoría A', productCount: 44 }], brands: [{ id: 'brand-a', name: 'Marca A', productCount: 40 }] } };
const config = fetchImpl => ({ baseUrl: 'https://api.example.test/api/v1', hostname: 'a.example.test', websiteId: 'site-a', fetchImpl });
test('commercial listing preserves server total, facets and repeated category/brand filters', async () => {
  let call;
  const service = createStorefrontProductsService(config(async (url, options) => { call = { url, options }; return { ok: true, json: async () => page }; }));
  const result = await service.list({ category: ['category-a', 'category-b'], brand: ['brand-a', 'brand-b'], min: '0', max: '200.50', offset: 24, limit: 24, ordering: 'price-desc' });
  assert.deepEqual(call.url.searchParams.getAll('category'), ['category-a', 'category-b']);
  assert.deepEqual(call.url.searchParams.getAll('brand'), ['brand-a', 'brand-b']);
  assert.equal(call.url.searchParams.get('min'), '0');
  assert.equal(result.count, 52);
  assert.equal(result.facets.categories[0].productCount, 44);
  assert.equal(result.results[0].currency, 'USD');
  assert.equal(result.results[0].price, 0);
  assert.equal(result.results[0].price_purchase, undefined);
  assert.equal(result.results[0].stock_by_warehouse, undefined);
  assert.deepEqual(call.options.headers, { Accept: 'application/json' });
  assert.equal(call.options.credentials, 'omit');
  assert.equal(call.options.cache, 'no-store');
});

test('commercial details preserve independently authorized unit prices without conversion', async () => {
  const service = createStorefrontProductsService(config(async () => ({ ok: true, json: async () => ({ websiteId: 'site-a', product }) })));
  const result = await service.detail(product.id);
  assert.equal(result.saleUnits[0].price, null);
  assert.equal(result.saleUnits[1].price, 0);
  assert.equal(result.saleUnits[1].availability, 'available');
  assert.equal(result.unitId, 'pack');
  assert.deepEqual(result.images, ['https://media.example.test/product.webp']);
});

test('public commercial errors retain HTTP code and field errors, without demo fallback', async () => {
  for (const status of [401, 403, 404, 412, 428, 503]) {
    const service = createStorefrontProductsService(config(async () => ({ ok: false, status, headers: new Headers({ ETag: 'current', 'Retry-After': '5' }), json: async () => ({ code: `ERROR_${status}`, message: 'Acceso no disponible', fields: { min: 'Inválido' } }) })));
    await assert.rejects(service.list(), error => error.status === status && error.code === `ERROR_${status}` && error.fields.min === 'Inválido' && error.etag === 'current' && error.retryAfter === '5');
  }
});

test('unrelated website data, invalid amounts and malformed commercial pages are rejected', async () => {
  for (const body of [{ ...page, websiteId: 'site-b' }, { ...page, facets: {} }, { ...page, limit: 0 }, { ...page, results: [{ ...product, currency: '' }] }, { ...page, results: [{ ...product, price: '-1' }] }]) {
    const service = createStorefrontProductsService(config(async () => ({ ok: true, json: async () => body })));
    await assert.rejects(service.list());
  }
  const taxonomy = createStorefrontCategoriesService(config(async () => ({ ok: true, json: async () => ({ websiteId: 'site-b', count: 0, limit: 100, offset: 0, results: [] }) })));
  await assert.rejects(taxonomy.brands());
  assert.equal(SHOP_SORT_OPTIONS.some(option => option.value === 'discount'), false);
});
