import { normalizeCategory } from '../lib/commerce/catalog.mjs';
import { createStorefrontApi, normalizePage } from './storefrontApi.mjs';
export function createStorefrontCategoriesService(config) {
  const request = createStorefrontApi(config);
  return {
    async list({ limit = 100, offset = 0, signal } = {}) {
      return normalizePage(await request('categories/', { params: { limit, offset }, signal }), normalizeCategory);
    },
  };
}
