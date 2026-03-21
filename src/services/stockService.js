import { apiFetch } from "./api";

export async function getStockByProductAndWarehouse(product_id, warehouse_id) {
  // Llama al endpoint de stock por producto y filtra por almacén
  const res = await apiFetch(`/stocks/product/${product_id}`);
  if (!res || !res.warehouses) return null;
  const found = res.warehouses.find(w => w.warehouse_id === warehouse_id);
  return found ? found.quantity : 0;
}
