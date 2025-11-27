import { apiFetch } from "./api";

export async function getUnits() {
  return apiFetch("/units/");
}
