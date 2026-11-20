// Explicit real HTTP checks; requires run_storefront_integration.py and Next on 8771.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';

const context = JSON.parse(await fs.readFile(process.argv[2] || '../.tools/b4c-http-context.json', 'utf8'));
const reportPath = process.argv[3] || '../.tools/b4c1-http-results.json';
const results = [];
function request(base, path, headers = {}) {
  return new Promise((resolve, reject) => {
    http.get(new URL(path, base), { headers }, response => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', chunk => { body += chunk; });
      response.on('end', () => resolve({ status: response.statusCode, body, headers: response.headers }));
    }).on('error', reject);
  });
}
const front = (path, host = context.hostA, extra = {}) => request(context.next, path, { Host: `${host}:8771`, ...extra });
async function catalog(path, host = context.hostA) {
  const response = await request(context.backend + '/', `storefront/sites/${host}/${path}`);
  assert.equal(response.status, 200);
  return JSON.parse(response.body);
}
async function check(name, operation) {
  await operation(); results.push({ name, passed: true }); console.log('OK', name);
}

await check('SSR catalog uses authorized A products, server total and no private fields', async () => {
  const response = await front('/shop');
  assert.equal(response.status, 200);
  assert.ok(response.body.includes('Oferta A'));
  assert.ok(response.body.includes('Catalog Company A'));
  assert.ok(!response.body.includes('Producto privado B'));
  assert.ok(!response.body.includes('https://wa.me/'));
  for (const marker of ['price_purchase', 'stock_by_warehouse', 'inventory_unit_cost', 'supplier_codes', '20999110001', 'Private warehouse B']) assert.ok(!response.body.includes(marker), marker);
  const api = await catalog('products/?limit=24');
  assert.equal(api.count, 28);
  assert.ok(response.body.replace(/<!--.*?-->/g, '').includes('<strong>28</strong>'));
});
await check('real pagination reads a second backend page, without local slicing', async () => {
  const api = await catalog('products/?limit=24&offset=24');
  const response = await front('/shop?page=2');
  assert.equal(response.status, 200);
  assert.equal(api.results.length, 4);
  for (const row of api.results) assert.ok(response.body.includes(row.name));
});
await check('repeated filters and server facets remain consistent', async () => {
  const query = `category=${context.categoryA}&brand=${context.brandA}&brand=${context.brandOther}&min=0&max=1000`;
  const api = await catalog(`products/?${query}&limit=24&ordering=price-asc`);
  const response = await front(`/shop?${query}&sort=price-asc`);
  assert.equal(response.status, 200);
  for (const row of api.results) assert.ok(response.body.includes(row.name));
  assert.ok(response.body.replace(/<!--.*?-->/g, '').includes(`<strong>${api.count}</strong>`));
});
await check('A and B HTML and metadata are isolated by host', async () => {
  const a = await front('/shop');
  const b = await front('/shop', context.hostB);
  assert.equal(b.status, 200);
  assert.ok(b.body.includes('Producto privado B'));
  assert.ok(b.body.includes('Catalog Company B'));
  assert.ok(!b.body.includes('Oferta A'));
  assert.ok(!a.body.includes('Catalog Company B'));
});
await check('unverified, disabled, unknown and unpublished domains are 404', async () => {
  for (const host of ['pending.b4c.localhost', 'disabled.b4c.localhost', 'unknown.b4c.localhost', 'unpublished.b4c.localhost']) {
    assert.equal((await front('/shop', host)).status, 404, host);
  }
});
await check('unpublished and foreign product details are 404', async () => {
  for (const id of [context.productB, context.unpublishedProduct, '00000000-0000-0000-0000-000000000000']) assert.equal((await front(`/shop/${id}`)).status, 404);
});
await check('real detail contains authorized units, currency and product metadata', async () => {
  const response = await front(`/shop/${context.productA}`);
  assert.equal(response.status, 200);
  assert.ok(response.body.includes('Paquete'));
  assert.ok(response.body.includes('Unidad base'));
  assert.ok(response.body.includes('70.80'));
  assert.ok(response.body.includes(`/shop/${context.productA}`));
  assert.ok(!response.body.includes('DEMOSTRACIÓN'));
  assert.ok(!response.body.includes('Agregar a cotización'));
});
await check('authorized zero and missing price are distinct', async () => {
  const zero = await front(`/shop/${context.zero}`);
  const unknown = await front(`/shop/${context.nullPrice}`);
  assert.equal(zero.status, 200); assert.equal(unknown.status, 200);
  assert.ok(zero.body.includes('0.00'));
  assert.ok(unknown.body.includes('Consultar precio'));
});
await check('anonymous cart selection is available while orders and worker catalog stay protected', async () => {
  assert.ok((await front('/cart')).body.includes('sf-cart-page'));
  const labor = await front('/catalog');
  assert.equal(labor.status, 200);
  assert.ok(labor.body.includes('Verificando sesi'));
  assert.equal((await request(context.backend + '/', 'catalog/products/')).status, 401);
  assert.equal((await catalog('content/')).commerceEnabled, false);
});
await check('Home never invites quotation or labels real published banners as demo while commerce is disabled', async () => {
  const response = await front('/');
  assert.equal(response.status, 200);
  assert.ok(!response.body.includes('Armar mi cotización'));
  assert.ok(!response.body.includes('Ilustración de demostración'));
});
await check('RSC includes only authorized public product data', async () => {
  const response = await front('/shop', context.hostA, { RSC: '1' });
  assert.equal(response.status, 200);
  for (const marker of ['price_purchase', 'supplier_codes', 'stock_by_warehouse', 'inventory_unit_cost', 'Private warehouse B']) assert.ok(!response.body.includes(marker), marker);
});
await fs.writeFile(reportPath, JSON.stringify({ database: context.database, backend: context.backend, phases: ['C1'], results, mocks: false, frontend: 'Next production build; public SSR/RSC', visualValidated: false }, null, 2));
console.log(`${results.length} real HTTP integration checks passed`);
