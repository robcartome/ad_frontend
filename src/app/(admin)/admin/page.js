import ProductsTable from "@/components/admin/ProductsTable";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">Panel de Control</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-2">Productos</h2>
          <p className="text-gray-600">Gestión de productos y precios.</p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-2">Stock</h2>
          <p className="text-gray-600">Control de almacenes y existencias.</p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-2">Reportes</h2>
          <p className="text-gray-600">Resumen de movimientos y ventas.</p>
        </div>
      </div>

      <ProductsTable />
    </div>
  );
}
