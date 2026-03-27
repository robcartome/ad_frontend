"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Loader2, CircleFadingArrowUpIcon } from "lucide-react";
import { toast } from "sonner";

import MovementDetailTable from "@/components/admin/movements/MovementDetailTable";
import { createMovement, updateMovement } from "@/services/movementsService";

export default function AdjustmentForm({
  warehouses,
  movement = null,         // (solo para edición)
  mode = "create",         // ("create" | "edit")
  onSubmitSuccess = null,  //callback
  createdBy = "",         // id del usuario
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(() => {
    if (movement) {
      return {
        date: movement.date.slice(0, 16),
        reason: movement.reason || "",
        warehouse_id: movement.warehouse_id,
        reference: movement.reference_doc || "",
      };
    }
    return {
      date: new Date().toISOString().slice(0, 16),
      reason: "",
      warehouse_id: warehouses[0]?.id || "",
      reference: "",
    };
  });

  const [details, setDetails] = useState(() => {
    if (movement) {
      return movement.details.map(d => ({
        product_id: d.product_id,
        product_name: d.product_name,
        quantity: d.quantity,
        unit: d.unit || d.unit_code || "",
        physical_quantity: typeof d.physical_quantity !== "undefined" ? d.physical_quantity : null,
      }));
    }
    return [{ product_id: "", quantity: 1, unit: "", unit_price: 0, physical_quantity: null }];
  });

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const payload = {
      type: "ADJUSTMENT",
      date: new Date(form.date).toISOString(),
      reason: form.reason,
      warehouse_id: form.warehouse_id,
      reference_doc: form.reference,
      details,
    };
    if (createdBy && typeof createdBy === "string" && createdBy.length > 0) {
      payload.created_by = createdBy;
    }
    try {
      if (mode === "edit") {
        await updateMovement(movement.id, payload);
        toast.success("Ajuste actualizado correctamente");
      } else {
        await createMovement(payload);
        toast.success("Ajuste registrado correctamente");
      }
      if (onSubmitSuccess) () => router.push("/admin/inventory/movements");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleCancel = () => {
    router.push("/admin/inventory/movements");
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 bg-black/40 z-[9999] flex flex-col items-center justify-center backdrop-blur-sm">
          <Loader2 className="w-10 h-10 animate-spin text-white" />
          <p className="mt-2 text-white text-sm">Procesando...</p>
        </div>
      )}
      <Card className="max-w-7xl mx-auto">
        <CardHeader className="text-white p-2 border gap-0 bg-yellow-500">
          <CardTitle>
            Movimientos / Ajuste / {mode === "edit" ? "EDICIÓN" : "CREAR"}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 md:px-4">
          <form onSubmit={handleSubmit} className="space-y-3 text-xs md:text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Almacén</Label>
                <select
                  className="w-full p-2 border rounded"
                  value={form.warehouse_id}
                  onChange={e => handleChange("warehouse_id", e.target.value)}
                >
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-xs">Fecha</Label>
                <Input
                  type="datetime-local"
                  value={form.date || ""}
                  onChange={e => handleChange("date", e.target.value)}
                />
              </div>
            </div>
              <div>
                <Label className="text-xs">Operación</Label>
                <select
                  className="w-full p-2 border rounded"
                  value={form.reason || ""}
                  onChange={e => handleChange("reason", e.target.value)}
                >
                      <option value="AJUSTE_GENERAL">Ajuste general</option>
                      <option value="AJUSTE_SEMANAL">Ajuste semanal</option>
                      <option value="AJUSTE_MENSUAL">Ajuste mensual</option>
                      <option value="SALDO_INICIAL">Saldo inicial</option>
                </select>
              </div>
            <div>
              <Label className="text-xs">Referencia</Label>
              <Input
                value={form.reference || ""}
                onChange={e => handleChange("reference", e.target.value)}
              />
            </div>
            <MovementDetailTable details={details} setDetails={setDetails} type_movement="ADJUSTMENT" warehouse_id={form.warehouse_id} />
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={handleCancel} className="cursor-pointer">
                Cancelar
              </Button>
              <Button type="submit" className="cursor-pointer" disabled={mode === "edit"}>
                <CircleFadingArrowUpIcon />
                Guardar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
