"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSeries, createSeries, deactivateSeries } from "@/services/salesService";
import { getMyStoresDetail } from "@/services/storeAccessService";

const VOUCHER_TYPE_LABELS = {
  "01": "Factura",
  "03": "Boleta",
  "07": "Nota Crédito",
  "08": "Nota Débito",
  "09": "Guía Remisión",
  OV: "Orden de Venta",
  COT: "Cotización",
};

const VOUCHER_TYPES = Object.entries(VOUCHER_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export default function SeriesAdminPage() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("");
  const [stores, setStores] = useState([]);

  // New series form
  const [newType, setNewType] = useState("COT");
  const [newStoreId, setNewStoreId] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newStartNum, setNewStartNum] = useState("0");
  const [creating, setCreating] = useState(false);

  const storeNameById = useCallback(
    (id) => stores.find((s) => s.id === id)?.name || "—",
    [stores]
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSeries(filterType || null);
      setSeries(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Error cargando series");
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    getMyStoresDetail()
      .then((items) => {
        const data = Array.isArray(items) ? items : [];
        setStores(data);
        if (data.length === 1) {
          setNewStoreId(data[0].id);
        }
      })
      .catch(() => setStores([]));
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!newCode.trim()) {
      toast.error("Ingrese el código de serie (ej: C001)");
      return;
    }
    if (stores.length > 1 && !newStoreId) {
      toast.error("Seleccione la sucursal para la serie");
      return;
    }
    setCreating(true);
    try {
      await createSeries({
        voucher_type: newType,
        series: newCode.trim().toUpperCase(),
        store_id: newStoreId || null,
        current_number: parseInt(newStartNum, 10) || 0,
      });
      toast.success(`Serie ${newCode.toUpperCase()} creada`);
      setNewCode("");
      setNewStartNum("0");
      await load();
    } catch (err) {
      toast.error(err.message || "Error al crear serie");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Series / Correlativos</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Administra las series de numeración por tipo de documento
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="gap-1">
          <RefreshCw size={14} />
          Actualizar
        </Button>
      </div>

      {/* Filter */}
      <div className="flex gap-3 flex-wrap">
        <select
          className="border rounded-md px-3 py-2 text-sm bg-white"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">Todos los tipos</option>
          {VOUCHER_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Tipo</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Sucursal</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Serie</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Nro. Actual</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">Estado</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Creada</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400">
                  Cargando…
                </td>
              </tr>
            ) : series.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400">
                  No hay series registradas
                </td>
              </tr>
            ) : (
              series.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-gray-700">
                    {VOUCHER_TYPE_LABELS[s.voucher_type] || s.voucher_type}
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">
                    {storeNameById(s.store_id)}
                  </td>
                  <td className="px-4 py-2.5 font-mono font-semibold text-gray-800">
                    {s.series}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-gray-600">
                    {s.current_number.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        s.active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {s.active ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-gray-400">
                    {s.created_at
                      ? new Date(s.created_at).toLocaleDateString("es-PE")
                      : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {s.active && (
                      <button
                        onClick={async () => {
                          if (!confirm(`¿Desactivar serie ${s.series}?`)) return;
                          try {
                            await deactivateSeries(s.id);
                            toast.success(`Serie ${s.series} desactivada`);
                            load();
                          } catch {
                            toast.error("Error al desactivar");
                          }
                        }}
                        className="text-red-500 hover:text-red-700"
                        title="Desactivar serie"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create form */}
      <div className="border rounded-lg bg-white shadow-sm p-4 space-y-4">
        <h2 className="font-semibold text-gray-700">Nueva Serie</h2>
        <form onSubmit={handleCreate} className="flex flex-wrap gap-3 items-end">
          <div className="space-y-1">
            <label className="text-xs text-gray-500 uppercase tracking-wide">Tipo</label>
            <select
              className="border rounded-md px-3 py-2 text-sm bg-white"
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
            >
              {VOUCHER_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-500 uppercase tracking-wide">Sucursal</label>
            <select
              className="border rounded-md px-3 py-2 text-sm bg-white min-w-44"
              value={newStoreId}
              onChange={(e) => setNewStoreId(e.target.value)}
              disabled={stores.length <= 1}
            >
              {stores.length > 1 && <option value="">Seleccionar sucursal</option>}
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-500 uppercase tracking-wide">
              Código serie
            </label>
            <Input
              placeholder="C001"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value.toUpperCase())}
              className="w-28 font-mono uppercase"
              maxLength={4}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-500 uppercase tracking-wide">
              Número inicio
            </label>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={newStartNum}
              onChange={(e) => setNewStartNum(e.target.value)}
              className="w-24"
            />
          </div>
          <Button type="submit" disabled={creating} className="gap-1">
            <Plus size={14} />
            {creating ? "Creando…" : "Crear Serie"}
          </Button>
        </form>
      </div>
    </div>
  );
}
