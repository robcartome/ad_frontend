import { apiFetch } from "./api";

function getStorefrontHostname() {
  const configured = process.env.NEXT_PUBLIC_STOREFRONT_HOST?.trim();
  if (configured) return configured;
  if (typeof window !== "undefined" && window.location.hostname) {
    return window.location.hostname;
  }
  throw new Error("No se configuró el dominio de la tienda pública");
}

function getStorefrontProductsEndpoint(suffix = "") {
  const hostname = encodeURIComponent(getStorefrontHostname());
  return `/storefront/sites/${hostname}/products${suffix}`;
}

export async function getProductDetail(id) {
  return apiFetch(getStorefrontProductsEndpoint(`/${encodeURIComponent(id)}`));
}

export async function getPrivateProductDetail(id) {
  return apiFetch(`/catalog/private/products/${id}/detail`);
}


export async function getProducts(page=1, limit=10, nameFilter="") {
  const offset = (page - 1) * limit;
  return apiFetch(`/products/?search=${nameFilter}&limit=${limit}&offset=${offset}`);
}

export async function getCatalogProducts(page = 1, limit = 50, search = "") {
  const offset = (page - 1) * limit;
  const params = new URLSearchParams({
    search,
    limit: String(limit),
    offset: String(offset),
  });
  return apiFetch(`${getStorefrontProductsEndpoint()}?${params.toString()}`);
}

export async function getCatalogProductsPrivate(page = 1, limit = 50, search = "") {
  const offset = (page - 1) * limit;
  return apiFetch(`/catalog/private/products?search=${search}&limit=${limit}&offset=${offset}`);
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
