"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { getWarehouses, updateWarehouse } from "@/services/warehousesService";

export default function ConfigurationPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const currentDefaultId = useMemo(
    () => warehouses.find((w) => w.is_default)?.id || "",
    [warehouses],
  );

  async function loadWarehouses() {
    setLoading(true);
    try {
      const data = await getWarehouses({ activeOnly: true });
      const list = Array.isArray(data) ? data : [];
      setWarehouses(list);
      setSelectedWarehouseId(list.find((w) => w.is_default)?.id || list[0]?.id || "");
    } catch (err) {
      toast.error(err.message || "No se pudieron cargar los almacenes");
      setWarehouses([]);
      setSelectedWarehouseId("");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWarehouses();
  }, []);

  async function handleSave() {
    if (!selectedWarehouseId) {
      toast.error("Seleccione un almacén principal");
      return;
    }

    if (selectedWarehouseId === currentDefaultId) {
      toast.message("El almacén seleccionado ya es el principal");
      return;
    }

    setSaving(true);
    try {
      await updateWarehouse(selectedWarehouseId, { is_default: true });
      toast.success("Almacén principal actualizado correctamente");
      await loadWarehouses();
    } catch (err) {
      toast.error(err.message || "No se pudo actualizar la configuración");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-2xl font-bold">Administración / Configuración</h1>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Almacén principal del ERP</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            El almacén principal se usará por defecto al registrar entradas, salidas,
            transferencias y ajustes de inventario.
          </p>

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando almacenes...
            </div>
          ) : warehouses.length === 0 ? (
            <p className="text-sm text-red-600">No hay almacenes activos disponibles.</p>
          ) : (
            <div className="space-y-2 rounded-md border p-3">
              {warehouses.map((warehouse) => (
                <label
                  key={warehouse.id}
                  className="flex items-center justify-between gap-3 border-b last:border-b-0 py-2"
                >
                  <span className="text-sm font-medium">{warehouse.name}</span>
                  <span className="flex items-center gap-2">
                    {warehouse.is_default && (
                      <span className="text-xs rounded bg-green-100 text-green-700 px-2 py-0.5">
                        Actual
                      </span>
                    )}
                    <input
                      type="radio"
                      name="default-warehouse"
                      value={warehouse.id}
                      checked={selectedWarehouseId === warehouse.id}
                      onChange={() => setSelectedWarehouseId(warehouse.id)}
                    />
                  </span>
                </label>
              ))}
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={loading || saving || warehouses.length === 0}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Guardar configuración
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
