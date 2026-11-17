// Run against a running production build: node tests/storefront-smoke.mjs http://localhost:3000
import assert from 'node:assert/strict';
import http from 'node:http';
import https from 'node:https';

const base = process.argv[2] || 'http://localhost:3000';
const hostname = process.argv[3]; // Explicit registered integration host, if needed.
function readRoute(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, base);
    const client = url.protocol === 'https:' ? https : http;
    client.get(url, { headers: hostname ? { Host: `${hostname}${url.port ? `:${url.port}` : ''}` } : {} }, response => {
      let body = ''; response.setEncoding('utf8'); response.on('data', chunk => { body += chunk; });
      response.on('end', () => resolve({ status: response.statusCode, body }));
    }).on('error', reject);
  });
}
const paths = [
  '/', '/catalog', '/catalog?search=taladro', '/shop', '/shop?category=herramientas',
  '/shop?q=ningunproducto', '/shop/demo-taladro',
  '/shop/no-existe', '/cart', '/about', '/contact', '/login', '/admin',
  '/admin/catalog_admin', '/admin/website', '/admin/website/preview',
];

for (const path of paths) {
  const response = await readRoute(path);
  const html = response.body;
  const missing = path === '/shop/no-existe' || path === '/shop/demo-taladro';
  const legacyCatalog = path === '/catalog' || path.startsWith('/catalog?');
  const commercial = !legacyCatalog && path !== '/login' && !path.startsWith('/admin');
  assert.equal(response.status, missing ? 404 : 200, `${path}: status`);
  // Next renders the not-found boundary from its RSC payload; no HTML-header assertion there.
  if (!missing) assert.equal(html.includes('sf-header-main'), commercial, `${path}: layout`);
  if (commercial) assert.ok(html.includes('noindex'), `${path}: demo must not be indexed`);
  if (legacyCatalog) {
    assert.ok(html.includes('Verificando sesi'), `${path}: worker catalog requires existing authentication`);
    assert.ok(html.includes('Mega Ferretero Tolentino'), `${path}: original layout`);
    assert.ok(!html.includes('Vista de demostración'), `${path}: no storefront demo banner`);
    assert.ok(!html.includes('noindex'), `${path}: preserves original indexing metadata`);
  }
  if (path.includes('ningunproducto')) assert.ok(html.includes('No encontramos productos'));
  if (path.includes('category=herramientas')) assert.ok(html.includes('catalogo comercial estara disponible'));
  if (missing) assert.ok(html.includes('Producto no encontrado'));
  console.log(`${response.status} ${path} OK`);
}
