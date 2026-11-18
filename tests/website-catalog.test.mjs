import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createWebsiteCatalogRepository, publicationPayload, emptyPublication, catalogFailureState, canEditPublication } from '../src/services/websiteCatalogRepository.mjs';
const id = '11111111-1111-4111-8111-111111111111';
const tag = `"catalog-${'a'.repeat(64)}"`;

test('commercial writes use only the commercial ETag and omit privileged fields for CMS', async () => {
  const calls = [];
  const repository = createWebsiteCatalogRepository(async (url, options) => { calls.push({ url, options }); return { data: {}, etag: tag }; }, id);
  const body = publicationPayload({ ...emptyPublication(), productId: id, priceListId: id }, false);
  assert.ok(!('priceListId' in body));
  assert.ok(!('companyId' in body));
  await repository.create(body, tag);
  assert.equal(calls[0].options.headers['If-Match'], tag);
  assert.equal(calls[0].options.cache, 'no-store');
  await assert.rejects(repository.create(body, '"24"'), { status: 428 });
  assert.equal(calls.length, 1);
  assert.equal(publicationPayload({ ...emptyPublication(), id, productId: id }, true).priceListId, null);
  assert.ok(!('productId' in publicationPayload({ ...emptyPublication(), id }, false)));
});
test('mixed reads and cross-Website responses are rejected before writes', async () => {
  let count = 0;
  const mixed = createWebsiteCatalogRepository(async () => ({ data: { websiteId: id, count: 0, limit: 20, offset: 0, results: [] }, etag: `"catalog-${(++count === 1 ? 'a' : 'b').repeat(64)}"` }), id);
  await assert.rejects(mixed.load(), { status: 412 });
  const foreign = createWebsiteCatalogRepository(async () => ({ data: { websiteId: '22222222-2222-4222-8222-222222222222' }, etag: tag }), id);
  await assert.rejects(foreign.load(), { status: 502 });
});
test('412 and 428 preserve product and policy drafts while blocking writes', () => {
  const original = { draft: { commercialTitle: 'Trabajo pendiente' }, policy: { warehouseIds: [id] }, dirty: true, policyDirty: true, conflict: false, etag: tag };
  for (const status of [412, 428]) {
    const next = catalogFailureState(original, { status });
    assert.equal(next.draft, original.draft);
    assert.equal(next.policy, original.policy);
    assert.equal(next.conflict, true);
    assert.equal(next.etag, tag);
  }
  assert.equal(catalogFailureState(original, { status: 503 }).conflict, false);
});
test('a published original requires publication permission even if its draft is unchecked', () => {
  assert.equal(canEditPublication({ isPublished: true }, true, false), false);
  assert.equal(canEditPublication({ isPublished: false }, true, false), true);
  assert.equal(canEditPublication({ isPublished: true }, true, true), true);
  assert.equal(canEditPublication({ isPublished: false }, false, true), false);
});
test('administrative network failures remain actionable and references read every server page', async () => {
  await assert.rejects(createWebsiteCatalogRepository(async () => { throw new TypeError('Failed to fetch'); }, id).load(), { status: 503 });
  const repository = createWebsiteCatalogRepository(async url => {
    const offset = Number(new URL(url, 'https://apudig.test').searchParams.get('offset'));
    return { etag: tag, data: { websiteId: id, count: 21, limit: 20, offset, results: Array.from({ length: offset ? 1 : 20 }, (_, index) => ({ productId: String(offset + index), isPublished: index === 0, slug: `product-${offset + index}` })) } };
  }, id);
  assert.deepEqual(await repository.publishedReferences(), [{ id: '0', name: 'product-0' }, { id: '20', name: 'product-20' }]);
});
