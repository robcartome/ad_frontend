"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge"; // Asumiendo que tienes el componente Badge de shadcn/ui

export default function MovementDetailsModal({ open, onClose, movement }) {
  if (!movement) return null;

  // Determinar el nombre del asociado (cliente o proveedor)
  const partnerName = movement.customer_name || movement.supplier_name;

  // Determinar el estilo de la etiqueta de tipo de movimiento
  const typeBadge =
    movement.type === "ENTRY"
      ? { text: "Entrada", className: "bg-green-500 hover:bg-green-600" }
      : movement.type === "EXIT"
      ? { text: "Salida", className: "bg-red-500 hover:bg-red-600" }
      : { text: "Transferencia", className: "bg-blue-500 hover:bg-blue-600" };


  // Función para formatear moneda (asumiendo que S/ es la moneda)
  const formatCurrency = (amount) => `S/ ${Number(amount).toFixed(2)}`;

  // Calcular el total general
  const totalGeneral = movement.details.reduce((acc, d) => acc + d.total_price, 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/* 1. RESPONSIVIDAD: max-w-lg en móvil, max-w-5xl en pantallas grandes */}
      <DialogContent className="max-w-lg md:max-w-4xl lg:max-w-5xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <span>Detalles del Movimiento</span>
            <Badge className={typeBadge.className}>{typeBadge.text}</Badge>
          </DialogTitle>
        </DialogHeader>

        {/* 2. REORGANIZACIÓN: Cuadrícula Responsiva para datos clave */}
        <div className="p-4 rounded-lg bg-gray-50 border">
          <h3 className="text-lg font-bold mb-3 text-gray-700">Información General</h3>
          <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
            <div>
              <p className="text-gray-500 font-medium">Fecha de Movimiento</p>
              <p className="font-semibold">{new Date(movement.date).toLocaleDateString()}</p>
            </div>

            <div>
              <p className="text-gray-500 font-medium">Almacén de Operación</p>
              <p className="font-semibold">{movement.warehouse_name}</p>
            </div>

            <div>
              <p className="text-gray-500 font-medium">Motivo/Operación</p>
              <p className="font-semibold">{movement.reason}</p>
            </div>

            {/* Nuevos Datos */}
            {partnerName && (
                <div>
                  <p className="text-gray-500 font-medium">Asociado (Cliente/Proveedor)</p>
                  <p className="font-semibold">{partnerName}</p>
                </div>
            )}

            <div>
              <p className="text-gray-500 font-medium">Tipo de Documento</p>
              <p className="font-semibold">{movement.document_type_name}</p>
            </div>

            {(movement.series || movement.number) && (
                <div>
                  <p className="text-gray-500 font-medium">Número de Documento</p>
                  <p className="font-semibold">{`${movement.series || 'N/A'} - ${movement.number || 'N/A'}`}</p>
                </div>
            )}

            {movement.reference_doc && (
                <div>
                  <p className="text-gray-500 font-medium">Referencia</p>
                  <p className="font-semibold">{movement.reference_doc}</p>
                </div>
            )}
          </div>
        </div>


        {/* Sección de Productos */}
        <div className="mt-6">
          <h3 className="text-lg font-bold mb-3">Productos Detallados</h3>
          <div className="overflow-x-auto border rounded-lg shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100 hover:bg-gray-100">
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Precio Unitario</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movement.details.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.product_name}</TableCell>
                    <TableCell className="text-right">{d.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(d.unit_price)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(d.total_price)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end mt-4 text-lg font-bold text-gray-800">
            <span>
              Total General: {formatCurrency(totalGeneral)}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}