import test from 'node:test';
import assert from 'node:assert/strict';
import { WEBSITE_SCHEMA_VERSION, MAX_LOCAL_IMAGE_BYTES, createWebsiteDocument, upgradeWebsiteDocument, validateWebsite, isSafeLink, isSafeImage, isAnnouncementImage, specialProducts, visiblePromotions, previewStore, fromLimaInput, limaDateInput } from '../src/lib/website/content.mjs';
import { createLocalWebsiteRepository, createDjangoWebsiteRepository, websiteKey } from '../src/services/websiteRepository.mjs';

const scope = { companyId: 'company-one', websiteId: 'default' };
const secondScope = { companyId: 'company-two', websiteId: 'default' };
const initial = createWebsiteDocument();
const memory = () => {
  const map = new Map();
  return { getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, value) };
};

test('validates default documents, long company names, URL protocols and media accessibility', () => {
  assert.deepEqual(validateWebsite(initial), {});
  assert.deepEqual(validateWebsite(createWebsiteDocument('Empresa '.repeat(20))), {});
  for (const value of ['javascript:alert(1)', '//external.test', '/\\external', '/with space']) assert.equal(isSafeLink(value), false);
  assert.equal(isSafeLink('/catalog?category=herramientas'), true);
  for (const value of ['data:image/svg+xml,test', 'http://example.com/a.jpg', 'https://user:pass@example.com/image.jpg']) assert.equal(isSafeImage(value), false);
  assert.equal(isSafeImage('https://cdn.example.com/image.jpg'), true);
  const invalid = structuredClone(initial);
  invalid.banners[0].imageUrl = 'https://cdn.example.com/image.jpg';
  invalid.banners[0].href = 'javascript:alert(1)';
  assert.ok(validateWebsite(invalid)['banners.0.imageAlt']);
  assert.ok(validateWebsite(invalid)['banners.0.href']);
});

test('rejects duplicate sections, unknown products and invalid campaign periods', () => {
  const invalid = structuredClone(initial);
  invalid.sections[0] = invalid.sections[1];
  invalid.promotions[0].productIds = ['not-in-company'];
  invalid.promotions[0].startsAt = '2026-11-12T14:00:00.000Z';
  invalid.promotions[0].endsAt = '2026-11-12T13:00:00.000Z';
  const errors = validateWebsite(invalid, ['allowed']);
  assert.ok(errors.sections);
  assert.ok(errors['promotions.0.productIds']);
  assert.ok(errors['promotions.0.endsAt']);
});

test('draft saving is company isolated and never modifies the applied snapshot', async () => {
  const storage = memory();
  const repository = createLocalWebsiteRepository(storage, []);
  const start = await repository.load(scope, initial);
  assert.equal(start.published, null);
  const draft = structuredClone(initial);
  draft.banners[0].title = 'Nuevo mensaje';
  const saved = await repository.saveDraft(scope, draft, start.revision, initial);
  assert.equal(saved.published, null);
  const applied = await repository.publish(scope, saved.revision, initial);
  draft.banners[0].title = 'Cambio todavía no aplicado';
  const edited = await repository.saveDraft(scope, draft, applied.revision, initial);
  assert.equal(edited.published.banners[0].title, 'Nuevo mensaje');
  assert.equal(edited.draft.banners[0].title, 'Cambio todavía no aplicado');
  const other = await repository.load(secondScope, initial);
  assert.equal(other.revision, 0);
  assert.equal(other.published, null);
  assert.notEqual(websiteKey(scope), websiteKey(secondScope));
  assert.notEqual(websiteKey(scope), websiteKey({ ...scope, websiteId: 'another' }));
});

test('stale writes fail without overwriting another revision', async () => {
  const repository = createLocalWebsiteRepository(memory(), []);
  const saved = await repository.saveDraft(scope, initial, 0, initial);
  await assert.rejects(repository.saveDraft(scope, initial, 0, initial), error => error.code === 'CONFLICT');
  await assert.rejects(repository.publish(scope, 0, initial), error => error.code === 'CONFLICT');
  assert.equal((await repository.load(scope, initial)).revision, saved.revision);
});

