"use client";

import { useEffect, useState } from "react";
import MovementForm from "@/components/admin/movements/MovementForm";

import { getWarehouses } from "@/services/warehousesService";
import { getCustomers } from "@/services/customersService";
import { getDocumentTypes } from "@/services/documentTypesService";
import { Loader2 } from "lucide-react";

export default function ExitPage() {
  const [data, setData] = useState({ loading: true });

  useEffect(() => {
    async function load() {
      const warehouses = await getWarehouses();
      const customers = await getCustomers();
      const documentTypes = await getDocumentTypes();

      setData({
        loading: false,
        warehouses,
        partners: customers,
        documentTypes,
      });
    }

    load();
  }, []);

  if (data.loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-lg text-gray-600">Cargando datos...</p>
      </div>
    );
  }

  return (
    <MovementForm
      type="EXIT"
      warehouses={data.warehouses}
      partners={data.partners}
      documentTypes={data.documentTypes}
    />
  );
}
