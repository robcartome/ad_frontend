import { apiFetch } from "./api";
import { fakeCatalogProducts, fakeProducts } from "../data/fake/products";

const USE_FAKE_DATA = false;

export async function getProducts(page=1, limit=10, nameFilter="") {
  const offset = (page - 1) * limit;
  if (USE_FAKE_DATA) {
    console.log("🧪 Usando datos mock (fake)");
    return fakeProducts;
  }
  return apiFetch(`/products/?name=${nameFilter}&limit=${limit}&offset=${offset}`);
}

export async function getCatalogProducts() {
  if (USE_FAKE_DATA) {
    console.log("🧪 Usando datos mock (fake)");
    return fakeCatalogProducts;
  }
  return apiFetch("/catalog_products/");
}
