"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import MovementDetailTable from "@/components/admin/MovementDetailTable";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function ExitPage() {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 16),
    reason: "",
    warehouse_id: "a72fe3de-f945-43b1-afa8-ae1f0c808b9d",
    customer_id: "",
    document_type_id: "cefe1323-9454-4052-b52b-eb62bca8c43a",
    series: "0000",
    number: "0",
    reference: "",
  });

  const [warehouses, setWarehouses] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [documentType, setDocumentType] = useState([]);
  const [details, setDetails] = useState([
    { product_id: "", quantity: 1, unit_price: 0 },
  ]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // -----------------------------------------------------------------
  // Cargar datos iniciales
  // -----------------------------------------------------------------
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const [wRes, cRes, dRes] = await Promise.all([
          fetch(`${API_URL}/warehouses/`),
          fetch(`${API_URL}/customers/`),
          fetch(`${API_URL}/document-types/`),
        ]);

        if (!wRes.ok) throw new Error("No se pudo cargar los almacenes");
        if (!cRes.ok) throw new Error("No se pudo cargar los clientes");
        if (!dRes.ok) throw new Error("No se pudo cargar los tipos de documento");

        setWarehouses(await wRes.json());
        setCustomers(await cRes.json());
        setDocumentType(await dRes.json());
      } catch (err) {
        console.error(err);
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // -----------------------------------------------------------------
  // Guardar movimiento de salida
  // -----------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      type: "EXIT",
      date: new Date(form.date).toISOString(),
      reason: form.reason,
      warehouse_id: form.warehouse_id,
      customer_id: form.customer_id,
      document_type_id: form.document_type_id,
      series: form.series,
      number: form.number,
      reference_doc: form.reference,
      details,
    };

    try {
      const res = await fetch(`${API_URL}/movements/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errorData;

        try {
          errorData = await res.json();
        } catch {
          throw new Error("Error desconocido del servidor");
        }

        const message = parseFastApiError(errorData);
        throw new Error(message);
      }

      toast.success("Salida registrada correctamente");
      setDetails([{ product_id: "", quantity: 1, unit_price: 0 }]);

    } catch (err) {
      console.warn(err);
      toast.error(err.message);
    }
  };

  // -----------------------------------------------------------------
  // Procesamiento de errores (igual que en EntryPage)
  // -----------------------------------------------------------------
  const fieldNames = {
    customer_id: "Cliente",
    warehouse_id: "Almacén",
    document_type_id: "Tipo de documento",
    product_id: "Producto",
    details: "Detalles",
  };

  function parseFastApiError(errorData) {
    if (Array.isArray(errorData?.detail)) {
      return errorData.detail
        .map((err) => {
          const loc = err.loc?.slice(1) || [];
          const translatedPath = loc
            .map((part) => {
              if (typeof part === "number") return `ítem ${part + 1}`;
              return fieldNames[part] || part;
            })
            .join(" → ");

          return `${translatedPath}: ${translateErrorMsg(err.msg)}`;
        })
        .join("\n");
    }

    if (typeof errorData.detail === "string") {
      return cleanServerError(errorData.detail);
    }

    return "Error inesperado en el servidor";
  }

  function translateErrorMsg(msg) {
    if (msg.includes("valid UUID")) return "Debe ser un UUID válido.";
    if (msg.includes("field required")) return "Este campo es obligatorio.";
    return msg;
  }

  function cleanServerError(message) {
    if (message.includes("llave duplicada")) return "Ya existe un registro con datos duplicados.";
    if (message.includes("uuid")) return "El ID enviado no es un UUID válido.";
    if (message.includes("foreign key")) return "No se encontró la referencia requerida.";
    return message;
  }

  // -----------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------
  if (loading) return <p>Cargando datos...</p>;

  return (
    <div className="p-6">
      {error && <p className="text-red-500">{error}</p>}

      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="bg-red-300 text-white p-2">Movimientos de Almacén / Salida / Crear</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Cliente */}
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
              <div>
                <Label>Cliente</Label>
                <select
                  className="w-full border rounded-md p-2"
                  value={form.customer_id}
                  onChange={(e) => handleChange("customer_id", e.target.value)}
                >
                  <option value="">Elegir</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Documento */}
              <div>
                <Label>Documento</Label>
                <select
                  className="w-full border rounded-md p-2"
                  value={form.document_type_id}
                  onChange={(e) => handleChange("document_type_id", e.target.value)}
                >
                  {documentType.map((dt) => (
                    <option key={dt.id} value={dt.id}>
                      {dt.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Serie */}
              <div>
                <Label>Serie</Label>
                <Input value={form.series} onChange={(e) => handleChange("series", e.target.value)} />
              </div>

              {/* Número */}
              <div>
                <Label>Número</Label>
                <Input value={form.number} onChange={(e) => handleChange("number", e.target.value)} />
              </div>
            </div>

            {/* Operación - Almacén */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label>Operación</Label>
                <select
                  className="w-full border rounded-md p-2"
                  value={form.reason}
                  onChange={(e) => handleChange("reason", e.target.value)}
                >
                  <option value="VENTA">Venta</option>
                  <option value="PRESTAMO">Salida por Préstamo</option>
                  <option value="AJUSTE">Ajuste Stock</option>
                  <option value="CONSUMO">Consumo Interno</option>
                </select>
              </div>

              <div>
                <Label>Almacén</Label>
                <select
                  className="w-full border rounded-md p-2"
                  value={form.warehouse_id}
                  onChange={(e) => handleChange("warehouse_id", e.target.value)}
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fecha y referencia */}
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
              <div>
                <Label>Fecha Emisión</Label>
                <Input
                  type="datetime-local"
                  value={form.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                />
              </div>

              <div>
                <Label>Doc. Referencia</Label>
                <Input
                  placeholder="Referencia"
                  value={form.reference}
                  onChange={(e) => handleChange("reference", e.target.value)}
                />
              </div>
            </div>

            {/* Detalle */}
            <MovementDetailTable details={details} setDetails={setDetails} />

            {/* Botones */}
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => toast.info("Operación cancelada")}
              >
                Cancelar
              </Button>
              <Button type="submit">Guardar</Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
