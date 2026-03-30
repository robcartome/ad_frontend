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
  downloadMovementsExcel,
  downloadMovementsPdf,
  getMovementsReport,
} from "@/services/reportsService";
import { formatDate, formatNumber, MOVEMENT_TYPE_OPTIONS, PAGE_SIZE } from "@/utils/reportUtils";

export default function MovementsReportPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    warehouse_id: "",
    movement_type: "",
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

  // Totals grouped by movement type
  const summaryByType = useMemo(() => {
    const map = {};
    for (const row of rows) {
      const key = row.type_label || row.type;
      if (!map[key]) map[key] = { count: 0, quantity: 0, amount: 0 };
      map[key].count += 1;
      map[key].quantity += Number(row.quantity || 0);
      map[key].amount += Number(row.amount || 0);
    }
    return Object.entries(map).map(([type, data]) => ({ type, ...data }));
  }, [rows]);

  function updateFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  async function fetchReport() {
    setLoading(true);
    try {
      const data = await getMovementsReport(filters);
      setRows(Array.isArray(data) ? data : []);
      if (!data?.length) toast.info("No se encontraron movimientos para los filtros seleccionados");
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
      if (format === "excel") await downloadMovementsExcel(filters);
      else await downloadMovementsPdf(filters);
    } catch (err) {
      toast.error(err.message || "No se pudo descargar el reporte");
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Reporte de Movimientos del Almacen</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-5 gap-3">
            <div>
              <Label>Almacen</Label>
              <select
                className="w-full mt-1 h-10 border rounded-md px-3 bg-white"
                value={filters.warehouse_id}
                onChange={(e) => updateFilter("warehouse_id", e.target.value)}
              >
                <option value="">Todos</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            <div>
              <Label>Tipo</Label>
              <select
                className="w-full mt-1 h-10 border rounded-md px-3 bg-white"
                value={filters.movement_type}
                onChange={(e) => updateFilter("movement_type", e.target.value)}
              >
                <option value="">Todos</option>
                {MOVEMENT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
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
              <Label>Buscar</Label>
              <Input
                className="mt-1"
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Producto, SKU, referencia (Enter)"
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
          {/* Summary by movement type */}
          {summaryByType.length > 0 && (
            <div className="overflow-x-auto">
              <table className="text-sm border rounded-md w-auto">
                <thead className="bg-teal-50">
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold">Tipo</th>
                    <th className="text-right px-3 py-2 font-semibold">Movimientos</th>
                    <th className="text-right px-3 py-2 font-semibold">Cantidad total</th>
                    <th className="text-right px-3 py-2 font-semibold">Importe total</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryByType.map((s) => (
                    <tr key={s.type} className="border-t">
                      <td className="px-3 py-1.5 font-medium">{s.type}</td>
                      <td className="px-3 py-1.5 text-right">{s.count}</td>
                      <td className="px-3 py-1.5 text-right">{formatNumber(s.quantity)}</td>
                      <td className="px-3 py-1.5 text-right">S/ {formatNumber(s.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="overflow-x-auto border rounded-md">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-3 py-2">Fecha</th>
                  <th className="text-left px-3 py-2">Tipo</th>
                  <th className="text-left px-3 py-2">Almacen</th>
                  <th className="text-left px-3 py-2">Producto</th>
                  <th className="text-left px-3 py-2">SKU</th>
                  <th className="text-left px-3 py-2">Socio</th>
                  <th className="text-left px-3 py-2">Documento</th>
                  <th className="text-right px-3 py-2">Cantidad</th>
                  <th className="text-right px-3 py-2">P. Unit</th>
                  <th className="text-right px-3 py-2">Importe</th>
                </tr>
              </thead>
              <tbody>
                {displayedRows.map((row) => (
                  <tr key={row.movement_detail_id} className="border-t hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">{formatDate(row.date)}</td>
                    <td className="px-3 py-2">{row.type_label || row.type}</td>
                    <td className="px-3 py-2">{row.warehouse}</td>
                    <td className="px-3 py-2">{row.product}</td>
                    <td className="px-3 py-2 font-mono text-xs">{row.sku || "-"}</td>
                    <td className="px-3 py-2">{row.partner || "-"}</td>
                    <td className="px-3 py-2">{row.document || "-"}</td>
                    <td className="px-3 py-2 text-right">{formatNumber(row.quantity)}</td>
                    <td className="px-3 py-2 text-right">S/ {formatNumber(row.unit_price)}</td>
                    <td className="px-3 py-2 text-right">S/ {formatNumber(row.amount)}</td>
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
