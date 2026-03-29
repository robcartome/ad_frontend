import { apiFetch } from "./api";

export async function getWarehouses({ activeOnly = true } = {}) {
  const qs = `?active_only=${activeOnly ? "true" : "false"}`;
  return apiFetch(`/warehouses/${qs}`);
}

export async function updateWarehouse(warehouseId, payload) {
  return apiFetch(`/warehouses/${warehouseId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}