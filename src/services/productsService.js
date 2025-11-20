import { apiFetch } from "./api";

export async function getProductDetail(id) {
  return apiFetch(`/catalog/products/${id}/detail`);
}

export async function getProducts(page=1, limit=10, nameFilter="") {
  const offset = (page - 1) * limit;
  return apiFetch(`/products/?search=${nameFilter}&limit=${limit}&offset=${offset}`);
}

export async function getCatalogProducts(page=1, limit=10, search="") {
  const offset = (page - 1) * limit;
  return apiFetch(`/catalog/products?search=${search}&limit=${limit}&offset=${offset}`);
}

// 🔹 Crear producto
export async function createProduct(data) {
  return apiFetch("/products/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// 🔹 Actualizar producto
export async function updateProduct(id, data) {
  return apiFetch(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// 🔹 Eliminar producto
export async function deleteProduct(id) {
  return apiFetch(`/products/${id}`, {
    method: "DELETE",
  });
}