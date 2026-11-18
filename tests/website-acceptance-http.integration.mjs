// B4-C4 real HTTP checks. Only the explicitly isolated fixture context is accepted.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import { createDjangoWebsiteRepository } from '../src/services/websiteRepository.mjs';
import { createWebsiteCatalogRepository, catalogFailureState } from '../src/services/websiteCatalogRepository.mjs';
import { getAdministrationAccess } from '../src/lib/admin/access.mjs';
const context = JSON.parse(await fs.readFile(process.argv[2] || '../.tools/b4c-http-context.json', 'utf8'));
assert.equal(context.database, 'test_apudig_b4c_http');
assert.equal(context.backend, 'http://127.0.0.1:8770/api/v1');
const mode = process.argv[3] || 'editorial';
const results = [];
function actor(initialToken) {
  let token = initialToken;
  return {
    setToken(value) { token = value; },
    async request(path, options = {}) {
      const response = await fetch(context.backend + path, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers }, signal: AbortSignal.timeout(10000) });
      const data = response.status === 204 ? null : await response.json();
      if (!response.ok) throw Object.assign(new Error(data.message || data.detail || 'API error'), { status: response.status, ...data });
      return options.withResponse ? { data, etag: response.headers.get('ETag'), status: response.status } : data;
    },
  };
}
function storefront(path = '/', host = context.hostA) {
  return new Promise((resolve, reject) => {
    http.get(new URL(path, context.next), { headers: { Host: `${host}:8771` } }, response => {
      let body = ''; response.setEncoding('utf8'); response.on('data', chunk => { body += chunk; }); response.on('end', () => resolve({ status: response.statusCode, body }));
    }).on('error', reject);
  });
}
const anonymous = actor(null);
const content = () => anonymous.request(`/storefront/sites/${context.hostA}/content/`);
const offer = () => anonymous.request(`/storefront/sites/${context.hostA}/products/${context.productA}/`);
async function check(name, operation) { await operation(); results.push({ name, passed: true }); console.log('OK', name); }

