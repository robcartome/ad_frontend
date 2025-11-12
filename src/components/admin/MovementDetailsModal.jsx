"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

export default function MovementDetailsModal({ open, onClose, movement }) {
  if (!movement) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
            <DialogTitle>Detalles del Movimiento</DialogTitle>

            <div className="mt-2 space-y-1 text-sm text-gray-500">
                <p><strong>Fecha:</strong> {new Date(movement.date).toLocaleDateString()}</p>
                <p><strong>Tipo:</strong> {movement.type === "ENTRY" ? "Entrada" : movement.type === "EXIT" ? "Salida" : "Transferencia"}</p>
                <p><strong>Almacén:</strong> {movement.warehouse_name}</p>
                <p><strong>Motivo:</strong> {movement.reason}</p>
            </div>
        </DialogHeader>


        <div className="mt-4">
          <h3 className="text-base font-semibold mb-2">Productos</h3>
          <div className="overflow-x-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead>Producto</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Precio Unitario</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movement.details.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>{d.product_name}</TableCell>
                    <TableCell>{d.quantity}</TableCell>
                    <TableCell>S/ {d.unit_price.toFixed(2)}</TableCell>
                    <TableCell>S/ {d.total_price.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end mt-4 text-sm font-semibold">
            <span>
              Total general:{" "}
              S/{" "}
              {movement.details
                .reduce((acc, d) => acc + d.total_price, 0)
                .toFixed(2)}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
