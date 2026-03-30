"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import { getWarehouses } from "@/services/warehousesService";
import {
  downloadStockByWarehouseExcel,
  downloadStockByWarehousePdf,
  getStockByWarehouseReport,
} from "@/services/reportsService";
import { formatNumber, PAGE_SIZE } from "@/utils/reportUtils";

const STATUS_BADGE = {
  CRITICO: "bg-red-100 text-red-700",
  BAJO: "bg-yellow-100 text-yellow-700",
  NORMAL: "bg-green-100 text-green-700",
};

export default function StockByWarehouseReportPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(null); // "excel" | "pdf" | null
  const [warehouses, setWarehouses] = useState([]);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ warehouse_id: "", search: "" });

  useEffect(() => {
    getWarehouses().then(setWarehouses).catch(() => setWarehouses([]));
  }, []);

  useEffect(() => setPage(1), [rows]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const displayedRows = useMemo(
    () => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [rows, page],
  );

  const totalStock = useMemo(
    () => rows.reduce((acc, r) => acc + Number(r.stock || 0), 0),
    [rows],
  );
  const totalValuation = useMemo(
    () => rows.reduce((acc, r) => acc + Number(r.valuation || 0), 0),
    [rows],
  );

  function updateFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  async function fetchReport() {
    setLoading(true);
    try {
      const data = await getStockByWarehouseReport(filters);
      setRows(Array.isArray(data) ? data : []);
      if (!data?.length) toast.info("No se encontraron datos para los filtros seleccionados");
    } catch (err) {
      toast.error(err.message || "No se pudo obtener el reporte");
    } finally {
      setLoading(false);
    }
  }

  function handleSearchKeyDown(e) {
    if (e.key === "Enter") fetchReport();
  }

  async function handleDownload(format) {
    setDownloading(format);
    try {
      if (format === "excel") await downloadStockByWarehouseExcel(filters);
      else await downloadStockByWarehousePdf(filters);
    } catch (err) {
      toast.error(err.message || "No se pudo descargar el reporte");
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Reporte de Stock por Almacen</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <Label>Almacen</Label>
              <select
                className="w-full mt-1 h-10 border rounded-md px-3 bg-white"
                value={filters.warehouse_id}
                onChange={(e) => updateFilter("warehouse_id", e.target.value)}
              >
                <option value="">Todos los almacenes</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <Label>Buscar producto (SKU, nombre o codigo de barra)</Label>
              <Input
                className="mt-1"
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Ej: plancha, 0204008, 775... (Enter para buscar)"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={fetchReport} disabled={loading}>
              {loading ? "Consultando..." : "Ver reporte"}
            </Button>
            <Button variant="outline" disabled={!!downloading} onClick={() => handleDownload("excel")}>
              {downloading === "excel" ? "Descargando..." : "Descargar Excel"}
            </Button>
            <Button variant="outline" disabled={!!downloading} onClick={() => handleDownload("pdf")}>
              {downloading === "pdf" ? "Descargando..." : "Descargar PDF"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap justify-between items-center gap-2">
          <CardTitle className="text-base">Vista previa en navegador</CardTitle>
          <p className="text-xs text-gray-600">
            {rows.length} registro{rows.length !== 1 ? "s" : ""}
            {rows.length > PAGE_SIZE && ` — pagina ${page} de ${totalPages}`}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 md:grid-cols-2 text-sm">
            <div className="p-3 bg-gray-50 rounded border">
              Stock total: <strong>{formatNumber(totalStock)}</strong>
            </div>
            <div className="p-3 bg-gray-50 rounded border">
              Valorizacion total: <strong>S/ {formatNumber(totalValuation)}</strong>
            </div>
          </div>

          <div className="overflow-x-auto border rounded-md">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-3 py-2">Almacen</th>
                  <th className="text-left px-3 py-2">SKU</th>
                  <th className="text-left px-3 py-2">Producto</th>
                  <th className="text-left px-3 py-2">UM</th>
                  <th className="text-left px-3 py-2">Categoria</th>
                  <th className="text-right px-3 py-2">Stock</th>
                  <th className="text-right px-3 py-2">Minimo</th>
                  <th className="text-left px-3 py-2">Estado</th>
                  <th className="text-right px-3 py-2">P. Compra</th>
                  <th className="text-right px-3 py-2">Valorizacion</th>
                </tr>
              </thead>
              <tbody>
                {displayedRows.map((row) => (
                  <tr key={`${row.product_id}-${row.warehouse}`} className="border-t hover:bg-gray-50">
                    <td className="px-3 py-2">{row.warehouse}</td>
                    <td className="px-3 py-2 font-mono text-xs">{row.sku || "-"}</td>
                    <td className="px-3 py-2">{row.product}</td>
                    <td className="px-3 py-2">{row.unit || "-"}</td>
                    <td className="px-3 py-2">{row.category || "-"}</td>
                    <td className="px-3 py-2 text-right">{formatNumber(row.stock)}</td>
                    <td className="px-3 py-2 text-right">{formatNumber(row.min_stock)}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[row.status] || ""}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">S/ {formatNumber(row.price_purchase)}</td>
                    <td className="px-3 py-2 text-right">S/ {formatNumber(row.valuation)}</td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr>
                    <td colSpan={10} className="text-center px-3 py-8 text-gray-500">
                      Usa los filtros y pulsa Ver reporte para consultar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </CardContent>
      </Card>
    </div>
  );
}
