import { apiFetch } from "./api";

export async function getWarehouses() {
  return apiFetch("/warehouses/");
}
