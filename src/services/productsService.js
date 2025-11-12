import { apiFetch } from "./api";
import { fakeCatalogProducts, fakeProducts } from "../data/fake/products";

const USE_FAKE_DATA = false;

export async function getProducts(page=1, limit=10, nameFilter="") {
  const offset = (page - 1) * limit;
  return apiFetch(`/products/?name=${nameFilter}&limit=${limit}&offset=${offset}`);
}

export async function getCatalogProducts() {
  if (USE_FAKE_DATA) {
    console.log("🧪 Usando datos mock (fake)");
    return fakeCatalogProducts;
  }
  return apiFetch("/catalog_products/");
}

// 🔹 Crear producto
export async function createProduct(data) {
  if (USE_FAKE_DATA) {
    const newProduct = { id: crypto.randomUUID(), ...data };
    fakeProducts.push(newProduct);
    return newProduct;
  }
  return apiFetch("/products/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// 🔹 Actualizar producto
export async function updateProduct(id, data) {
  if (USE_FAKE_DATA) {
    const idx = fakeProducts.findIndex((p) => p.id === id);
    if (idx !== -1) fakeProducts[idx] = { ...fakeProducts[idx], ...data };
    return fakeProducts[idx];
  }
  return apiFetch(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// 🔹 Eliminar producto
export async function deleteProduct(id) {
  if (USE_FAKE_DATA) {
    const idx = fakeProducts.findIndex((p) => p.id === id);
    if (idx !== -1) fakeProducts.splice(idx, 1);
    return true;
  }
  return apiFetch(`/products/${id}`, {
    method: "DELETE",
  });
}