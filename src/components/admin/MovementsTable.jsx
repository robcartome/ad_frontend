"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MovementDetailsModal from "./MovementDetailsModal";

export default function MovementsTable({ movements }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState(null);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Movimientos</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Fecha</th>
                  <th className="px-4 py-2 text-left">Tipo</th>
                  <th className="px-4 py-2 text-left">Almacén</th>
                  <th className="px-4 py-2 text-left">Motivo</th>
                  <th className="px-4 py-2 text-left">Total</th>
                  <th className="px-4 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{new Date(m.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2">
                      {m.type === "ENTRY" && <span className="text-green-600">Entrada</span>}
                      {m.type === "EXIT" && <span className="text-red-600">Salida</span>}
                      {m.type === "TRANSFER" && <span className="text-blue-600">Transferencia</span>}
                    </td>
                    <td className="px-4 py-2">{m.warehouse_name}</td>
                    <td className="px-4 py-2">{m.reason || "-"}</td>
                    <td className="px-4 py-2">
                      S/{" "}
                      {m.details
                        .reduce((acc, d) => acc + d.total_price, 0)
                        .toFixed(2)}
                    </td>
                    <td className="px-4 py-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedMovement(m);
                          setModalOpen(true);
                        }}
                      >
                        Ver
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <MovementDetailsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        movement={selectedMovement}
      />
    </>
  );
}
