"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { getWarehouses, updateWarehouse } from "@/services/warehousesService";
import {
  getDocumentPdfPreferences,
  updateDocumentPdfPreferences,
} from "@/services/salesService";

export default function ConfigurationPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  const [pdfFormat, setPdfFormat] = useState("a4");
  const [pdfLogoUrl, setPdfLogoUrl] = useState("");
  const [pdfFormats, setPdfFormats] = useState(["a4", "ticket"]);
  const [loading, setLoading] = useState(true);
  const [savingWarehouse, setSavingWarehouse] = useState(false);
  const [savingPdf, setSavingPdf] = useState(false);

  const currentDefaultId = useMemo(
    () => warehouses.find((w) => w.is_default)?.id || "",
    [warehouses],
  );

  async function loadWarehouses() {
    try {
      const data = await getWarehouses({ activeOnly: true });
      const list = Array.isArray(data) ? data : [];
      setWarehouses(list);
      setSelectedWarehouseId(list.find((w) => w.is_default)?.id || list[0]?.id || "");
    } catch (err) {
      toast.error(err.message || "No se pudieron cargar los almacenes");
      setWarehouses([]);
      setSelectedWarehouseId("");
    }
  }

  async function loadPdfPreferences() {
    try {
      const data = await getDocumentPdfPreferences();
      setPdfFormat(data?.default_pdf_format || "a4");
      setPdfLogoUrl(data?.logo_url || "");
      setPdfFormats(Array.isArray(data?.available_formats) && data.available_formats.length > 0 ? data.available_formats : ["a4", "ticket"]);
    } catch (err) {
      toast.error(err.message || "No se pudo cargar la configuración de comprobantes");
      setPdfFormat("a4");
      setPdfLogoUrl("");
      setPdfFormats(["a4", "ticket"]);
    }
  }

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      try {
        await Promise.all([loadWarehouses(), loadPdfPreferences()]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  async function handleSaveWarehouse() {
    if (!selectedWarehouseId) {
      toast.error("Seleccione un almacén principal");
      return;
    }

    if (selectedWarehouseId === currentDefaultId) {
      toast.message("El almacén seleccionado ya es el principal");
      return;
    }

    setSavingWarehouse(true);
    try {
      await updateWarehouse(selectedWarehouseId, { is_default: true });
      toast.success("Almacén principal actualizado correctamente");
      await loadWarehouses();
    } catch (err) {
      toast.error(err.message || "No se pudo actualizar la configuración");
    } finally {
      setSavingWarehouse(false);
    }
  }

  async function handleSavePdfPreferences() {
    setSavingPdf(true);
    try {
      const data = await updateDocumentPdfPreferences({
        default_pdf_format: pdfFormat,
        logo_url: pdfLogoUrl || null,
      });
      setPdfFormat(data.default_pdf_format);
      setPdfLogoUrl(data.logo_url || "");
      setPdfFormats(data.available_formats);
      toast.success("Configuración PDF actualizada correctamente");
    } catch (err) {
      toast.error(err.message || "No se pudo actualizar la configuración PDF");
    } finally {
      setSavingPdf(false);
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
            <Button onClick={handleSaveWarehouse} disabled={loading || savingWarehouse || warehouses.length === 0}>
              {savingWarehouse && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Guardar configuración
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Formato PDF por defecto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Esta preferencia se usará al generar comprobantes comerciales desde ventas.
            La base queda lista para reutilizar el mismo diseño en cotizaciones, pedidos y facturación.
          </p>

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando formatos...
            </div>
          ) : (
            <div className="space-y-4 rounded-md border p-3">
              <div className="space-y-2">
                <p className="text-sm font-medium">Formato por defecto</p>
                {pdfFormats.map((format) => (
                  <label
                    key={format}
                    className="flex items-center justify-between gap-3 border-b last:border-b-0 py-2"
                  >
                    <span className="text-sm font-medium">
                      {format === "a4" ? "A4" : "Ticket 80 mm"}
                    </span>
                    <input
                      type="radio"
                      name="default-pdf-format"
                      value={format}
                      checked={pdfFormat === format}
                      onChange={() => setPdfFormat(format)}
                    />
                  </label>
                ))}
              </div>

              <div className="space-y-2">
                <label htmlFor="pdf-logo-url" className="text-sm font-medium block">
                  URL del logo para comprobantes
                </label>
                <input
                  id="pdf-logo-url"
                  type="url"
                  value={pdfLogoUrl}
                  onChange={(e) => setPdfLogoUrl(e.target.value)}
                  placeholder="https://cdn.miempresa.com/logos/empresa.png"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
                <p className="text-xs text-gray-500">
                  Solo se guarda la URL. La imagen se obtiene desde el storage externo de cada empresa.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSavePdfPreferences} disabled={loading || savingPdf}>
              {savingPdf && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Guardar formato PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
