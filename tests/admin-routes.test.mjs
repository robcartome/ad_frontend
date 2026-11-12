import test from 'node:test';
import assert from 'node:assert/strict';
import { isErpRoute } from '../src/lib/admin/routes.mjs';

test('retired ERP views show the Django transition even when opened by a direct URL', () => {
  for (const path of ['/admin/products', '/admin/products/example', '/admin/categories', '/admin/brands', '/admin/warehouses', '/admin/inventory/movements/edit/example', '/admin/partners/customers/new', '/admin/sales/quotations/example', '/admin/reports/kardex', '/admin/administration/users']) {
    assert.equal(isErpRoute(path), true, path);
  }
});

test('ERP transition never replaces the protected catalog, website permissions screen or public views', () => {
  for (const path of ['/admin', '/admin/catalog_admin', '/admin/catalog_admin/example', '/admin/website', '/admin/website/preview', '/catalog', '/shop', '/admin/website/products', '/admin/products-showcase']) {
    assert.equal(isErpRoute(path), false, path);
  }
});
