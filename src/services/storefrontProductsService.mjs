import { normalizeProduct } from '../lib/commerce/catalog.mjs';
import { createStorefrontApi, normalizePage } from './storefrontApi.mjs';
export function createStorefrontProductsService(config) {
  const request = createStorefrontApi(config);
  return {
    async list({ search = '', category = '', brand = '', ordering = 'name', limit = 24, offset = 0, signal } = {}) {
      return normalizePage(await request('products/', { params: { search, category, brand, ordering, limit, offset }, signal }), normalizeProduct);
    },
    async detail(id, { signal } = {}) {
      const data = await request(`products/${encodeURIComponent(id)}/`, { signal });
      const product = normalizeProduct(data.product);
      if (product.id !== String(id)) throw new Error('Identificador de producto incorrecto');
      return product;
    },
  };
}
