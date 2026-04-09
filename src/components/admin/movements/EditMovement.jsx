"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MovementForm from "@/components/admin/movements/MovementForm";
import AdjustmentForm from "@/components/admin/movements/AdjustmentForm";

import { getMovementById } from "@/services/movementsService";
import { getWarehouses } from "@/services/warehousesService";
import { getSuppliers } from "@/services/suppliersService";
import { getDocumentTypes } from "@/services/documentTypesService";

import { Loader2 } from "lucide-react";

export default function EditMovement({ id }) {
  const router = useRouter();
  const [data, setData] = useState({ loading: true });

  useEffect(() => {
    async function load() {
      const movement = await getMovementById(id);
      const warehouses = await getWarehouses();
      const documentTypes = await getDocumentTypes();

      // ENTRY = proveedor (select) / EXIT = cliente (CustomerSearchInput, no necesita prefetch)
      const partners = movement.type === "ENTRY" ? await getSuppliers() : [];

      setData({
        loading: false,
        movement,
        warehouses,
        documentTypes,
        partners,
      });
    }

    load();
  }, [id]);

  if (data.loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-lg text-gray-600">Cargando datos...</p>
      </div>
    );
  }

  // Render AdjustmentForm if type is ADJUSTMENT
  if (data.movement.type === "ADJUSTMENT") {
    return (
      <AdjustmentForm
        warehouses={data.warehouses}
        movement={data.movement}
        mode="edit"
        onSubmitSuccess={() => router.push("/admin/inventory/movements")}
      />
    );
  }

  return (
    <MovementForm
      type={data.movement.type}
      warehouses={data.warehouses}
      partners={data.partners}
      documentTypes={data.documentTypes}
      movement={data.movement}
      mode="edit"
      onSubmitSuccess={() => router.push("/admin/inventory/movements")}
    />
  );
}
