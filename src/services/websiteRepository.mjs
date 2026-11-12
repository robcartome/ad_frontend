import { WEBSITE_SCHEMA_VERSION, upgradeWebsiteDocument, validateWebsite } from '../lib/website/content.mjs';

// Storage layout remains v1; the contained document has its own schemaVersion.
export const websiteKey = scope => `apudig:website:v1:${encodeURIComponent(scope.companyId)}:${encodeURIComponent(scope.websiteId)}`;
export const localWebsiteScope = companyId => ({ companyId, websiteId: 'default' });
const clone = value => JSON.parse(JSON.stringify(value));
const fail = (code, message, fields) => Object.assign(new Error(message), { code, fields });

// Same asynchronous interface as the future Django repository. No network fallback.
export function createLocalWebsiteRepository(storage, productIds) {
  function read(scope, initial) {
    const raw = storage.getItem(websiteKey(scope));
    if (!raw) return { schemaVersion: WEBSITE_SCHEMA_VERSION, companyId: scope.companyId, websiteId: scope.websiteId, revision: 0, draft: clone(initial), published: null, updatedAt: null, publishedAt: null, events: [] };
    let record;
    try { record = JSON.parse(raw); } catch { throw fail('CORRUPT', 'No se pudo leer el contenido local. Los datos guardados no se sobrescribieron.'); }
    if (record?.schemaVersion === 1) {
      record = { ...record, schemaVersion: WEBSITE_SCHEMA_VERSION, draft: upgradeWebsiteDocument(record.draft), published: record.published === null ? null : upgradeWebsiteDocument(record.published) };
    }
    if (!record || record.schemaVersion !== WEBSITE_SCHEMA_VERSION || record.companyId !== scope.companyId || record.websiteId !== scope.websiteId || !Number.isInteger(record.revision) || record.revision < 0 || !Array.isArray(record.events) || record.events.length > 20 || record.events.some(event => !event || !['save', 'apply-demo'].includes(event.action) || !Number.isInteger(event.revision) || !Number.isFinite(Date.parse(event.at))) || (record.updatedAt !== null && !Number.isFinite(Date.parse(record.updatedAt))) || (record.publishedAt !== null && !Number.isFinite(Date.parse(record.publishedAt))) || Object.keys(validateWebsite(record.draft, productIds)).length || (record.published !== null && Object.keys(validateWebsite(record.published, productIds)).length)) throw fail('CORRUPT', 'El contenido local no es compatible. Conserva una copia antes de restablecerlo.');
    return record;
  }
  function write(scope, initial, expectedRevision, action, document) {
    const record = read(scope, initial);
    if (record.revision !== expectedRevision) throw fail('CONFLICT', 'Otra pestaña modificó esta web. Recarga la versión guardada antes de continuar.');
    const fields = validateWebsite(document ?? record.draft, productIds);
    if (Object.keys(fields).length) throw fail('VALIDATION', 'Revisa los campos indicados.', fields);
    const now = new Date().toISOString();
    const next = { ...record, revision: record.revision + 1, updatedAt: now, events: [{ action, at: now, revision: record.revision + 1 }, ...record.events].slice(0, 20) };
    if (action === 'save') next.draft = clone(document);
    if (action === 'apply-demo') { next.published = clone(record.draft); next.publishedAt = now; }
    try { storage.setItem(websiteKey(scope), JSON.stringify(next)); }
    catch { throw fail('STORAGE', 'No se pudo guardar. El almacenamiento está lleno o bloqueado; conserva tus cambios en esta pantalla.'); }
    return clone(next);
  }
  return {
    capabilities: { mode: 'local', mediaUpload: false, realPublication: false },
    async load(scope, initial) { return clone(read(scope, initial)); },
    async saveDraft(scope, document, revision, initial) { return write(scope, initial, revision, 'save', document); },
    async publish(scope, revision, initial) { return write(scope, initial, revision, 'apply-demo'); },
  };
}

// Proposed contract ONLY. Instantiate with authenticated apiFetch after Django implements it.
export function createDjangoWebsiteRepository(request) {
  const path = scope => `/websites/${encodeURIComponent(scope.websiteId)}`;
  return {
    capabilities: { mode: 'api', mediaUpload: true, realPublication: true },
    load: scope => request(`${path(scope)}/editor`),
    saveDraft: (scope, document, revision) => request(`${path(scope)}/draft`, { method: 'PUT', headers: { 'If-Match': `"${revision}"` }, body: JSON.stringify({ document }) }),
    publish: (scope, revision) => request(`${path(scope)}/publish`, { method: 'POST', headers: { 'If-Match': `"${revision}"` } }),
  };
}
