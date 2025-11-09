import { apiFetch } from "./api";
import { fakeCategories } from "@/data/fake/categories";

const USE_FAKE_DATA = false;

export async function getCategories() {
  // if (USE_FAKE_DATA) {
  //   console.log("🧪 Usando categorías fake");
  //   return fakeCategories;
  // }
  return apiFetch("/categories/");
}
