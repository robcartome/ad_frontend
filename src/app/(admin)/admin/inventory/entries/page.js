"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import MovementDetailTable from "@/components/admin/MovementDetailTable";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function EntryPage() {
  const [form, setForm] = useState({
    // notes: "",
    // exchange_rate: 3.80,
    date: new Date().toISOString().slice(0, 16),
    reason: "",
    warehouse_id: "a72fe3de-f945-43b1-afa8-ae1f0c808b9d",
    supplier_id: "",
    document_type_id: "cefe1323-9454-4052-b52b-eb62bca8c43a",
    series: "0000",
    number: "0",
    reference: "",
  });

  const [warehouses, setWarehouses] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [document_type, setDocumentType] = useState("");
  const [details, setDetails] = useState([
    { product_id: "", quantity: 1, unit_price: 0 },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const [wRes, sRes, dRes] = await Promise.all([
          fetch(`${API_URL}/warehouses/`),
          fetch(`${API_URL}/suppliers/`),
          fetch(`${API_URL}/document-types/`)
        ]);

        if (!wRes.ok) throw new Error("No se pudo cargar los almacenes");
        if (!sRes.ok) throw new Error("No se pudo cargar los proveedores");
        if (!dRes.ok) throw new Error("No se pudo cargar los tipos de documento");

        const warehouses = await wRes.json();
        const suppliers = await sRes.json();
        const documentTypes = await dRes.json();

        setWarehouses(warehouses);
        setSuppliers(suppliers);
        setDocumentType(documentTypes);

      } catch (err) {
        console.error(err);
        setError(err.message);
        toast.error(err.message); // Mostrar error
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      type: "ENTRY",
      date: new Date(form.date).toISOString(),
      reason: form.reason,
      warehouse_id: form.warehouse_id,
      supplier_id: form.supplier_id,
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
        // Procesar errores FastAPI
        const message = parseFastApiError(errorData);
        throw new Error(message);
      }

      toast.success("Ingreso registrado correctamente");
      setDetails([{ product_id: "", quantity: 1, unit_price: 0 }]);

    } catch (err) {
      console.warn(err);
      toast.error(err.message);
    }
  };

  const fieldNames = {
    supplier_id: "Proveedor",
    warehouse_id: "Almacén",
    document_type_id: "Tipo de documento",
    product_id: "Producto",
    details: "Detalles",
  };

  function parseFastApiError(errorData) {
    // Si FastAPI envía array de errores
    if (Array.isArray(errorData?.detail)) {
      const messages = errorData.detail.map((err) => {

        const loc = err.loc || [];

        // quitar la palabra "body"
        const cleanLoc = loc.slice(1);

        // traducir cada parte del campo
        const translatedPath = cleanLoc
          .map((part) => {
            if (typeof part === "number") {
              return `ítem ${part + 1}`; // details[0] → ítem 1
            }
            return fieldNames[part] || part;
          })
          .join(" → ");

        // traducir mensaje UUID
        const translatedMsg = translateErrorMsg(err.msg);

        return `${translatedPath}: ${translatedMsg}`;
      });

      return messages.join("\n");
    }

    // Si FastAPI envía un string simple
    if (typeof errorData.detail === "string") {
      return cleanServerError(errorData.detail);
    }

    return "Error inesperado en el servidor";
  }

  function translateErrorMsg(msg) {
    if (msg.includes("valid UUID")) {
      return "Debe ser un UUID válido (dato requerido).";
    }

    if (msg.includes("field required")) {
      return "Este campo es obligatorio.";
    }

    return msg;
  }

  function cleanServerError(message) {
    // mensajes tipo "llave duplicada"
    if (message.includes("llave duplicada")) {
      return "Ya existe un registro con datos duplicados.";
    }

    if (message.includes("uuid")) {
      return "El ID enviado no es un UUID válido.";
    }

    if (message.includes("foreign key")) {
      return "No se encontró la referencia requerida.";
    }

    return message;
  }

  if (loading) {
    return <p>Cargando datos...</p>;
  }
  return (
    <div className="p-6">
      {error && <p style={{ color: "red" }}>{error}</p>}
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle>Movimientos de Almacén / Ingreso / Crear</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Encabezado principal */}
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
              {/* Proveedor */}
              <div>
                <Label>Proveedor</Label>
                <select
                  className="w-full border rounded-md p-2"
                  value={form.supplier_id}
                  onChange={(e) => handleChange("supplier_id", e.target.value)}
                >
                  <option value="">Elegir</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
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
                  {document_type && document_type.map((dt) => (
                    <option key={dt.id} value={dt.id}>
                      {dt.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Serie */}
              <div>
                <Label>Serie</Label>
                <Input
                  value={form.series}
                  onChange={(e) => handleChange("series", e.target.value)}
                />
              </div>

              {/* Número */}
              <div>
                <Label>Número</Label>
                <Input
                  value={form.number}
                  onChange={(e) => handleChange("number", e.target.value)}
                />
              </div>
            </div>

            {/* Segunda fila de campos */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Operación */}
              <div>
                <Label>Operación</Label>
                <select
                  className="w-full border rounded-md p-2"
                  value={form.reason}
                  onChange={(e) => handleChange("reason", e.target.value)}
                >
                  <option value="COMPRA">Compra</option>
                  <option value="DEVOLUCIÓN">Devolución</option>
                  <option value="PRESTAMO">Entrada por Prestamo</option>
                  <option value="AJUSTE">Ajuste Stock</option>
                  <option value="INICIAL">Saldo Inicial</option>
                </select>
              </div>

              {/* Moneda */}
              <div>
                <Label>Moneda</Label>
                <select
                  className="w-full border rounded-md p-2"
                  value={form.currency}
                  onChange={(e) => handleChange("currency", e.target.value)}
                >
                  <option value="PEN">Soles [S/]</option>
                  <option value="USD">Dólares [$]</option>
                </select>
              </div>

              {/* Almacén */}
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

              {/* <div>
                <Label>T/C</Label>
                <Input
                  type="number"
                  step="0.001"
                  value={form.exchange_rate}
                  onChange={(e) =>
                    handleChange("exchange_rate", parseFloat(e.target.value))
                  }
                />
              </div> */}

              <div>
                <Label>Doc. Referencia</Label>
                <Input
                  placeholder="Referencia"
                  value={form.reference}
                  onChange={(e) => handleChange("reference", e.target.value)}
                />
              </div>
            </div>

            {/* Detalle del movimiento */}
            <MovementDetailTable details={details} setDetails={setDetails} />

            {/* Notas */}
            {/* <div>
              <Label>Notas</Label>
              <Textarea
                placeholder="Información adicional..."
                value={form.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
              />
            </div> */}

            {/* Botones */}
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => toast.info("Operación cancelada")}
                className="cursor-pointer"
              >
                Cancelar
              </Button>
              <Button type="submit" className="cursor-pointer">Guardar</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
