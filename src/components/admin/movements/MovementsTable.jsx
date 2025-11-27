"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Pencil, Trash2 } from "lucide-react";

import MovementDetailsModal from "./MovementDetailsModal";

export default function MovementsTable({ movements, onDelete }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState(null);

  // Determinar el estilo de la etiqueta de tipo de movimiento
  const typeBadge = {
    ENTRY: { text: "Entrada", className: "bg-green-400 hover:bg-green-500" },
    EXIT: { text: "Salida", className: "bg-red-400 hover:bg-red-500" },
    TRANSFER: { text: "Transferencia", className: "bg-blue-400 hover:bg-blue-500" },
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Movimientos</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-xs md:text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Fecha</th>
                  <th className="px-4 py-2 text-left">Tipo</th>
                  <th className="px-4 py-2 text-left">Almacén</th>
                  <th className="px-4 py-2 text-left">Operación</th>
                  <th className="px-4 py-2 text-left">Socio de Negocio</th>
                  <th className="px-4 py-2 text-left">Documento</th>
                  <th className="px-4 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id} className="border-t hover:bg-gray-50">
                    <td className="px-4">{new Date(m.date).toLocaleString()}</td>
                    <td className="px-4 py-1">
                      <Badge className={typeBadge[m.type].className}>{typeBadge[m.type].text}</Badge>
                    </td>
                    <td className="px-4 py-1">{m.warehouse_name}</td>
                    <td className="px-4 py-1">{m.reason || "-"}</td>
                    <td className="px-4 py-1">{(m.type == "EXIT" ? m.customer_name : m.supplier_name) || "-"}</td>
                    <td className="px-4 py-1">{`${m.document_type_name} ${m.series}-${m.number}`}</td>
                    {/* <td className="px-4 py-1">
                      S/{" "}
                      {m.details
                        .reduce((acc, d) => acc + d.total_price, 0)
                        .toFixed(2)}
                    </td> */}

                    <td className="px-4 py-1 space-x-2 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedMovement(m);
                          setModalOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                        Ver
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          window.location.href = `/admin/inventory/movements/edit/${m.id}`;
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDelete(m.id)}
                      >
                        <Trash2 className="w-4 h-4" />
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
