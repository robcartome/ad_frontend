import { apiFetch } from "./api";
import { fakeCatalogProducts, fakeProducts } from "../data/fake/products";

const USE_FAKE_DATA = true;

export async function getProducts() {
  if (USE_FAKE_DATA) {
    console.log("🧪 Usando datos mock (fake)");
    return fakeProducts;
  }
  return apiFetch("/products/");
}

export async function getCatalogProducts() {
  if (USE_FAKE_DATA) {
    console.log("🧪 Usando datos mock (fake)");
    return fakeCatalogProducts;
  }
  return apiFetch("/catalog_products/");
}
