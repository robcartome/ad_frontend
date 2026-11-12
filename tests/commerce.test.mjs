import test from 'node:test';
import assert from 'node:assert/strict';
import { restoreCart, serializeCart, resolveCart, validQuantity, quotationUrl, buildQuotationMessage, cartKey } from '../src/lib/commerce/cart.mjs';
const products = [{ id: 'a', name: 'Taladro & brocas', sku: 'A-1', unit: 'unidad', price: 12.5 }, { id: 'b', name: 'Tubo', unit: 'unidad', price: null }];
const items = [{ id: 'a', quantity: 2 }];
test('storage isolates tenants and rejects unsupported schema versions', () => {
    const raw = serializeCart(items, 'one');
    assert.deepEqual(restoreCart(raw, 'one', products), items);
    assert.deepEqual(restoreCart(raw, 'two', products), []);
    assert.notEqual(cartKey('one'), cartKey('two'));
    assert.deepEqual(restoreCart('{broken', 'one', products), []);
    assert.deepEqual(restoreCart(JSON.stringify({ version: 2, storeId: 'one', items }), 'one', products), []);
});
test('restoration drops deleted IDs, duplicates and invalid quantities', () => {
    const raw = serializeCart([{ id: 'a', quantity: 2 }, { id: 'a', quantity: 3 }, { id: 'deleted', quantity: 1 }, { id: 'b', quantity: -1 }], 'one');
    assert.deepEqual(restoreCart(raw, 'one', products), items);
    for (const value of [0, -1, 1.5, 1000, NaN, Infinity, '2'])
        assert.equal(validQuantity(value), false);
});
test('current source overrides tampered prices and private persisted fields', () => {
    const raw = serializeCart([{ id: 'a', quantity: 2, price: 0, cost: 99 }], 'one');
    assert.equal(raw.includes('cost'), false);
    const result = resolveCart([{ id: 'a', quantity: 2, price: 0 }], products);
    assert.equal(result[0].price, 12.5);
    assert.deepEqual(resolveCart(items, []), []);
});
test('quotation contains SKU, units, unknown prices and confirmation disclaimer', () => {
    const text = buildQuotationMessage({ name: 'Tolentino' }, [...items, { id: 'b', quantity: 1 }], products);
    assert.match(text, /A-1/);
    assert.match(text, /2 unidad/);
    assert.match(text, /precio por confirmar/);
    assert.match(text, /no constituye un pedido/);
});
test('WhatsApp blocks demo, invalid phones and empty carts; encodes message safely', () => {
    assert.equal(quotationUrl({ mode: 'demo', whatsapp: '51999999999' }, items, products), null);
    assert.equal(quotationUrl({ mode: 'live', whatsapp: 'invalid' }, items, products), null);
    assert.equal(quotationUrl({ mode: 'live', whatsapp: '51999999999' }, [], products), null);
    const store = { name: 'Ferretería & más', mode: 'live', whatsapp: '51999999999' };
    const url = new URL(quotationUrl(store, items, products));
    assert.equal(url.hostname, 'wa.me');
    assert.equal(url.searchParams.get('text'), buildQuotationMessage(store, items, products));
});
