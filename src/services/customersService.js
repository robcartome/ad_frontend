import { apiFetch } from "./api";

export async function getCustomers() {
  const data = await apiFetch("/customers/?limit=100&offset=0&active=true");
  const items = Array.isArray(data) ? data : (data?.items || []);
  return items.map((customer) => ({
    ...customer,
    name: customer.trade_name || customer.legal_name || customer.document_number,
  }));
}
