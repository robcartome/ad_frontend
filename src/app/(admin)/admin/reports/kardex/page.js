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
  downloadKardexExcel,
  downloadKardexPdf,
  getKardexReport,
} from "@/services/reportsService";
import { formatDate, formatNumber, PAGE_SIZE } from "@/utils/reportUtils";

export default function KardexReportPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    warehouse_id: "",
    date_from: "",
    date_to: "",
    search: "",
  });

  useEffect(() => {
    getWarehouses().then(setWarehouses).catch(() => setWarehouses([]));
  }, []);

  useEffect(() => setPage(1), [rows]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const displayedRows = useMemo(
    () => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [rows, page],
  );

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, r) => ({
        qty_in: acc.qty_in + Number(r.qty_in || 0),
        qty_out: acc.qty_out + Number(r.qty_out || 0),
        amount: acc.amount + Number(r.amount || 0),
      }),
      { qty_in: 0, qty_out: 0, amount: 0 },
    );
  }, [rows]);

  function updateFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function requireWarehouse() {
    if (!filters.warehouse_id) {
      toast.error("Selecciona un almacen para ver el kardex");
      return false;
    }
    return true;
  }

  async function fetchReport() {
    if (!requireWarehouse()) return;
    setLoading(true);
    try {
      const data = await getKardexReport(filters);
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
    if (!requireWarehouse()) return;
    setDownloading(format);
    try {
      if (format === "excel") await downloadKardexExcel(filters);
      else await downloadKardexPdf(filters);
    } catch (err) {
      toast.error(err.message || "No se pudo descargar el reporte");
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Reporte de Kardex de Inventario</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-4 gap-3">
            <div>
              <Label>Almacen</Label>
              <select
                className="w-full mt-1 h-10 border rounded-md px-3"
                value={filters.warehouse_id}
                onChange={(e) => setFilters((prev) => ({ ...prev, warehouse_id: e.target.value }))}
              >
                <option value="">Seleccionar</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Desde</Label>
              <Input
                className="mt-1"
                type="date"
                value={filters.date_from}
                onChange={(e) => updateFilter("date_from", e.target.value)}
              />
            </div>

            <div>
              <Label>Hasta</Label>
              <Input
                className="mt-1"
                type="date"
                value={filters.date_to}
                onChange={(e) => updateFilter("date_to", e.target.value)}
              />
            </div>

            <div>
              <Label>Buscar producto</Label>
              <Input
                className="mt-1"
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Nombre, SKU o codigo (Enter)"
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
        <CardContent className="space-y-4">
          {rows.length > 0 && (
            <div className="grid gap-2 md:grid-cols-3 text-sm">
              <div className="p-3 bg-teal-50 rounded border">
                Total ingresos: <strong>{formatNumber(totals.qty_in)}</strong>
              </div>
              <div className="p-3 bg-orange-50 rounded border">
                Total salidas: <strong>{formatNumber(totals.qty_out)}</strong>
              </div>
              <div className="p-3 bg-gray-50 rounded border">
                Importe total: <strong>S/ {formatNumber(totals.amount)}</strong>
              </div>
            </div>
          )}

          <div className="overflow-x-auto border rounded-md">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-3 py-2">Fecha</th>
                  <th className="text-left px-3 py-2">Tipo</th>
                  <th className="text-left px-3 py-2">SKU</th>
                  <th className="text-left px-3 py-2">Producto</th>
                  <th className="text-left px-3 py-2">UM</th>
                  <th className="text-right px-3 py-2">Saldo Inicial</th>
                  <th className="text-right px-3 py-2">Ingreso</th>
                  <th className="text-right px-3 py-2">Salida</th>
                  <th className="text-right px-3 py-2">Saldo</th>
                  <th className="text-right px-3 py-2">P. Unit</th>
                  <th className="text-right px-3 py-2">Importe</th>
                </tr>
              </thead>
              <tbody>
                {displayedRows.map((row) => (
                  <tr key={row.movement_detail_id} className="border-t hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">{formatDate(row.date)}</td>
                    <td className="px-3 py-2">{row.type_label || row.type}</td>
                    <td className="px-3 py-2 font-mono text-xs">{row.sku || "-"}</td>
                    <td className="px-3 py-2">{row.product}</td>
                    <td className="px-3 py-2">{row.unit || "-"}</td>
                    <td className="px-3 py-2 text-right">{formatNumber(row.opening_balance)}</td>
                    <td className="px-3 py-2 text-right text-green-700">
                      {row.qty_in > 0 ? formatNumber(row.qty_in) : "-"}
                    </td>
                    <td className="px-3 py-2 text-right text-red-600">
                      {row.qty_out > 0 ? formatNumber(row.qty_out) : "-"}
                    </td>
                    <td className="px-3 py-2 text-right font-medium">{formatNumber(row.balance)}</td>
                    <td className="px-3 py-2 text-right">S/ {formatNumber(row.unit_price)}</td>
                    <td className="px-3 py-2 text-right">S/ {formatNumber(row.amount)}</td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr>
                    <td colSpan={11} className="text-center px-3 py-8 text-gray-500">
                      Selecciona un almacen y pulsa Ver reporte para consultar.
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
