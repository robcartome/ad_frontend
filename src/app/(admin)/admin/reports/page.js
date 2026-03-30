import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const reportCards = [
  {
    title: "Reporte de Stock por Almacen",
    description:
      "Existencias actuales filtradas por un almacen. Con estado de stock, precio de compra y valorizacion.",
    href: "/admin/reports/stock-by-warehouse",
  },
  {
    title: "Stock Comparativo por Almacenes",
    description:
      "Selecciona varios almacenes y mira el stock de cada producto en la misma fila, lado a lado.",
    href: "/admin/reports/stock-by-warehouses",
  },
  {
    title: "Reporte de Movimientos del Almacen",
    description:
      "Consulta entradas, salidas, transferencias y ajustes con filtros por fecha, tipo y almacen.",
    href: "/admin/reports/movements",
  },
  {
    title: "Reporte de Kardex de Inventario",
    description:
      "Ingresos, salidas y saldo acumulado por producto para un almacen, con saldo inicial de apertura.",
    href: "/admin/reports/kardex",
  },
];

export default function ReportsHomePage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Reportes</h1>
        <p className="text-sm text-gray-600 mt-1">
          Primero visualiza el reporte en el navegador y luego descarga en Excel o PDF.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {reportCards.map((card) => (
          <Card key={card.href} className="border">
            <CardHeader>
              <CardTitle className="text-lg">{card.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{card.description}</p>
              <Button asChild>
                <Link href={card.href}>Abrir reporte</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
