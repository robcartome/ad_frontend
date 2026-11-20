import test from 'node:test';
import assert from 'node:assert/strict';
import { addWebsiteCartItem, cartLineId, cartQuoteItems, mergeWebsiteCarts, restoreWebsiteCart, resolveWebsiteCart, serializeWebsiteCart, websiteCartKey } from '../src/lib/commerce/website-cart.mjs';
import { prioritizeCartLines } from '../src/lib/commerce/cart.mjs';

const id = '00000000-0000-4000-8000-000000000001';
const base = '00000000-0000-4000-8000-000000000002';
const pack = '00000000-0000-4000-8000-000000000003';
const product = { id, unitId: base, unit: 'unidad', price: 0, availability: 'available', saleUnits: [{ unitId: base, unit: 'unidad', price: 0, availability: 'available' }, { unitId: pack, unit: 'paquete', price: 12, availability: 'available' }] };

test('same product in two units remains independent across reload', () => {
  const items = addWebsiteCartItem(addWebsiteCartItem([], product), product, pack, 2);
  assert.equal(items.length, 2);
  assert.notEqual(cartLineId(items[0]), cartLineId(items[1]));
  assert.deepEqual(restoreWebsiteCart(serializeWebsiteCart(items, 'A'), 'A'), items);
  assert.deepEqual(resolveWebsiteCart(items, [product]).map(row => row.price), [0, 12]);
  assert.equal(prioritizeCartLines(resolveWebsiteCart(items, [product]), id).length, 2);
});

test('unknown products and removed units survive pagination and are marked for review', () => {
  const items = addWebsiteCartItem([], product, pack);
  const restored = restoreWebsiteCart(serializeWebsiteCart(items, 'A'), 'A');
  const unknown = resolveWebsiteCart(restored, []);
  assert.equal(unknown.length, 1);
  assert.equal(unknown[0].requiresReview, true);
  assert.equal(unknown[0].price, null);
  assert.equal(resolveWebsiteCart(restored, [{ ...product, saleUnits: [] }])[0].requiresReview, true);
});

test('storage is scoped by Website and rejects corrupt data without silently deleting it', () => {
  const raw = serializeWebsiteCart([{ id, unitId: base, quantity: 1 }], 'A');
  assert.notEqual(websiteCartKey('A'), websiteCartKey('B'));
  assert.throws(() => restoreWebsiteCart(raw, 'B'));
  assert.throws(() => restoreWebsiteCart('{bad', 'A'));
  assert.throws(() => restoreWebsiteCart(JSON.stringify({ version: 1, storeId: 'A', items: [] }), 'A'));
});

test('serialized cart and quote payload never trust stored prices stock or customer', () => {
  const items = [{ id, unitId: base, quantity: 3, price: 0.01, companyId: 'B', stock: 999, customerId: 'other' }];
  assert.deepEqual(restoreWebsiteCart(serializeWebsiteCart(items, 'A'), 'A'), [{ id, unitId: base, quantity: 3 }]);
  assert.deepEqual(cartQuoteItems(items), [{ productId: id, unitId: base, quantity: 3 }]);
});

test('capacity and quantities fail explicitly rather than truncating selections', () => {
  assert.throws(() => serializeWebsiteCart(Array(201).fill({ id, unitId: base, quantity: 1 }), 'A'));
  assert.throws(() => addWebsiteCartItem([{ id, unitId: base, quantity: 999 }], product));
  assert.throws(() => addWebsiteCartItem([], product, base, true));
  assert.throws(() => addWebsiteCartItem([], product, 'bad', 1));
  assert.equal(addWebsiteCartItem([], product)[0].quantity, 1, 'zero is a valid authorized price');
});

test('an anonymous selection without a published price survives reload without inventing an offer', () => {
  const unpriced = { ...product, price: null, saleUnits: [{ ...product.saleUnits[0], price: null }] };
  const items = addWebsiteCartItem([], unpriced, base, 2);
  const restored = restoreWebsiteCart(serializeWebsiteCart(items, 'A'), 'A');
  assert.equal(resolveWebsiteCart(restored, [unpriced])[0].price, null);
  assert.deepEqual(cartQuoteItems(restored), [{ productId: id, unitId: base, quantity: 2 }]);
  assert.throws(() => addWebsiteCartItem([], { ...unpriced, saleUnits: [{ ...unpriced.saleUnits[0], availability: 'unavailable' }] }));
});

test('explicit guest handoff preserves both sources, merges quantities and rejects overflow atomically', () => {
  const account = [{ id, unitId: base, quantity: 2 }];
  const guest = [{ id, unitId: base, quantity: 3, price: 0.01 }, { id, unitId: pack, quantity: 1 }];
  const result = mergeWebsiteCarts(account, guest);
  assert.deepEqual(result, [{ id, unitId: base, quantity: 5 }, { id, unitId: pack, quantity: 1 }]);
  assert.equal(account[0].quantity, 2);
  assert.equal(guest[0].quantity, 3);
  assert.throws(() => mergeWebsiteCarts(account, [{ id, unitId: base, quantity: 999 }]));
  assert.equal(account[0].quantity, 2);
  assert.throws(() => restoreWebsiteCart(serializeWebsiteCart(guest, 'B'), 'A'));
});
