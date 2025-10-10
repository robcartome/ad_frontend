import { fakeBrands } from "@/data/fake/brands";

const USE_FAKE_DATA = true;

export async function getBrands() {
  if (USE_FAKE_DATA) {
    console.log("🧪 Usando Marcas fake");
    return fakeBrands;
  }
  return apiFetch("/brands/");
}
