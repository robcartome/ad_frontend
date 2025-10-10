import { fakeMovements } from "@/data/fake/movements";

const USE_FAKE_DATA = true;

export async function geMovements() {
  if (USE_FAKE_DATA) {
    console.log("🧪 Usando Movimientos fake");
    return fakeMovements;
  }
  return apiFetch("/movements/");
}
