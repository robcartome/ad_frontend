import test from 'node:test';
import assert from 'node:assert/strict';
import { createWebsiteDocument, validateWebsite, isSafeLink, isSafeImage, visiblePromotions, previewStore, fromLimaInput, limaDateInput } from '../src/lib/website/content.mjs';
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
