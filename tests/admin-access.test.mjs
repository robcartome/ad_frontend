import test from 'node:test';
import assert from 'node:assert/strict';
import { canAccessAdministrationRoute, getAdministrationAccess } from '../src/lib/admin/access.mjs';

const company = { company_id: 'company-a' };
const profile = (roles = [], permissions = []) => ({ id: 'member', company: { id: 'company-a', roles, permissions } });

test('sellers, cashiers and members without roles have no administration links', () => {
  for (const roles of [[], ['SELLER'], ['CASHIER']]) {
    assert.deepEqual(getAdministrationAccess(profile(roles), company), { companyAdmin: false, website: false });
  }
});

test('company administrator and superuser can access administrative navigation', () => {
  assert.deepEqual(getAdministrationAccess(profile(['ADMIN']), company), { companyAdmin: true, website: true });
  assert.deepEqual(getAdministrationAccess({ id: 'root', is_superuser: true }, company), { companyAdmin: true, website: true });
});

test('administration from another company or without context is hidden', () => {
  assert.deepEqual(getAdministrationAccess(profile(['ADMIN']), { company_id: 'company-b' }), { companyAdmin: false, website: false });
  assert.deepEqual(getAdministrationAccess(profile(['ADMIN']), null), { companyAdmin: false, website: false });
  assert.deepEqual(getAdministrationAccess(null, company), { companyAdmin: false, website: false });
});

test('explicit CMS permissions do not grant private catalog or ERP administration', () => {
  assert.deepEqual(getAdministrationAccess(profile(['SELLER'], ['manage.website']), company), { companyAdmin: false, website: true });
});

test('every account keeps the dashboard while administrative destinations remain restricted', () => {
  for (const roles of [[], ['SELLER'], ['CASHIER']]) {
    const access = getAdministrationAccess(profile(roles), company);
    assert.equal(canAccessAdministrationRoute('/admin', access), true);
    for (const path of ['/admin/catalog_admin', '/admin/website', '/admin/website/preview', '/admin/administration/users']) {
      assert.equal(canAccessAdministrationRoute(path, access), false, path);
    }
  }
  const editor = getAdministrationAccess(profile([], ['manage.website']), company);
  assert.equal(canAccessAdministrationRoute('/admin/website', editor), true);
  assert.equal(canAccessAdministrationRoute('/admin/catalog_admin', editor), false);
  const administrator = getAdministrationAccess(profile(['ADMIN']), company);
  assert.equal(canAccessAdministrationRoute('/admin/catalog_admin', administrator), true);
});
