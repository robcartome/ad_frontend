import { normalizeProduct, normalizeCategory, normalizeBrand } from '../lib/commerce/catalog.mjs';
import { createStorefrontApi, normalizePage, storefrontError } from './storefrontApi.mjs';

const validPrice = value => value === null || (typeof value === 'string' && /^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value));
function commercialProduct(raw) {
  if (!raw || !/^[A-Z]{3}$/.test(raw.currency) || !raw.unitId || !validPrice(raw.price)) throw storefrontError('La oferta comercial recibida no es válida.');
  return normalizeProduct(raw);
}
export function createStorefrontProductsService(config) {
  const request = createStorefrontApi(config);
  return {
    async list({ search = '', category = [], brand = [], min = '', max = '', ordering = 'name', featured, limit, offset = 0, signal } = {}) {
      const data = await request('products/', { params: { search, category, brand, min, max, ordering, featured, limit, offset }, signal });
      const page = normalizePage(data, commercialProduct);
      if (!Array.isArray(data.facets?.categories) || !Array.isArray(data.facets?.brands)) throw storefrontError('No pudimos leer los filtros del catálogo.');
      return { ...page, facets: { categories: data.facets.categories.map(normalizeCategory), brands: data.facets.brands.map(normalizeBrand) } };
    },
    async detail(id, { signal } = {}) {
      const data = await request(`products/${encodeURIComponent(id)}/`, { signal });
      const product = commercialProduct(data.product);
      if (product.id !== String(id) || !Array.isArray(data.product.saleUnits) || !data.product.saleUnits.length || data.product.saleUnits.some(unit => !unit.unitId || !unit.unit || !validPrice(unit.price))) throw storefrontError('El producto recibido no corresponde a la selección.');
      return product;
    },
  };
}
