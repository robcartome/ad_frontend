"use client";


import { useEffect, useState } from "react";

import AdjustmentForm from "@/components/admin/movements/AdjustmentForm";
import { getWarehouses } from "@/services/warehousesService";
import { getFakeUserUUID, loginWithFakeUUID } from "@/utils/fakeAuth";


export default function AdjustmentsPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [userUUID, setUserUUID] = useState("");

  useEffect(() => {
    getWarehouses().then(setWarehouses);
    if (typeof window !== "undefined") {
      let uuid = getFakeUserUUID();
      if (!uuid) {
        uuid = loginWithFakeUUID();
      }
      setUserUUID(uuid);
    }
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Ajustes de Inventario</h1>
      <AdjustmentForm warehouses={warehouses} createdBy={userUUID} />
    </div>
  );
}
