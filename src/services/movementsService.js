import { apiFetch } from "./api";

export async function getMovements({
  limit = 10,
  offset = 0,
  type = "",
  warehouse_id = "",
  date = "",
} = {}) {
  const params = new URLSearchParams();

  if (limit) params.append("limit", limit);
  if (offset) params.append("offset", offset);
  if (type && type !== "all" ) params.append("type", type);
  if (warehouse_id && warehouse_id !== "all") params.append("warehouse_id", warehouse_id);
  if (date) params.append("date", date);

  const query = params.toString() ? `?${params.toString()}` : "";
  return apiFetch(`/movements/${query}`);
}

export async function createMovement(payload) {
  return apiFetch("/movements/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}