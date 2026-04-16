"use client";

import { useEffect, useState } from "react";
import AdjustmentForm from "@/components/admin/movements/AdjustmentForm";
import { getWarehouses } from "@/services/warehousesService";
import { useAuth } from "@/lib/AuthContext";

export default function AdjustmentsPage() {
  const [warehouses, setWarehouses] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    getWarehouses().then(setWarehouses);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Ajustes de Inventario</h1>
      <AdjustmentForm warehouses={warehouses} createdBy={user?.id ?? ""} />
    </div>
  );
}
