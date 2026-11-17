import { apiFetch } from "./api";
export { createStorefrontProductsService } from './storefrontProductsService.mjs';

export async function getProductDetail(id, options = {}) {
  return apiFetch(`/catalog/products/${id}/detail`, { ...options, cache: "no-store" });
}

export async function getPrivateProductDetail(id, options = {}) {
  return apiFetch(`/catalog/private/products/${id}/detail`, { ...options, cache: "no-store" });
}


export async function getProducts(page=1, limit=10, nameFilter="") {
  const offset = (page - 1) * limit;
  return apiFetch(`/products/?search=${nameFilter}&limit=${limit}&offset=${offset}`);
}

export async function getCatalogProducts(page = 1, limit = 50, search = "", options = {}) {
  const offset = (page - 1) * limit;
  return apiFetch(`/catalog/products?search=${encodeURIComponent(search)}&limit=${limit}&offset=${offset}`, { ...options, cache: "no-store" });
}

export async function getCatalogProductsPrivate(page = 1, limit = 50, search = "", options = {}) {
  const offset = (page - 1) * limit;
  return apiFetch(`/catalog/private/products?search=${encodeURIComponent(search)}&limit=${limit}&offset=${offset}`, { ...options, cache: "no-store" });
}

export async function createProduct(data) {
  return apiFetch("/products/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProduct(id, data) {
  return apiFetch(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteProduct(id) {
  return apiFetch(`/products/${id}`, {
    method: "DELETE",
  });
}
