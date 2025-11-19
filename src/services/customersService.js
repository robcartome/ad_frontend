import { apiFetch } from "./api";

export async function getCustomers() {
  return apiFetch("/customers/");
}