if (mode === 'stock') {
  await check('live stock change respects base/pack units and leaves CMS revision unchanged', async () => {
    const before = JSON.parse(await fs.readFile('../.tools/b4c4-stock-before.json', 'utf8'));
    const product = (await offer()).product;
    assert.equal(product.availability, 'unavailable');
    assert.ok(product.saleUnits.some(unit => unit.availability === 'available'));
    assert.equal((await content()).revision, before.revision);
    const admin = actor(context.auth.admin.token);
    const response = await admin.request(`/websites/${context.websiteA}/catalog-settings/`, { withResponse: true });
    assert.equal(response.etag, before.etag);
    const html = await storefront(`/shop/${context.productA}`);
    assert.equal(html.status, 200); assert.ok(html.body.includes('No disponible'));
  });
} else {
  const editor = actor(null);
  let companyA, companyB;
  await check('existing login, company selection and refresh preserve current authorization', async () => {
    const login = await editor.request('/auth/token/', { method: 'POST', body: JSON.stringify({ email: context.auth.editor.email, password: context.auth.editor.password }) });
    editor.setToken(login.access_token);
    companyA = login.companies.find(row => row.company_name === 'Catalog Company A').company_id;
    companyB = login.companies.find(row => row.company_name === 'Catalog Company B').company_id;
    const selection = await editor.request('/auth/select-company/', { method: 'POST', body: JSON.stringify({ company_id: companyA }) });
    editor.setToken(selection.access_token);
    const profile = await editor.request('/auth/me/');
    assert.equal(profile.company.id, companyA);
    assert.equal(getAdministrationAccess(profile, { company_id: companyA }).website, true);
    assert.equal(getAdministrationAccess(profile, { company_id: companyA }).companyAdmin, false);
    const refresh = await anonymous.request('/auth/refresh/', { method: 'POST', body: JSON.stringify({ refresh: login.refresh_token }) });
    editor.setToken(refresh.access_token);
    assert.equal((await editor.request('/auth/me/')).id, profile.id);
    // select-company returns an access token only; retain the login refresh
    // contract and explicitly select the company used by this scenario.
    editor.setToken(selection.access_token);
    const discovery = await createDjangoWebsiteRepository(editor.request).discover(context.hostA);
    assert.equal(discovery.id, context.websiteA); assert.equal(discovery.capabilities.edit, true);
  });
  const cms = createDjangoWebsiteRepository(editor.request);
  const scope = { websiteId: context.websiteA };
  await check('draft and preview remain private; publishing updates real SSR banner and metadata', async () => {
    const initial = await cms.load(scope);
    const publicBefore = await content();
    const document = structuredClone(initial.draft);
    document.identity.name = 'C4 published identity A';
    document.seo.title = 'C4 published SEO A';
    if (!document.banners.length) document.banners.push({ id: 'c4-banner', enabled: true, eyebrow: 'Novedades', title: '', description: '', ctaLabel: 'Ver productos', href: '/shop', imageUrl: '', mobileImageUrl: '', imageAlt: '', art: 'drill' });
    document.banners[0].enabled = true;
    document.banners[0].title = 'C4 banner A published';
    const draft = await cms.saveDraft(scope, document, initial.revision);
    assert.equal((await content()).revision, publicBefore.revision);
    assert.ok(!(await storefront()).body.includes('C4 banner A published'));
    assert.equal((await cms.preview(scope)).content.banners[0].title, document.banners[0].title);
    await assert.rejects(cms.publish(scope, initial.revision), { status: 412 });
    const published = await cms.publish(scope, draft.revision);
    const html = await storefront();
    assert.equal(html.status, 200); assert.ok(html.body.includes('C4 banner A published')); assert.ok(html.body.includes('C4 published SEO A'));
    assert.equal((await content()).revision, published.revision);
    assert.ok(!(await storefront('/', context.hostB)).body.includes('C4 banner A published'));
    const next = structuredClone(document); next.banners[0].title = 'C4 unshared draft A';
    const saved = await cms.saveDraft(scope, next, published.revision);
    assert.ok(!(await storefront()).body.includes('C4 unshared draft A'));
    await cms.saveDraft(scope, document, saved.revision);
  });
  await check('commercial 412/428 retain both client drafts and do not overwrite server data', async () => {
    const catalog = createWebsiteCatalogRepository(editor.request, context.websiteA);
    const initial = await catalog.load({ search: 'PUBLIC-A' });
    const row = initial.page.results.find(item => item.productId === context.productA);
    const pending = { draft: { ...row, commercialTitle: 'Unsaved local work' }, policy: { productsPerPage: 31 }, dirty: true, policyDirty: true, conflict: false };
    const saved = await catalog.update(row.id, { commercialTitle: 'C4 first writer' }, initial.etag);
    let conflict;
    try { await catalog.update(row.id, { commercialTitle: pending.draft.commercialTitle }, initial.etag); assert.fail('Stale write accepted'); } catch (error) { assert.equal(error.status, 412); conflict = error; }
    const state = catalogFailureState(pending, conflict);
    assert.equal(state.draft.commercialTitle, pending.draft.commercialTitle); assert.equal(state.policy, pending.policy); assert.equal(state.conflict, true);
    await assert.rejects(editor.request(`/websites/${context.websiteA}/products/${row.id}/`, { method: 'PATCH', body: JSON.stringify({ isFeatured: false }) }), { status: 428 });
    assert.equal((await offer()).product.name, 'C4 first writer');
    await catalog.update(row.id, { commercialTitle: row.commercialTitle }, saved.etag);
  });
  await check('CMS publishes and withdraws the existing ERP link; basic workers cannot edit', async () => {
    const catalog = createWebsiteCatalogRepository(editor.request, context.websiteA);
    const initial = await catalog.load({ search: 'DRAFT-A' });
    const row = initial.page.results.find(item => item.productId === context.unpublishedProduct);
    const saved = await catalog.update(row.id, { isPublished: true, isFeatured: true }, initial.etag);
    assert.equal((await anonymous.request(`/storefront/sites/${context.hostA}/products/${row.productId}/`)).product.id, row.productId);
    const worker = actor(context.auth.worker.token);
    await assert.rejects(worker.request(`/websites/${context.websiteA}/products/${row.id}/`, { method: 'PATCH', headers: { 'If-Match': saved.etag }, body: JSON.stringify({ isPublished: false }) }), { status: 403 });
    await catalog.update(row.id, { isPublished: false, isFeatured: row.isFeatured }, saved.etag);
    await assert.rejects(anonymous.request(`/storefront/sites/${context.hostA}/products/${row.productId}/`), { status: 404 });
    assert.equal((await worker.request('/catalog/products/?search=PUBLIC-A')).total, 1);
    const detail = await worker.request(`/catalog/products/${context.productA}/detail/`);
    assert.ok(!('price_purchase' in detail)); assert.ok(detail.price_list.length); assert.ok(detail.stock_by_warehouse.length);
    await assert.rejects(worker.request('/catalog/private/products/'), { status: 403 });
  });
  await check('switching A to B drops CMS grants and old Website references are rejected', async () => {
    const selected = await editor.request('/auth/select-company/', { method: 'POST', body: JSON.stringify({ company_id: companyB }) });
    editor.setToken(selected.access_token);
    const profile = await editor.request('/auth/me/');
    assert.equal(profile.company.id, companyB);
    assert.equal(getAdministrationAccess(profile, { company_id: companyB }).website, false);
    await assert.rejects(cms.load(scope), { status: 403 });
    await assert.rejects(createDjangoWebsiteRepository(editor.request).discover(context.hostB), { status: 403 });
    const selectedA = await editor.request('/auth/select-company/', { method: 'POST', body: JSON.stringify({ company_id: companyA }) });
    editor.setToken(selectedA.access_token);
    await assert.rejects(cms.discover(context.hostB), { status: 403 });
    assert.equal((await cms.discover(context.hostA)).id, context.websiteA);
  });
  const admin = actor(context.auth.admin.token);
  const settings = await admin.request(`/websites/${context.websiteA}/catalog-settings/`, { withResponse: true });
  const product = (await offer()).product;
  assert.equal(product.availability, 'available');
  await fs.writeFile('../.tools/b4c4-stock-before.json', JSON.stringify({ revision: (await content()).revision, etag: settings.etag }));
}
await fs.writeFile(`../.tools/b4c4-${mode}-http.json`, JSON.stringify({ database: context.database, mode, results, mocks: false, browserInteraction: false }, null, 2));
console.log(`${results.length} B4-C4 ${mode} HTTP checks passed`);
