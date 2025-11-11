import { apiFetch } from "./api";
import { fakeWarehouses } from "@/data/fake/warehouses";

const USE_FAKE_DATA = true;

export async function getWarehouses() {
  if (USE_FAKE_DATA) {
    console.log("🧪 Usando Almacenes fake");
    return fakeWarehouses;
  }
  return apiFetch("/warehouses/");
}
