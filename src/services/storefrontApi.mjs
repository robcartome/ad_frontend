// Opt-in transport for a future verified public API. Does not use api.js or admin tokens.
export function createStorefrontApi({ baseUrl, storeId, fetchImpl = fetch }) {
  const base = new URL(baseUrl);
  if (!['https:', 'http:'].includes(base.protocol) || !storeId) throw new Error('Configura la URL pública y la tienda');
  return async function request(path, { params = {}, signal } = {}) {
    const url = new URL(`${base.href.replace(/\/$/, '')}/stores/${encodeURIComponent(storeId)}/${path}`);
    for (const [key, value] of Object.entries(params)) if (value !== '' && value != null) url.searchParams.set(key, String(value));
    const response = await fetchImpl(url, { headers: { Accept: 'application/json' }, credentials: 'omit', cache: 'no-store', signal });
    if (!response.ok) throw new Error(`No se pudo cargar el catálogo (${response.status})`);
    const data = await response.json();
    if (String(data.store_id) !== String(storeId)) throw new Error('El catálogo no pertenece a esta tienda');
    return data;
  };
}
export function normalizePage(data, normalize) {
  if (!Array.isArray(data.results) || !Number.isInteger(data.count) || data.count < data.results.length) throw new Error('Paginación pública inválida');
  return { results: data.results.map(normalize), count: data.count };
}
