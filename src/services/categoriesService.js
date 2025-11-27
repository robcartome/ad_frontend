import { apiFetch } from "./api";
import { fakeCategories } from "@/data/fake/categories";

export async function getCategories() {
  return apiFetch("/categories/");
}
