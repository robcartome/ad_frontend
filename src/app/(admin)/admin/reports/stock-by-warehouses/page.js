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
  downloadStockByWarehousesExcel,
  downloadStockByWarehousesPdf,
  getStockByWarehousesReport,
} from "@/services/reportsService";
import { formatNumber, PAGE_SIZE } from "@/utils/reportUtils";

export default function StockByWarehousesReportPage() {
  const [data, setData] = useState({ warehouses: [], rows: [] });
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [allWarehouses, setAllWarehouses] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]); // [] = all warehouses
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    getWarehouses().then(setAllWarehouses).catch(() => setAllWarehouses([]));
  }, []);

  useEffect(() => setPage(1), [data]);

  const rows = data.rows;
  const warehouses = data.warehouses;
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const displayedRows = useMemo(
    () => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [rows, page],
  );

  const columnTotals = useMemo(() => {
    const totals = {};
    let grandTotal = 0;
    let grandValuation = 0;
    for (const row of rows) {
      for (const wh of warehouses) {
        totals[wh.id] = (totals[wh.id] || 0) + Number(row.stocks?.[wh.id] || 0);
      }
      grandTotal += Number(row.total_stock || 0);
      grandValuation += Number(row.total_valuation || 0);
    }
    return { byWarehouse: totals, grandTotal, grandValuation };
  }, [rows, warehouses]);

  function toggleWarehouse(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function fetchReport() {
    setLoading(true);
    try {
      const result = await getStockByWarehousesReport(selectedIds, search);
      setData(result || { warehouses: [], rows: [] });
      if (!result?.rows?.length) toast.info("No se encontraron datos para los filtros seleccionados");
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
      if (format === "excel") await downloadStockByWarehousesExcel(selectedIds, search);
      else await downloadStockByWarehousesPdf(selectedIds, search);
    } catch (err) {
      toast.error(err.message || "No se pudo descargar el reporte");
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Reporte de Stock por Almacenes</h1>
      <p className="text-sm text-gray-500">
        Selecciona uno o varios almacenes para comparar el stock de cada producto en la misma fila.
        Sin seleccion se muestran todos.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-2 block">Almacenes</Label>
            <div className="flex flex-wrap gap-2">
              {allWarehouses.map((w) => {
                const checked = selectedIds.includes(w.id);
                return (
                  <label
                    key={w.id}
                    className={[
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm cursor-pointer select-none transition-colors",
                      checked
                        ? "bg-teal-700 text-white border-teal-700"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
                    ].join(" ")}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      onChange={() => toggleWarehouse(w.id)}
                    />
                    {w.name}
                  </label>
                );
              })}
              {allWarehouses.length === 0 && (
                <span className="text-sm text-gray-400">Cargando almacenes...</span>
              )}
            </div>
            {selectedIds.length > 0 && (
              <button
                className="text-xs text-teal-700 mt-1 hover:underline"
                onClick={() => setSelectedIds([])}
              >
                Limpiar seleccion
              </button>
            )}
          </div>

          <div>
            <Label>Buscar producto (SKU, nombre o codigo de barra)</Label>
            <Input
              className="mt-1 max-w-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Ej: plancha, 0204008... (Enter para buscar)"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={fetchReport} disabled={loading}>
              {loading ? "Consultando..." : "Ver reporte"}
            </Button>
            <Button
              variant="outline"
              disabled={!!downloading}
              onClick={() => handleDownload("excel")}
            >
              {downloading === "excel" ? "Descargando..." : "Descargar Excel"}
            </Button>
            <Button
              variant="outline"
              disabled={!!downloading}
              onClick={() => handleDownload("pdf")}
            >
              {downloading === "pdf" ? "Descargando..." : "Descargar PDF"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap justify-between items-center gap-2">
          <CardTitle className="text-base">Vista previa en navegador</CardTitle>
          <p className="text-xs text-gray-600">
            {rows.length} producto{rows.length !== 1 ? "s" : ""}
            {rows.length > PAGE_SIZE && ` — pagina ${page} de ${totalPages}`}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {warehouses.length > 0 && rows.length > 0 && (
            <div className="overflow-x-auto">
              <table className="text-sm border rounded-md">
                <thead className="bg-teal-50">
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold">Almacen</th>
                    <th className="text-right px-3 py-2 font-semibold">Stock total</th>
                  </tr>
                </thead>
                <tbody>
                  {warehouses.map((wh) => (
                    <tr key={wh.id} className="border-t">
                      <td className="px-3 py-1.5 font-medium">{wh.name}</td>
                      <td className="px-3 py-1.5 text-right">
                        {formatNumber(columnTotals.byWarehouse[wh.id] || 0)}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t bg-gray-50 font-semibold">
                    <td className="px-3 py-1.5">TOTAL</td>
                    <td className="px-3 py-1.5 text-right">
                      {formatNumber(columnTotals.grandTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs text-gray-500 mt-1">
                Valorizacion total (Stock x P.Compra):{" "}
                <strong>S/ {formatNumber(columnTotals.grandValuation)}</strong>
              </p>
            </div>
          )}

          <div className="overflow-x-auto border rounded-md">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-3 py-2">SKU</th>
                  <th className="text-left px-3 py-2">Producto</th>
                  <th className="text-left px-3 py-2">Categoria</th>
                  <th className="text-left px-3 py-2">UM</th>
                  {warehouses.map((wh) => (
                    <th key={wh.id} className="text-right px-3 py-2 whitespace-nowrap">
                      {wh.name}
                    </th>
                  ))}
                  <th className="text-right px-3 py-2">Stock Total</th>
                  <th className="text-right px-3 py-2">P. Compra</th>
                  <th className="text-right px-3 py-2">P. Venta</th>
                  <th className="text-right px-3 py-2">Valorizacion</th>
                </tr>
              </thead>
              <tbody>
                {displayedRows.map((row) => (
                  <tr key={row.product_id} className="border-t hover:bg-gray-50">
                    <td className="px-3 py-2 font-mono text-xs">{row.sku || "-"}</td>
                    <td className="px-3 py-2">{row.product}</td>
                    <td className="px-3 py-2">{row.category || "-"}</td>
                    <td className="px-3 py-2">{row.unit || "-"}</td>
                    {warehouses.map((wh) => (
                      <td key={wh.id} className="px-3 py-2 text-right">
                        {formatNumber(row.stocks?.[wh.id] ?? 0)}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-right font-medium">
                      {formatNumber(row.total_stock)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      S/ {formatNumber(row.price_purchase)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      S/ {formatNumber(row.price_sale)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      S/ {formatNumber(row.total_valuation)}
                    </td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr>
                    <td
                      colSpan={8 + warehouses.length}
                      className="text-center px-3 py-8 text-gray-500"
                    >
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
