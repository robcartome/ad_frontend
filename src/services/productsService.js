import { apiFetch } from "./api";

export async function getProductDetail(id) {
  return apiFetch(`/catalog/products/${id}/detail`);
}

// Obtener detalles de un producto de http://localhost:8000/api/v1/catalog/private/products/5b6cc9a7-e729-4b37-b347-c3ac0d584645/detail/
export async function getPrivateProductDetail(id) {
  return apiFetch(`/catalog/private/products/${id}/detail`);
}


export async function getProducts(page=1, limit=10, nameFilter="") {
  const offset = (page - 1) * limit;
  return apiFetch(`/products/?search=${nameFilter}&limit=${limit}&offset=${offset}`);
}

export async function getCatalogProducts(page = 1, limit = 50, search = "") {
  const offset = (page - 1) * limit;
  return apiFetch(`/catalog/products?search=${search}&limit=${limit}&offset=${offset}`);
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