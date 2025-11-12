"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import MovementDetailTable from "@/components/admin/MovementDetailTable";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function EntryPage() {
  const [form, setForm] = useState({
    supplier_id: "",
    document_type: "",
    series: "0001",
    number: "1",
    currency: "PEN",
    operation: "COMPRA LOCAL",
    cost_center: "",
    warehouse_id: "",
    reason: "",
    reference: "",
    notes: "",
    exchange_rate: 3.80,
    date: new Date().toISOString().slice(0, 16),
  });

  const [warehouses, setWarehouses] = useState([]);
  // const [suppliers, setSuppliers] = useState([]);
  const [details, setDetails] = useState([
    { product_id: "", quantity: 1, unit_price: 0 },
  ]);

  useEffect(() => {
    fetch(`${API_URL}/warehouses/`).then((r) => r.json()).then(setWarehouses);
    // fetch(`${API_URL}/suppliers/`).then((r) => r.json()).then(setSuppliers).catch(() => setSuppliers([]));
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
      details,
    };

    try {
      const res = await fetch(`${API_URL}/movements/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Error al registrar ingreso");
      }

      toast.success("Ingreso registrado correctamente ✅");
      setDetails([{ product_id: "", quantity: 1, unit_price: 0 }]);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="p-6">
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle>Movimientos de Almacén / Ingreso / Crear</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Encabezado principal */}
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
              {/* Proveedor */}
              {/* <div>
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
              </div> */}

              {/* Documento */}
              <div>
                <Label>Documento</Label>
                <select
                  className="w-full border rounded-md p-2"
                  value={form.document_type}
                  onChange={(e) => handleChange("document_type", e.target.value)}
                >
                  <option value="">Elegir</option>
                  <option value="FACTURA">Factura</option>
                  <option value="BOLETA">Boleta</option>
                  <option value="GUIA">Guía de remisión</option>
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
                  value={form.operation}
                  onChange={(e) => handleChange("operation", e.target.value)}
                >
                  <option value="COMPRA LOCAL">Compra Local</option>
                  <option value="DEVOLUCIÓN">Devolución</option>
                  <option value="AJUSTE">Ajuste</option>
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

              {/* Centro de costo */}
              <div>
                <Label>Centro de Costo</Label>
                <Input
                  placeholder="Ej: Proyecto A"
                  value={form.cost_center}
                  onChange={(e) => handleChange("cost_center", e.target.value)}
                />
              </div>

              {/* Almacén */}
              <div>
                <Label>Almacén</Label>
                <select
                  className="w-full border rounded-md p-2"
                  value={form.warehouse_id}
                  onChange={(e) => handleChange("warehouse_id", e.target.value)}
                >
                  <option value="">Elegir</option>
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
                <Label>T/C</Label>
                <Input
                  type="number"
                  step="0.001"
                  value={form.exchange_rate}
                  onChange={(e) =>
                    handleChange("exchange_rate", parseFloat(e.target.value))
                  }
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

            {/* Detalle del movimiento */}
            <MovementDetailTable details={details} setDetails={setDetails} />

            {/* Notas */}
            <div>
              <Label>Notas</Label>
              <Textarea
                placeholder="Información adicional..."
                value={form.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
              />
            </div>

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
