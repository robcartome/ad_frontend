import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeShopQuery, filterShopProducts, shopUrl } from '../src/lib/commerce/shop-filters.mjs';

const products = [
  { id:'a', name:'Alpha', category:'tools', brand:'A', sku:'AA', price:100, originalPrice:200 },
  { id:'b', name:'Beta', category:'tools', brand:'B', sku:'BB', price:50, originalPrice:null },
  { id:'c', name:'Gamma', category:'paint', brand:'A', sku:'CC', price:null, originalPrice:null },
  { id:'d', name:'Delta', category:'paint', brand:'C', sku:'DD', price:0, originalPrice:null },
];
const ids = query => filterShopProducts(products, normalizeShopQuery(query)).map(product => product.id);

test('shop combines search, category, multiple brands and inclusive price bounds', () => {
  assert.deepEqual(ids({ category:'tools', brand:['A','B'], min:'50', max:'100' }),['a','b']);
  assert.deepEqual(ids({ q:'BB', brand:'B', min:'50', max:'50' }),['b']);
  assert.deepEqual(ids({ brand:['A','C'], max:'0' }),['d']);
  assert.deepEqual(ids({ category:'missing' }),[]);
  assert.equal(ids({}).length,4);
  assert.equal(products[0].id,'a','filtering does not reorder the source');
});

test('shop price ordering always leaves unpriced products last and discounts use real offers', () => {
  assert.deepEqual(ids({ sort:'price-asc' }),['d','b','a','c']);
  assert.deepEqual(ids({ sort:'price-desc' }),['a','b','d','c']);
  assert.deepEqual(ids({ sort:'discount' }),['a','b','d','c']);
  assert.deepEqual(ids({ sort:'name-desc' }),['c','d','b','a']);
});

test('shop normalizes malformed query values and keeps backwards compatible single brands', () => {
  const value=normalizeShopQuery({ brand:['A','A',null,' B '], min:'NaN', max:'-10', sort:'best-selling', page:'-5' });
  assert.deepEqual(value.brand,['A','B']);
  assert.equal(value.min,''); assert.equal(value.max,''); assert.equal(value.sort,'name'); assert.equal(value.page,1);
  assert.deepEqual(normalizeShopQuery({ brand:'A' }).brand,['A']);
  assert.equal(normalizeShopQuery({ min:'0' }).min,'0');
  const reversed=normalizeShopQuery({ min:'90', max:'20' });
  assert.equal(reversed.min,'20'); assert.equal(reversed.max,'90');
});

test('shop URLs preserve all filters through ordering and pagination; changing filters resets page', () => {
  const query=normalizeShopQuery({ q:'tubo & PVC', category:'tools', brand:['A','B'], min:'0', max:'100', sort:'discount', page:'3' });
  const changed=new URL(shopUrl(query,{sort:'price-asc'}),'http://localhost');
  assert.deepEqual(changed.searchParams.getAll('brand'),['A','B']);
  assert.equal(changed.searchParams.get('q'),'tubo & PVC');
  assert.equal(changed.searchParams.get('min'),'0');
  assert.equal(changed.searchParams.has('page'),false);
  const page=new URL(shopUrl(query,{page:2}),'http://localhost');
  assert.equal(page.searchParams.get('page'),'2');
  assert.equal(page.searchParams.get('max'),'100');
  assert.equal(page.searchParams.get('sort'),'discount');
});
