import { apiFetch } from "./api";

export async function getSuppliers({ search = "", limit = 20, offset = 0, active } = {}) {
  const params = new URLSearchParams({ limit, offset });
  if (search) params.set("search", search);
  if (active !== undefined) params.set("active", active);
  return apiFetch(`/suppliers/?${params}`);
}

export async function getSupplier(id) {
  return apiFetch(`/suppliers/${id}`);
}

export async function getSupplierByDocument(documentNumber) {
  return apiFetch(`/suppliers/by-document/${documentNumber}`);
}

export async function createSupplier(data) {
  return apiFetch("/suppliers/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateSupplier(id, data) {
  return apiFetch(`/suppliers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}