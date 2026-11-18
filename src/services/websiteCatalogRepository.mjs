const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const commercialTag = /^"catalog-[0-9a-f]{64}"$/;
const failure = (message, status = 502) => Object.assign(new Error(message), { status, code: 'CATALOG_RESPONSE' });

// The authenticated transport owns JWT refresh. This repository never selects a Company.
export function createWebsiteCatalogRepository(request, websiteId) {
  if (!uuid.test(websiteId)) throw failure('Website inválido.');
  const base = `/websites/${websiteId}`;
  async function call(path, options = {}, tagged = false) {
    let response;
    try { response = await request(`${base}/${path}`, { ...options, cache: 'no-store', withResponse: true }); }
    catch (error) {
      if (error.status) throw error;
      throw Object.assign(new Error('El catálogo no está disponible temporalmente. Tus cambios permanecen en pantalla.'), { status: 503, code: 'CATALOG_UNAVAILABLE', cause: error });
    }
    if (tagged && !commercialTag.test(response.etag)) throw failure('No se recibió una revisión comercial válida. Recarga antes de continuar.');
    if (response.data?.websiteId && response.data.websiteId !== websiteId) throw failure('La respuesta pertenece a otro Website.');
    return response;
  }
  const query = ({ search = '', offset = 0 } = {}) => new URLSearchParams({ search, offset, limit: 20 });
  const list = async (path, options, tagged = false) => {
    const response = await call(`${path}/?${query(options)}`, {}, tagged);
    const page = response.data;
    if (!Array.isArray(page?.results) || !Number.isInteger(page.count) || !Number.isInteger(page.limit) || !Number.isInteger(page.offset)) throw failure('Página comercial inválida.');
    return response;
  };
  async function write(path, method, body, etag) {
    if (!commercialTag.test(etag)) throw failure('Recarga la revisión comercial antes de guardar.', 428);
    return call(path, { method, headers: { 'If-Match': etag }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) }, true);
  }
  return {
    async publishedReferences() {
      const rows = [], tags = new Set();
      for (let offset = 0; offset < 10000; offset += 20) {
        const response = await list('products', { offset }, true);
        tags.add(response.etag);
        if (tags.size > 1) throw failure('Las publicaciones cambiaron. Recarga la selección de productos.', 412);
        rows.push(...response.data.results.filter(row => row.isPublished).map(row => ({ id: row.productId, name: row.commercialTitle || row.slug })));
        if (offset + response.data.results.length >= response.data.count) return rows;
        if (!response.data.results.length) throw failure('No se pudo completar la selección comercial.');
      }
      throw failure('La selección necesita una consulta más específica.');
    },
    async load(options) {
      const [settings, publications] = await Promise.all([call('catalog-settings/', {}, true), list('products', options, true)]);
      if (settings.etag !== publications.etag) throw failure('El catálogo cambió durante la lectura. Recarga; tus cambios se conservaron.', 412);
      return { settings: settings.data, page: publications.data, etag: settings.etag };
    },
    options: options => list('catalog-product-options', options),
    saveSettings: (body, etag) => write('catalog-settings/', 'PATCH', body, etag),
    create: (body, etag) => write('products/', 'POST', body, etag),
    update: (id, body, etag) => {
      if (!uuid.test(id)) throw failure('Publicación inválida.');
      return write(`products/${id}/`, 'PATCH', body, etag);
    },
    remove: (id, etag) => {
      if (!uuid.test(id)) throw failure('Publicación inválida.');
      return write(`products/${id}/`, 'DELETE', undefined, etag);
    },
  };
}

export const emptyPublication = () => ({ productId: '', commercialTitle: '', commercialDescription: '', seoTitle: '', seoDescription: '', isPublished: false, isFeatured: false, position: 0, priceListId: null });
export function publicationPayload(draft, policy) {
  const result = Object.fromEntries(['commercialTitle', 'commercialDescription', 'seoTitle', 'seoDescription', 'isPublished', 'isFeatured', 'position'].map(key => [key, draft[key]]));
  if (!draft.id) result.productId = draft.productId;
  if (policy) result.priceListId = draft.priceListId || null;
  return result;
}
export function catalogFailureState(state, error) {
  return { ...state, error, conflict: state.conflict || [412, 428].includes(error.status) };
}
export const canEditPublication = (draft, edit, publish) => Boolean(edit && (!draft.isPublished || publish));
