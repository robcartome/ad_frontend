import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createWebsiteCatalogRepository } from '../src/services/websiteCatalogRepository.mjs';
const context = JSON.parse(await fs.readFile(process.argv[2] || '../.tools/b4c-http-context.json', 'utf8'));
const results = [];
function transport(actor) {
  return async (path, options = {}) => {
    const response = await fetch(context.backend + path, { ...options, headers: { 'Content-Type': 'application/json', ...(actor ? { Authorization: `Bearer ${context.auth[actor].token}` } : {}), ...options.headers } });
    const data = response.status === 204 ? null : await response.json();
    if (!response.ok) throw Object.assign(new Error(data.message || 'API error'), { status: response.status, ...data });
    return { data, etag: response.headers.get('etag'), status: response.status };
  };
}
const admin = createWebsiteCatalogRepository(transport('admin'), context.websiteA);
const editor = createWebsiteCatalogRepository(transport('editor'), context.websiteA);
async function check(name, operation) { await operation(); results.push({ name, passed: true }); console.log('OK', name); }
await check('JWT and current company permissions protect commercial administration', async () => {
  for (const [actor, status] of [[null, 401], ['worker', 403], ['media', 403]]) await assert.rejects(createWebsiteCatalogRepository(transport(actor), context.websiteA).load(), { status });
  await assert.rejects(createWebsiteCatalogRepository(transport('admin'), context.websiteB).load(), { status: 404 });
  assert.equal((await createWebsiteCatalogRepository(transport('reader'), context.websiteA).load()).settings.canManagePolicy, false);
});
await check('CMS cannot read or change lists, warehouses or overrides', async () => {
  const state = await editor.load();
  assert.equal(state.settings.canManagePolicy, false);
  for (const key of ['defaultPriceListId', 'warehouseIds', 'priceListOptions', 'warehouseOptions']) assert.ok(!(key in state.settings));
  for (const row of state.page.results) assert.ok(!('priceListId' in row));
  await assert.rejects(editor.saveSettings({ productsPerPage: 24 }, state.etag), { status: 403 });
  await assert.rejects(editor.update(context.publicationA, { priceListId: null }, state.etag), { status: 403 });
  const options = await editor.options({ search: 'PUBLIC-A' });
  assert.equal(options.data.results[0].productId, context.productA);
  assert.ok(!JSON.stringify(options.data).includes('price_purchase'));
});
await check('real concurrent edits reject stale or absent ETags and preserve editorial revision', async () => {
  const publicUrl = `${context.backend}/storefront/sites/${context.hostA}/content/`;
  const beforeResponse = await fetch(publicUrl);
  assert.equal(beforeResponse.status, 200);
  const before = await beforeResponse.json();
  // UUID ordering does not guarantee the fixture is on the first page.
  const a = await admin.load({ search: 'PUBLIC-A' }), b = await editor.load({ search: 'PUBLIC-A' });
  assert.equal(a.etag, b.etag);
  const original = a.page.results.find(row => row.id === context.publicationA);
  const saved = await editor.update(original.id, { commercialTitle: 'C2 concurrent title' }, b.etag);
  await assert.rejects(admin.update(original.id, { commercialTitle: 'Stale title' }, a.etag), { status: 412 });
  await assert.rejects(transport('admin')(`/websites/${context.websiteA}/products/${original.id}/`, { method: 'PATCH', body: JSON.stringify({ isFeatured: false }) }), { status: 428 });
  await editor.update(original.id, { commercialTitle: original.commercialTitle }, saved.etag);
  assert.equal((await (await fetch(publicUrl)).json()).revision, before.revision);
});
await check('policy is authorized and tenant foreign references are rejected', async () => {
  const state = await admin.load();
  assert.equal(state.settings.canManagePolicy, true);
  assert.ok(state.settings.priceListOptions.some(row => row.id === context.priceList));
  assert.ok(!state.settings.priceListOptions.some(row => row.id === context.foreignPriceList));
  await assert.rejects(admin.saveSettings({ defaultPriceListId: context.foreignPriceList }, state.etag), { status: 400 });
  await assert.rejects(editor.create({ productId: context.productB }, state.etag), { status: 400 });
  const saved = await admin.saveSettings({ productsPerPage: 30 }, state.etag);
  assert.equal(saved.data.commerceEnabled, false);
  await admin.saveSettings({ productsPerPage: state.settings.productsPerPage }, saved.etag);
});
await fs.writeFile(process.argv[3] || '../.tools/b4c2-http-results.json', JSON.stringify({ database: context.database, results }, null, 2));
console.log(`${results.length} real administrative HTTP checks passed`);
