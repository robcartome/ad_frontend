"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import MovementDetailTable from "@/components/admin/movements/MovementDetailTable";
import { createMovement, updateMovement } from "@/services/movementsService";

export default function MovementForm({
  type,
  warehouses,
  partners,
  documentTypes,
  movement = null,         // (solo para edición)
  mode = "create",         // ("create" | "edit")
  onSubmitSuccess = null,  //callback
}) {

  console.log("MovementForm movementsssss:", movement);
  const [form, setForm] = useState(() => {
    if (movement) {
      return {
        date: movement.date.slice(0, 16),
        reason: movement.reason || "",
        warehouse_id: movement.warehouse_id,
        document_type_id: movement.document_type_id,
        series: movement.series || "0000",
        number: movement.number || "0",
        reference: movement.reference_doc || "",
        supplier_id: movement.supplier_id || "",
        customer_id: movement.customer_id || "",
      };
    }

    return {
      date: new Date().toISOString().slice(0, 16),
      reason: "",
      warehouse_id: warehouses[0]?.id || "",
      document_type_id: documentTypes[0]?.id || "",
      series: "0000",
      number: "0",
      reference: "",
      supplier_id: "",
      customer_id: "",
    };
  });

  const [details, setDetails] = useState(() => {
    if (movement) {
      return movement.details.map(d => ({
        product_id: d.product_id,
        product_name: d.product_name,
        quantity: d.quantity,
        unit_price: d.unit_price,
        unit: d.unit_code || "",
      }));
    }

    return [{ product_id: "", quantity: 1, unit_price: 0 }];
  });

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      type,
      date: new Date(form.date).toISOString(),
      reason: form.reason,
      warehouse_id: form.warehouse_id,
      document_type_id: form.document_type_id,
      series: form.series,
      number: form.number,
      reference_doc: form.reference,
      details,
    };

    if (type === "ENTRY") payload.supplier_id = form.supplier_id;
    else payload.customer_id = form.customer_id;

    try {
      if (mode === "edit") {
        await updateMovement(movement.id, payload);

        toast.success(
          type === "ENTRY"
            ? "Ingreso actualizado correctamente"
            : "Salida actualizada correctamente"
        );
      } else {
        await createMovement(payload);

        toast.success(
          type === "ENTRY"
            ? "Ingreso registrado correctamente"
            : "Salida registrada correctamente"
        );
      }
      // Reset detail
      // setDetails([{ product_id: "", quantity: 1, unit_price: 0 }]);
      if (onSubmitSuccess) () => router.push("/admin/movements");
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <Card className="max-w-7xl mx-auto">
      <CardHeader className={`text-white p-2 border gap-0 ${type === "ENTRY" ? "bg-green-400" : "bg-red-400"}`}>
        <CardTitle>
          Movimientos de Almacén / {type === "ENTRY" ? "Ingreso" : "Salida"} / {mode === "edit" ? "EDICIÓN" : "CREAR"}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-3 md:px-4">
        <form onSubmit={handleSubmit} className="space-y-3 text-xs md:text-sm">

          {/* Proveedor o Cliente */}
          <div>
            <Label className="text-xs">{type === "ENTRY" ? "Proveedor" : "Cliente"}</Label>
            <select
              className="w-full p-1 border rounded"
              value={type === "ENTRY" ? form.supplier_id : form.customer_id}
              onChange={(e) =>
                handleChange(
                  type === "ENTRY" ? "supplier_id" : "customer_id",
                  e.target.value
                )
              }
            >
              <option value="">Elegir</option>
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Documento */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Documento</Label>
              <select
                className="w-full p-2 border rounded"
                value={form.document_type_id}
                onChange={(e) => handleChange("document_type_id", e.target.value)}
              >
                {documentTypes.map((dt) => (
                  <option key={dt.id} value={dt.id}>
                    {dt.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-xs">Serie</Label>
              <Input value={form.series} onChange={(e) => handleChange("series", e.target.value)} />
            </div>

            <div>
              <Label className="text-xs">Número</Label>
              <Input value={form.number} onChange={(e) => handleChange("number", e.target.value)} />
            </div>
          </div>

          {/* Operación + Almacén */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Operación</Label>
              <select
                className="w-full p-2 border rounded"
                value={form.reason}
                onChange={(e) => handleChange("reason", e.target.value)}
              >
                {type === "ENTRY" ? (
                  <>
                    <option value="COMPRA">Compra</option>
                    <option value="DEVOLUCIÓN">Devolución</option>
                    <option value="PRESTAMO">Préstamo recibido</option>
                    <option value="AJUSTE">Ajuste de stock</option>
                    <option value="INICIAL">Saldo inicial</option>
                  </>
                ) : (
                  <>
                    <option value="VENTA">Venta</option>
                    <option value="PRESTAMO">Préstamo entregado</option>
                    <option value="CONSUMO">Consumo interno</option>
                    <option value="AJUSTE">Ajuste de stock</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <Label className="text-xs">Almacén</Label>
              <select
                className="w-full p-2 border rounded"
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Fecha</Label>
              <Input
                type="datetime-local"
                value={form.date}
                onChange={(e) => handleChange("date", e.target.value)}
              />
            </div>

            <div>
              <Label className="text-xs">Referencia</Label>
              <Input
                value={form.reference}
                onChange={(e) => handleChange("reference", e.target.value)}
              />
            </div>
          </div>

          {/* Tabla de detalles */}
          <MovementDetailTable details={details} setDetails={setDetails} />

          {/* Botones */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary">
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