test('corrupt and wrong-tenant records are not silently overwritten', async () => {
  const storage = memory();
  storage.setItem(websiteKey(scope), 'null');
  const repository = createLocalWebsiteRepository(storage, []);
  await assert.rejects(repository.load(scope, initial), error => error.code === 'CORRUPT');
  assert.equal(storage.getItem(websiteKey(scope)), 'null');
  const fresh = await repository.load(secondScope, initial);
  storage.setItem(websiteKey(scope), JSON.stringify(fresh));
  await assert.rejects(repository.load(scope, initial), error => error.code === 'CORRUPT');
});

test('storage quota and invalid content never report a successful save', async () => {
  const repository = createLocalWebsiteRepository({ getItem: () => null, setItem: () => { throw Error('quota'); } }, []);
  await assert.rejects(repository.saveDraft(scope, initial, 0, initial), error => error.code === 'STORAGE');
  const invalid = structuredClone(initial);
  invalid.identity.name = '';
  await assert.rejects(repository.saveDraft(scope, invalid, 0, initial), error => error.code === 'VALIDATION');
});

test('preview uses Lima dates and exact inclusive start/exclusive end boundaries', () => {
  const document = structuredClone(initial);
  document.promotions[0].startsAt = fromLimaInput('2026-11-12T09:00');
  document.promotions[0].endsAt = fromLimaInput('2026-11-12T10:00');
  assert.equal(document.promotions[0].startsAt, '2026-11-12T14:00:00.000Z');
  assert.equal(limaDateInput(document.promotions[0].startsAt), '2026-11-12T09:00');
  assert.equal(visiblePromotions(document, Date.parse('2026-11-12T13:59:59Z')).length, 0);
  assert.equal(visiblePromotions(document, Date.parse('2026-11-12T14:00:00Z')).length, 1);
  assert.equal(visiblePromotions(document, Date.parse('2026-11-12T15:00:00Z')).length, 0);
  assert.equal(limaDateInput('broken'), '');
});

test('preview never trusts content to override store ID or enable live WhatsApp', () => {
  const document = structuredClone(initial);
  Object.assign(document.identity, { id: 'other-company', mode: 'live' });
  const store = previewStore({ id: 'safe-preview', colors: {} }, document);
  assert.equal(store.id, 'safe-preview');
  assert.equal(store.mode, 'demo');
});

test('future Django repository sends revision preconditions and no client-selected company', async () => {
  const calls = [];
  const api = createDjangoWebsiteRepository(async (...args) => { calls.push(args); return {}; });
  await api.load(scope);
  await api.saveDraft(scope, initial, 3);
  await api.publish(scope, 4);
  assert.deepEqual(calls[0], ['/websites/default/editor']);
  assert.equal(calls[1][1].headers['If-Match'], '"3"');
  assert.equal(JSON.parse(calls[1][1].body).companyId, undefined);
  assert.equal(calls[2][0], '/websites/default/publish');
  assert.equal(calls[2][1].method, 'POST');
});

test('old editorial documents migrate storefront destinations without changing worker links authored under v2', async () => {
  const storage = memory();
  const repository = createLocalWebsiteRepository(storage, []);
  const first = await repository.saveDraft(scope, initial, 0, initial);
  const oldDocument = { ...structuredClone(initial), schemaVersion: 1 };
  oldDocument.banners[0].title = 'Mensaje conservado';
  oldDocument.banners[0].href = '/catalog?category=herramientas';
  oldDocument.promotions[0].href = '/catalog/demo-taladro';
  const raw = JSON.stringify({ ...first, schemaVersion: 1, draft: oldDocument, published: oldDocument });
  storage.setItem(websiteKey(scope), raw);
  const migrated = await repository.load(scope, initial);
  assert.equal(migrated.draft.schemaVersion, WEBSITE_SCHEMA_VERSION);
  assert.equal(migrated.draft.banners[0].title, 'Mensaje conservado');
  assert.equal(migrated.draft.banners[0].href, '/shop?category=herramientas');
  assert.equal(migrated.published.promotions[0].href, '/shop/demo-taladro');
  assert.equal(migrated.revision, first.revision);
  assert.equal(storage.getItem(websiteKey(scope)), raw, 'Reading does not overwrite the saved document');
  const current = structuredClone(initial);
  current.banners[0].href = '/catalog';
  assert.equal(upgradeWebsiteDocument(current).banners[0].href, '/catalog');
  oldDocument.banners[0].href = '/catalogue';
  assert.equal(upgradeWebsiteDocument(oldDocument).banners[0].href, '/catalogue');
});

