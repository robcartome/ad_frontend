"use client";

import { useEffect, useState } from "react";
import { getWarehouses } from "@/services/warehousesService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState([]);

  useEffect(() => {
    getWarehouses().then(setWarehouses);
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Almacenes</h2>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/administration/configuration">Configurar principal</Link>
          </Button>
          <Button onClick={() => alert("Nuevo almacén próximamente")}>
            Nuevo almacén
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {warehouses.map((wh) => (
          <Card key={wh.id} className="hover:shadow-md transition">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                <span>{wh.name}</span>
                {wh.is_default && (
                  <span className="text-xs rounded bg-green-100 text-green-700 px-2 py-0.5">
                    Principal
                  </span>
                )}
              </CardTitle>
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
