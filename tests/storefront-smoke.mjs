// Run against a running production build: node tests/storefront-smoke.mjs http://localhost:3000
import assert from 'node:assert/strict';

const base = process.argv[2] || 'http://localhost:3000';
const paths = [
  '/', '/catalog', '/catalog?category=herramientas',
  '/catalog?q=ningunproducto', '/catalog/demo-taladro',
  '/catalog/no-existe', '/cart', '/about', '/contact', '/login', '/admin',
  '/admin/website', '/admin/website/preview',
];

for (const path of paths) {
  const response = await fetch(new URL(path, base));
  const html = await response.text();
  const missing = path === '/catalog/no-existe';
  const commercial = path !== '/login' && !path.startsWith('/admin');
  assert.equal(response.status, missing ? 404 : 200, `${path}: status`);
  // Next renders the not-found boundary from its RSC payload; no HTML-header assertion there.
  if (!missing) assert.equal(html.includes('sf-header-main'), commercial, `${path}: layout`);
  if (commercial) assert.ok(html.includes('noindex'), `${path}: demo must not be indexed`);
  if (path.includes('ningunproducto')) assert.ok(html.includes('No encontramos productos'));
  if (path.includes('category=herramientas')) assert.match(html, /2<\/strong> productos encontrados/);
  if (missing) assert.ok(html.includes('Producto no encontrado'));
  console.log(`${response.status} ${path} OK`);
}
