/**
 * mvpCatalogService.js — Catalog API calls against apudig_mvp.
 *
 * Access level is resolved automatically by mvpFetch:
 *   - No MVP token in localStorage  → public request (price_purchase hidden)
 *   - Valid MVP token present        → employee request (price_purchase included)
 */

import { mvpFetch } from "./mvpApi";

/**
 * List products from the catalog.
 * Compatible with the same response shape as getCatalogProducts in productsService.js
 * (which calls ad_backend). Use this one when the data source is apudig_mvp.
 *
 * @param {number} page    1-based page number
 * @param {number} limit   items per page
 * @param {string} search  name/sku filter
 * @param {string} brand   brand UUID filter (optional)
 * @param {string} category category UUID filter (optional)
 */
export async function getMvpCatalogProducts(
  page = 1,
  limit = 50,
  search = "",
  brand = "",
  category = ""
) {
  const offset = (page - 1) * limit;
  const params = new URLSearchParams({ limit, offset });
  if (search) params.set("search", search);
  if (brand) params.set("brand", brand);
  if (category) params.set("category", category);

  return mvpFetch(`/catalog/products?${params.toString()}`);
}

/**
 * Get full product detail including prices and stock by warehouse.
 * price_purchase is only present when the caller has a valid employee JWT.
 *
 * @param {string} id  Product UUID
 */
export async function getMvpProductDetail(id) {
  return mvpFetch(`/catalog/products/${id}/detail`);
}
