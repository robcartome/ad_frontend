import { apiFetch } from "./api";

// ─── Customers ────────────────────────────────────────────────────────────────
export async function getSalesCustomers({ search = "", limit = 50, offset = 0 } = {}) {
  const params = new URLSearchParams({ limit, offset });
  if (search) params.set("search", search);
  return apiFetch(`/customers/?${params}`);
}

export async function getSalesCustomer(id) {
  return apiFetch(`/customers/${id}`);
}

export async function createSalesCustomer(data) {
  return apiFetch("/customers/", { method: "POST", body: JSON.stringify(data) });
}

export async function updateSalesCustomer(id, data) {
  return apiFetch(`/customers/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

// ─── Document Series ──────────────────────────────────────────────────────────
export async function getSeries(voucherType = null) {
  const params = new URLSearchParams();
  if (voucherType) params.set("voucher_type", voucherType);
  return apiFetch(`/sales/series/?${params}`);
}

export async function createSeries(data) {
  return apiFetch("/sales/series/", { method: "POST", body: JSON.stringify(data) });
}

// ─── Quotations ───────────────────────────────────────────────────────────────
export async function getQuotations({ limit = 20, offset = 0, status, customer_id, date_from, date_to, search } = {}) {
  const params = new URLSearchParams({ limit, offset });
  if (status) params.set("status", status);
  if (customer_id) params.set("customer_id", customer_id);
  if (date_from) params.set("date_from", date_from);
  if (date_to) params.set("date_to", date_to);
  if (search) params.set("search", search);
  return apiFetch(`/sales/quotations/?${params}`);
}

export async function getQuotation(id) {
  return apiFetch(`/sales/quotations/${id}`);
}

export async function createQuotation(data) {
  return apiFetch("/sales/quotations/", { method: "POST", body: JSON.stringify(data) });
}

export async function sendQuotation(id) {
  return apiFetch(`/sales/quotations/${id}/send`, { method: "POST" });
}

export async function approveQuotation(id) {
  return apiFetch(`/sales/quotations/${id}/approve`, { method: "POST" });
}

export async function rejectQuotation(id) {
  return apiFetch(`/sales/quotations/${id}/reject`, { method: "POST" });
}

export async function cancelQuotation(id) {
  return apiFetch(`/sales/quotations/${id}/cancel`, { method: "POST" });
}

export async function newVersionQuotation(id, issue_date = null) {
  const params = issue_date ? `?issue_date=${issue_date}` : "";
  return apiFetch(`/sales/quotations/${id}/new-version${params}`, { method: "POST" });
}

// ─── Sale Orders ──────────────────────────────────────────────────────────────
export async function getSaleOrders({ limit = 20, offset = 0, status, customer_id, date_from, date_to, search } = {}) {
  const params = new URLSearchParams({ limit, offset });
  if (status) params.set("status", status);
  if (customer_id) params.set("customer_id", customer_id);
  if (date_from) params.set("date_from", date_from);
  if (date_to) params.set("date_to", date_to);
  if (search) params.set("search", search);
  return apiFetch(`/sales/orders/?${params}`);
}

export async function getSaleOrder(id) {
  return apiFetch(`/sales/orders/${id}`);
}

export async function createSaleOrder(data) {
  return apiFetch("/sales/orders/", { method: "POST", body: JSON.stringify(data) });
}

export async function createSaleOrderFromQuotation(quotationId, data) {
  return apiFetch(`/sales/orders/from-quotation/${quotationId}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function confirmSaleOrder(id) {
  return apiFetch(`/sales/orders/${id}/confirm`, { method: "POST" });
}

export async function cancelSaleOrder(id) {
  return apiFetch(`/sales/orders/${id}/cancel`, { method: "POST" });
}

// ─── Vouchers ─────────────────────────────────────────────────────────────────
export async function getVouchers({ limit = 20, offset = 0, voucher_type, status, customer_id, date_from, date_to } = {}) {
  const params = new URLSearchParams({ limit, offset });
  if (voucher_type) params.set("voucher_type", voucher_type);
  if (status) params.set("status", status);
  if (customer_id) params.set("customer_id", customer_id);
  if (date_from) params.set("date_from", date_from);
  if (date_to) params.set("date_to", date_to);
  return apiFetch(`/sales/vouchers/?${params}`);
}

export async function getVoucher(id) {
  return apiFetch(`/sales/vouchers/${id}`);
}

export async function createVoucher(data) {
  return apiFetch("/sales/vouchers/", { method: "POST", body: JSON.stringify(data) });
}

export async function issueVoucher(id) {
  return apiFetch(`/sales/vouchers/${id}/issue`, { method: "POST" });
}

export async function cancelVoucher(id) {
  return apiFetch(`/sales/vouchers/${id}/cancel`, { method: "POST" });
}
