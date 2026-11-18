// Read-only HTTP inventory of the existing services. Never logs HTML or private DTOs.
import http from 'node:http';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const output = process.argv[2] || '../apudig_mvp/docs/architecture/website-integration/b4c4-local-http.json';
function request(port, path, host = 'demo.localhost') {
  return new Promise(resolve => {
    const pending = http.get({ host: '127.0.0.1', port, path, headers: { Host: `${host}:${port}` } }, response => {
      let body = ''; response.setEncoding('utf8'); response.on('data', chunk => { body += chunk; });
      response.on('end', () => resolve({ status: response.statusCode, body, headers: response.headers }));
    });
    pending.setTimeout(20000, () => pending.destroy(new Error('HTTP timeout')));
    pending.on('error', error => resolve({ status: null, body: '', error: error.code || error.message }));
  });
}
const results = [];
for (const route of ['/', '/shop', '/admin', '/admin/website', '/catalog', '/login', '/contact', '/admin/catalog_admin']) {
  const response = await request(3000, route);
  results.push({ port: 3000, hostname: 'demo.localhost', route, status: response.status, error: response.error, cacheControl: response.headers?.['cache-control'], hasOperationalWhatsApp: response.body.includes('https://wa.me/'), hasPrivatePurchaseField: response.body.includes('price_purchase'), title: response.body.match(/<title>(.*?)<\/title>/)?.[1] });
}
for (const host of ['localhost', 'unknown.b4c4.localhost']) {
  const response = await request(3000, '/', host);
  results.push({ port: 3000, hostname: host, route: '/', status: response.status, error: response.error });
}
for (const route of ['/api/v1/storefront/sites/demo.localhost/content/', '/api/v1/storefront/sites/demo.localhost/products/?limit=1', '/api/v1/catalog/products/']) {
  const response = await request(8000, route, 'localhost');
  const record = { port: 8000, route, status: response.status, error: response.error, cacheControl: response.headers?.['cache-control'] };
  if (response.status === 200) {
    const data = JSON.parse(response.body);
    if ('commerceEnabled' in data) Object.assign(record, { commerceEnabled: data.commerceEnabled, revision: data.revision, identityHash: crypto.createHash('sha256').update(data.content.identity.name).digest('hex') });
    if ('count' in data) {
      record.count = data.count;
      if (data.results?.length) {
        const detail = await request(3000, `/shop/${data.results[0].id}`);
        results.push({ port: 3000, route: '/shop/[publishedProductId]', status: detail.status, hasPrivatePurchaseField: detail.body.includes('price_purchase') });
      } else results.push({ port: 3000, route: '/shop/[publishedProductId]', status: 'PENDING_NO_PUBLISHED_PRODUCTS' });
    }
  }
  results.push(record);
}
const report = { type: 'read-only existing local services', checkedAt: new Date().toISOString(), results, databaseWrites: false, authenticatedBrowserVerified: false };
await fs.writeFile(output, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
