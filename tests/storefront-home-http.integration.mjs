import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
const context = JSON.parse(await fs.readFile(process.argv[2] || '../.tools/b4c-http-context.json', 'utf8'));
const expectedPrice = process.argv[3] || '84.96';
const results = [];
function home(host = context.hostA) {
  return new Promise((resolve, reject) => {
    http.get(context.next, { headers: { Host: `${host}:8771` } }, response => {
      let body = ''; response.setEncoding('utf8'); response.on('data', chunk => { body += chunk; });
      response.on('end', () => resolve({ status: response.statusCode, body }));
    }).on('error', reject);
  });
}
async function api(path, options = {}) {
  const response = await fetch(context.backend + path, options);
  assert.equal(response.status, 200);
  return { data: await response.json(), etag: response.headers.get('etag') };
}
async function check(name, operation) { await operation(); results.push({ name, passed: true }); console.log('OK', name); }
await check('Home renders real featured products and each company published visual identity', async () => {
  const a = await home(), b = await home(context.hostB);
  assert.equal(a.status, 200); assert.equal(b.status, 200);
  assert.ok(a.body.includes('Oferta A')); assert.ok(!a.body.includes('Producto privado B'));
  assert.ok(a.body.includes('#1166AA')); assert.ok(b.body.includes('#AA1166'));
  assert.ok(!b.body.includes('Oferta A')); assert.ok(!a.body.includes('https://wa.me/'));
});
await check('live ERP price changes reach K1 and SSR Home without CMS republication', async () => {
  const product = await api(`/storefront/sites/${context.hostA}/products/${context.productA}/`);
  assert.equal(product.data.product.price, expectedPrice);
  const content = await api(`/storefront/sites/${context.hostA}/content/`);
  assert.equal(content.data.revision, 1);
  assert.equal(content.data.commerceEnabled, false);
  assert.ok((await home()).body.includes(expectedPrice));
  for (const key of ['price_purchase', 'supplier_codes', 'stock_by_warehouse', 'defaultPriceListId', 'warehouseIds']) assert.ok(!(await home()).body.includes(key));
});
await check('withdrawing a featured publication removes it immediately from Home without CMS change', async () => {
  const headers = { Authorization: `Bearer ${context.auth.admin.token}`, 'Content-Type': 'application/json' };
  const path = `/websites/${context.websiteA}/products/${context.publicationA}/`;
  let saved;
  try {
    const initial = await api(`/websites/${context.websiteA}/catalog-settings/`, { headers });
    saved = await api(path, { method: 'PATCH', headers: { ...headers, 'If-Match': initial.etag }, body: JSON.stringify({ isPublished: false }) });
    assert.ok(!(await home()).body.includes('Oferta A'));
    assert.equal((await api(`/storefront/sites/${context.hostA}/content/`)).data.revision, 1);
    assert.equal((await fetch(`${context.backend}/storefront/sites/${context.hostA}/products/${context.productA}/`)).status, 404);
  } finally {
    if (saved) await api(path, { method: 'PATCH', headers: { ...headers, 'If-Match': saved.etag }, body: JSON.stringify({ isPublished: true }) });
  }
});
await fs.writeFile(process.argv[4] || '../.tools/b4c3-http-results.json', JSON.stringify({ database: context.database, results }, null, 2));
console.log(`${results.length} real Home HTTP checks passed`);
