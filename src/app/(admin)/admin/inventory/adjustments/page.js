"use client";


import { useEffect, useState } from "react";
import MovementForm from "@/components/admin/movements/MovementForm";
import { getWarehouses } from "@/services/warehousesService";
import { getProducts } from "@/services/productsService";


export default function AdjustmentsPage() {
  const [warehouses, setWarehouses] = useState([]);
  useEffect(() => {
    getWarehouses().then(setWarehouses);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Ajustes de Inventario</h1>
      <MovementForm type="ADJUSTMENT" warehouses={warehouses} />
    </div>
  );
}
