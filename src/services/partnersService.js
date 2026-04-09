import { apiFetch } from "./api";

// ─── Clientes (sales module) ─────────────────────────────────────────────────

export async function getPartnerCustomers({ search = "", limit = 20, offset = 0, active } = {}) {
  const params = new URLSearchParams({ limit, offset });
  if (search) params.set("search", search);
  if (active !== undefined) params.set("active", active);
  return apiFetch(`/customers/?${params}`);
}

export async function getPartnerCustomer(id) {
  return apiFetch(`/customers/${id}`);
}

export async function getPartnerCustomerByDocument(documentNumber) {
  return apiFetch(`/customers/by-document/${documentNumber}`);
}

export async function createPartnerCustomer(data) {
  return apiFetch("/customers/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updatePartnerCustomer(id, data) {
  return apiFetch(`/customers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// ─── Proveedores (inventory module) ──────────────────────────────────────────

export async function getPartnerSuppliers() {
  return apiFetch(`/suppliers/`);
}

export async function getPartnerSupplier(id) {
  return apiFetch(`/suppliers/${id}`);
}

export async function createPartnerSupplier(data) {
  return apiFetch("/suppliers/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updatePartnerSupplier(id, data) {
  return apiFetch(`/suppliers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
