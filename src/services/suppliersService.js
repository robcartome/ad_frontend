import { apiFetch } from "./api";

export async function getSuppliers() {
  return apiFetch("/suppliers/");
}