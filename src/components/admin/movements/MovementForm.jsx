"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Loader2, CircleFadingArrowUpIcon  } from "lucide-react";
import { toast } from "sonner";

import MovementDetailTable from "@/components/admin/movements/MovementDetailTable";
import { createMovement, updateMovement } from "@/services/movementsService";
import CustomerSearchInput from "@/components/ui/CustomerSearchInput";



export default function MovementForm({
  type,
  warehouses,
  partners = [],
  documentTypes,
  movement = null,         // (solo para edición)
  mode = "create",         // ("create" | "edit")
  onSubmitSuccess = null,  //callback
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  // Cliente seleccionado para EXIT (objeto completo para CustomerSearchInput)
  const [selectedCustomer, setSelectedCustomer] = useState(
    movement?.customer_id
      ? { id: movement.customer_id, legal_name: movement.customer_name || movement.customer_id, document_number: movement.customer_document_number || "", address: movement.customer_address || "" }
      : null
  );
  const defaultWarehouseId = warehouses.find((w) => w.is_default)?.id || warehouses[0]?.id || "";
  const defaultTransferDestId =
    warehouses.find((w) => w.id !== defaultWarehouseId)?.id || defaultWarehouseId;

  const [form, setForm] = useState(() => {
    if (movement) {
      return {
        date: movement.date.slice(0, 16),
        reason: movement.reason || "",
        warehouse_id: movement.warehouse_id,
        warehouse_origin_id: movement.warehouse_origin_id || "",
        warehouse_dest_id: movement.warehouse_dest_id || "",
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
      warehouse_id: defaultWarehouseId,
      warehouse_origin_id: defaultWarehouseId,
      warehouse_dest_id: defaultTransferDestId,
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
    setLoading(true);
    const payload = {
      type,
      date: new Date(form.date).toISOString(),
      reason: form.reason,
      document_type_id: form.document_type_id,
      series: form.series,
      number: form.number,
      reference_doc: form.reference,
      details,
    };


    // ENTRY - EXIT
    if (type === "ENTRY") payload.supplier_id = form.supplier_id;
    if (type === "EXIT") payload.customer_id = form.customer_id;

    // TRANSFER
    if (type === "TRANSFER") {
      payload.warehouse_origin_id = form.warehouse_origin_id;
      payload.warehouse_dest_id = form.warehouse_dest_id;
    } else {
      payload.warehouse_id = form.warehouse_id;
    }

    try {
      if (mode === "edit") {
        await updateMovement(movement.id, payload);
        toast.success(
          type === "ENTRY"
            ? "Ingreso actualizado correctamente"
            : type === "EXIT"
            ? "Salida actualizada correctamente"
            : "Transferencia actualizada correctamente"
        );
      } else {
        await createMovement(payload);
        toast.success(
          type === "ENTRY"
            ? "Ingreso registrado correctamente"
            : type === "EXIT"
            ? "Salida registrada correctamente"
            : "Transferencia registrada correctamente"
        );
      }

      // Reset detail
      // setDetails([{ product_id: "", quantity: 1, unit_price: 0 }]);
      if (onSubmitSuccess) {
        onSubmitSuccess();
      } else {
        router.push("/admin/inventory/movements");
      }
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
      <CardHeader
        className={`text-white p-2 border gap-0 ${
          type === "ENTRY"
            ? "bg-green-500"
            : type === "EXIT"
            ? "bg-red-500"
            : "bg-blue-500"
        }`}
      >
        <CardTitle>
          Movimientos /{" "}
            {type === "ENTRY"
              ? "Ingreso"
              : type === "EXIT"
              ? "Salida"
              : "Transferencia"}{" "}
            / {mode === "edit" ? "EDICIÓN" : "CREAR"}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-3 md:px-4">
        <form onSubmit={handleSubmit} className="space-y-3 text-xs md:text-sm">

            {/* ---------------- Supplier / Customer ---------------- */}
            {type === "ENTRY" && (
              <div>
                <Label className="text-xs">Proveedor</Label>
                <select
                  className="w-full p-1 border rounded"
                  value={form.supplier_id}
                  onChange={e => handleChange("supplier_id", e.target.value)}
                >
                  <option value="">Elegir</option>
                  {partners.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {type === "EXIT" && (
              <div>
                <Label className="text-xs">Cliente</Label>
                <CustomerSearchInput
                  value={selectedCustomer}
                  onChange={(c) => {
                    setSelectedCustomer(c);
                    handleChange("customer_id", c?.id || "");
                  }}
                />
              </div>
            )}

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

          {/* ---------------- OPERATION / WAREHOUSE ---------------- */}
          {type === "TRANSFER" ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Almacén Origen</Label>
                <select
                  className="w-full p-2 border rounded"
                  value={form.warehouse_origin_id}
                  onChange={e =>
                    handleChange("warehouse_origin_id", e.target.value)
                  }
                >
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-xs">Almacén Destino</Label>
                <select
                  className="w-full p-2 border rounded"
                  value={form.warehouse_dest_id}
                  onChange={e =>
                    handleChange("warehouse_dest_id", e.target.value)
                  }
                >
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Operación</Label>
                <select
                  className="w-full p-2 border rounded"
                  value={form.reason}
                  onChange={e => handleChange("reason", e.target.value)}
                >
                  {type === "ENTRY" ? (
                    <>
                      <option value="COMPRA">Compra</option>
                      <option value="DEVOLUCIÓN">Devolución</option>
                      <option value="PRESTAMO_RECIBIDO">Préstamo recibido</option>
                      <option value="CONSUMO_INTERNO">Consumo interno</option>
                      <option value="AJUSTE">Ajuste</option>
                      <option value="SALDO_INICIAL">Saldo inicial</option>
                    </>
                  ) : (
                    <>
                      <option value="VENTA">Venta</option>
                      <option value="PRESTAMO_ENTREGADO">Préstamo entregado</option>
                      <option value="CONSUMO_INTERNO">Consumo interno</option>
                      <option value="AJUSTE">Ajuste</option>
                    </>
                  )}
                </select>
              </div>
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
            </div>
          )}

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

          <MovementDetailTable
            details={details}
            setDetails={setDetails}
            type_movement={type}
            warehouse_id={type === "TRANSFER" ? form.warehouse_origin_id : form.warehouse_id}
          />

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleCancel} className="cursor-pointer">
              Cancelar
            </Button>
            <Button type="submit" className="cursor-pointer">
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
