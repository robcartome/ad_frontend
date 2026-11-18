import { requestHostname } from '../lib/storefront/public-website.mjs';

export function storefrontError(message, status = 502, code = 'INVALID_CATALOG', fields = {}) {
  return Object.assign(new Error(message), { status, code, fields });
}

// Anonymous host-scoped transport. Never includes administrative tokens/cookies.
export function createStorefrontApi({ baseUrl, hostname, websiteId, fetchImpl = fetch }) {
  const base = new URL(baseUrl);
  if (!['https:', 'http:'].includes(base.protocol) || !websiteId || !hostname || requestHostname(hostname) !== hostname) throw storefrontError('No se pudo identificar el catálogo de la empresa.');
  return async function request(path, { params = {}, signal } = {}) {
    const url = new URL(`${base.href.replace(/\/$/, '')}/storefront/sites/${encodeURIComponent(hostname)}/${path}`);
    for (const [key, value] of Object.entries(params)) {
      for (const item of Array.isArray(value) ? value : [value]) {
        if (item !== '' && item != null) url.searchParams.append(key, String(item));
      }
    }
    let response;
    try {
      response = await fetchImpl(url, { headers: { Accept: 'application/json' }, credentials: 'omit', cache: 'no-store', signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(10000)]) : AbortSignal.timeout(10000) });
    } catch (cause) {
      if (signal?.aborted) throw cause;
      throw storefrontError('El catálogo no está disponible en este momento.', 503, 'CATALOG_UNAVAILABLE');
    }
    let data;
    try { data = await response.json(); } catch { throw storefrontError('No pudimos leer el catálogo.', response.ok ? 502 : response.status); }
    if (!response.ok) throw Object.assign(storefrontError(data.message || 'No pudimos cargar el catálogo.', response.status, data.code || 'CATALOG_ERROR', data.fields || {}), { etag: response.headers?.get?.('ETag'), retryAfter: response.headers?.get?.('Retry-After') });
    if (String(data.websiteId) !== String(websiteId)) throw storefrontError('El catálogo no corresponde a esta empresa.');
    return data;
  };
}
export function normalizePage(data, normalize) {
  if (!Array.isArray(data.results) || !Number.isInteger(data.count) || data.count < data.results.length || !Number.isInteger(data.limit) || data.limit < 1 || data.limit > 100 || !Number.isInteger(data.offset) || data.offset < 0 || data.results.length > data.limit || (data.results.length && data.offset + data.results.length > data.count)) throw storefrontError('La página del catálogo no es válida.');
  return { results: data.results.map(normalize), count: data.count, limit: data.limit, offset: data.offset };
}
