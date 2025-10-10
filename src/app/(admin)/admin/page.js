import ProductsTable from "@/components/admin/ProductsTable";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Panel de Almacén</h1>
        <p className="text-gray-600">Bienvenido al sistema de control de inventario.</p>
      </div>

      <ProductsTable />
    </div>
  );
}
