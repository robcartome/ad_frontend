"use client";

import { useEffect, useState } from "react";
import { getWarehouses } from "@/services/warehousesServices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState([]);

  useEffect(() => {
    getWarehouses().then(setWarehouses);
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Almacenes</h2>
        <Button onClick={() => alert("Nuevo almacén próximamente")}>
          Nuevo almacén
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {warehouses.map((wh) => (
          <Card key={wh.id} className="hover:shadow-md transition">
            <CardHeader>
              <CardTitle>{wh.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2">
                Ubicación: {wh.location || "No especificada"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
