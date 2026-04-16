import { apiFetch } from "./api";
import { TOKEN_KEY, refreshAccessToken } from "@/services/authService";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function buildQuery(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.append(key, value);
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

async function buildAuthHeaders() {
  if (typeof window === "undefined") return {};

  let token = localStorage.getItem(TOKEN_KEY);
  if (!token) return {};

  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      token = await refreshAccessToken();
      if (!token) return {};
    }
  } catch {
    // Ignore decode errors
  }

  return { Authorization: `Bearer ${token}` };
}


async function downloadReportFile(endpoint, params, fallbackFilename) {
  const query = buildQuery(params);
  const res = await fetch(`${API_URL}${endpoint}${query}`, {
    headers: {
      Accept: "*/*",
      ...(await buildAuthHeaders()),
    },
  });

  if (!res.ok) {
    let message = "No se pudo descargar el reporte";
    try {
      const data = await res.json();
      message = data?.detail || message;
    } catch {
      // Keep fallback message.
    }
    throw new Error(message);
  }

  const blob = await res.blob();
  const contentDisposition = res.headers.get("Content-Disposition") || "";
  const filenameMatch = contentDisposition.match(/filename=([^;]+)/i);
  const filename = filenameMatch
    ? filenameMatch[1].replace(/"/g, "")
    : fallbackFilename;

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export function getStockByWarehouseReport(filters = {}) {
  return apiFetch(`/reports/stock-by-warehouse${buildQuery(filters)}`);
}

export function downloadStockByWarehouseExcel(filters = {}) {
  return downloadReportFile(
    "/reports/stock-by-warehouse/export/excel",
    filters,
    "reporte_stock_almacen.xlsx",
  );
}

export function downloadStockByWarehousePdf(filters = {}) {
  return downloadReportFile(
    "/reports/stock-by-warehouse/export/pdf",
    filters,
    "reporte_stock_almacen.pdf",
  );
}

export function getMovementsReport(filters = {}) {
  return apiFetch(`/reports/movements${buildQuery(filters)}`);
}

export function downloadMovementsExcel(filters = {}) {
  return downloadReportFile(
    "/reports/movements/export/excel",
    filters,
    "reporte_movimientos_almacen.xlsx",
  );
}

export function downloadMovementsPdf(filters = {}) {
  return downloadReportFile(
    "/reports/movements/export/pdf",
    filters,
    "reporte_movimientos_almacen.pdf",
  );
}

export function getKardexReport(filters = {}) {
  return apiFetch(`/reports/kardex${buildQuery(filters)}`);
}

export function downloadKardexExcel(filters = {}) {
  return downloadReportFile(
    "/reports/kardex/export/excel",
    filters,
    "reporte_kardex_inventario.xlsx",
  );
}

export function downloadKardexPdf(filters = {}) {
  return downloadReportFile(
    "/reports/kardex/export/pdf",
    filters,
    "reporte_kardex_inventario.pdf",
  );
}

// ---------------------------------------------------------------------------
// Stock por Almacenes (multi-warehouse pivot)
// ---------------------------------------------------------------------------

/**
 * @param {string[]} warehouseIds  - list of selected warehouse IDs
 * @param {string}   search
 */
export function getStockByWarehousesReport(warehouseIds = [], search = "") {
  const params = new URLSearchParams();
  warehouseIds.forEach((id) => params.append("warehouse_ids", id));
  if (search) params.append("search", search);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return apiFetch(`/reports/stock-by-warehouses${qs}`);
}

export function downloadStockByWarehousesExcel(warehouseIds = [], search = "") {
  const params = new URLSearchParams();
  warehouseIds.forEach((id) => params.append("warehouse_ids", id));
  if (search) params.append("search", search);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return downloadReportFile(
    `/reports/stock-by-warehouses/export/excel${qs}`,
    {},
    "reporte_stock_almacenes.xlsx",
  );
}

export function downloadStockByWarehousesPdf(warehouseIds = [], search = "") {
  const params = new URLSearchParams();
  warehouseIds.forEach((id) => params.append("warehouse_ids", id));
  if (search) params.append("search", search);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return downloadReportFile(
    `/reports/stock-by-warehouses/export/pdf${qs}`,
    {},
    "reporte_stock_almacenes.pdf",
  );
}
