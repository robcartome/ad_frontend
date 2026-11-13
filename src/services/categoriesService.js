import { apiFetch } from "./api";
export { createStorefrontCategoriesService } from './storefrontCategoriesService.mjs';

export async function getCategories() {
  return apiFetch("/categories/");
}