test('announcement slider enforces eight items, accessible images, safe links and badge configuration', () => {
  const document = structuredClone(initial);
  const template = document.announcements.items[0];
  document.announcements.items = Array.from({ length: 8 }, (_, index) => ({ ...template, id: `notice-${index}`, badge: 'OFERTA POR DÍAS' }));
  assert.deepEqual(validateWebsite(document), {});
  document.announcements.items.push({ ...template, id: 'notice-nine' });
  assert.ok(validateWebsite(document).announcements);
  document.announcements.items.pop();
  document.announcements.items[0].imageUrl = 'https://cdn.example.com/promo.webp';
  document.announcements.items[0].imageAlt = '';
  document.announcements.items[0].badgePosition = 'arbitrary-position';
  document.announcements.items[0].href = 'javascript:alert(1)';
  const errors = validateWebsite(document);
  assert.ok(errors['announcements.items.0.imageAlt']);
  assert.ok(errors['announcements.items.0.badgePosition']);
  assert.ok(errors['announcements.items.0.href']);
});

test('special products are limited to four owned IDs and retain the selected editorial order', () => {
  const products = Array.from({ length: 5 }, (_, index) => ({ id: `product-${index}` }));
  const ids = products.map(product => product.id);
  const document = createWebsiteDocument('Mi empresa', ids);
  assert.equal(document.specials.productIds.length, 4);
  assert.deepEqual(validateWebsite(document, ids), {});
  document.specials.productIds = [ids[3], ids[1]];
  assert.deepEqual(specialProducts(document, products).map(product => product.id), [ids[3], ids[1]]);
  document.specials.productIds = ids;
  assert.ok(validateWebsite(document, ids)['specials.productIds']);
  assert.equal(specialProducts(document, products).length, 4);
  document.specials.productIds = ['other-company'];
  assert.ok(validateWebsite(document, ids)['specials.productIds']);
  document.specials.productIds = [ids[0], ids[0]];
  assert.ok(validateWebsite(document, ids)['specials.productIds']);
});

test('local announcement image validation rejects active formats and oversized payloads', () => {
  const pixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Yj4XFEAAAAASUVORK5CYII=';
  assert.equal(isAnnouncementImage(pixel), true);
  assert.equal(isSafeImage(pixel), false, 'Inline demo media is confined to editorial banners and announcements');
  assert.equal(isAnnouncementImage('data:image/svg+xml;base64,PHN2Zz48L3N2Zz4='), false);
  assert.equal(isAnnouncementImage('data:text/html;base64,AAAA'), false);
  assert.equal(isAnnouncementImage('data:image/png;base64,%%%'), false);
  assert.equal(isAnnouncementImage(`data:image/webp;base64,${Buffer.alloc(MAX_LOCAL_IMAGE_BYTES + 1).toString('base64')}`), false);
});

test('v2 drafts and applied versions gain the new sections without dropping custom content or writing on read', async () => {
  const storage = memory();
  const repository = createLocalWebsiteRepository(storage, []);
  const saved = await repository.saveDraft(scope, initial, 0, initial);
  const older = structuredClone(initial);
  older.schemaVersion = 2;
  older.sections = older.sections.filter(section => !['announcements', 'specials'].includes(section.type));
  older.sections[0].title = 'Título anterior personalizado';
  delete older.announcements;
  delete older.specials;
  const raw = JSON.stringify({ ...saved, schemaVersion: 2, draft: older, published: older });
  storage.setItem(websiteKey(scope), raw);
  const loaded = await repository.load(scope, initial);
  assert.equal(loaded.draft.schemaVersion, WEBSITE_SCHEMA_VERSION);
  assert.equal(loaded.draft.sections[0].title, 'Título anterior personalizado');
  assert.equal(loaded.draft.sections.length, 7);
  assert.equal(loaded.published.announcements.items.length, 4);
  assert.deepEqual(loaded.draft.specials.productIds, []);
  assert.equal(loaded.revision, saved.revision);
  assert.equal(storage.getItem(websiteKey(scope)), raw);
});

test('hero settings remain compatible and validate editorial autoplay limits', async () => {
  const { heroSliderSettings, nextSlide } = await import('../src/lib/website/slider.mjs');
  assert.deepEqual(heroSliderSettings(), { autoplay: true, intervalMs: 6000 });
  assert.deepEqual(heroSliderSettings({ autoplay: false, intervalMs: 9000 }), { autoplay: false, intervalMs: 9000 });
  assert.equal(heroSliderSettings({ intervalMs: 10 }).intervalMs, 6000);
  assert.equal(nextSlide(2, 3), 0);
  assert.equal(nextSlide(0, 3, -1), 2);
  assert.equal(nextSlide(0, 0), 0);
  const document = structuredClone(initial);
  delete document.heroSlider;
  assert.deepEqual(validateWebsite(document), {});
  document.heroSlider = { autoplay: 'yes', intervalMs: 2999 };
  assert.ok(validateWebsite(document)['banners.autoplay']);
  assert.ok(validateWebsite(document)['banners.intervalMs']);
  document.heroSlider = { autoplay: true, intervalMs: 15001 };
  assert.ok(validateWebsite(document)['banners.intervalMs']);
});

test('notice CTA and descriptions accept old records and reject empty or oversized editorial copy', () => {
  const document = structuredClone(initial);
  const item = document.announcements.items[0];
  delete item.ctaLabel; delete item.description;
  assert.deepEqual(validateWebsite(document), {});
  item.ctaLabel = '';
  item.description = 'x'.repeat(181);
  assert.ok(validateWebsite(document)['announcements.items.0.ctaLabel']);
  assert.ok(validateWebsite(document)['announcements.items.0.description']);
  item.ctaLabel = 'x'.repeat(41);
  assert.ok(validateWebsite(document)['announcements.items.0.ctaLabel']);
});

test('local snapshots retain slider configuration, per-notice CTA and optimized hero media', async () => {
  const repository = createLocalWebsiteRepository(memory(), []);
  const document = structuredClone(initial);
  document.heroSlider = { autoplay: false, intervalMs: 8000 };
  document.announcements.items[0].ctaLabel = 'Haz tu pedido';
  document.banners[0].imageUrl = 'data:image/webp;base64,AAAA';
  document.banners[0].mobileImageUrl = 'data:image/webp;base64,AAAA';
  document.banners[0].imageAlt = 'Banner editorial';
  assert.deepEqual(validateWebsite(document), {});
  const saved = await repository.saveDraft(scope, document, 0, initial);
  await repository.publish(scope, saved.revision, initial);
  const loaded = await repository.load(scope, initial);
  assert.deepEqual(loaded.published.heroSlider, document.heroSlider);
  assert.equal(loaded.published.announcements.items[0].ctaLabel, 'Haz tu pedido');
  assert.equal(loaded.published.banners[0].mobileImageUrl, document.banners[0].mobileImageUrl);
  document.banners[0].imageUrl = 'data:image/svg+xml;base64,PHN2Zz4=';
  assert.ok(validateWebsite(document)['banners.0.imageUrl']);
});
