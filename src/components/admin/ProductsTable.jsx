"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import ProductModal from "./ProductModal";
import { v4 as uuidv4 } from "uuid";

export default function ProductsTable({
  products,
  total,
  count,
  page,
  setPage,
  limit,
  search,
  setSearch, // ← viene desde ProductsPage
  setProducts, // opcional si haces ediciones locales
}) {
  const [filterStatus, setFilterStatus] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Calculamos las páginas según lo que diga el backend
  const totalPages = Math.ceil(total / limit);

  // Filtrado local solo por estado (ya no por búsqueda)
  const filteredProducts = products.filter((product) => {
    if (filterStatus === "all") return true;
    return filterStatus === "active" ? product.active : !product.active;
  });

  // CRUD local (sólo visual)
  const handleAdd = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleSave = (data) => {
    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? { ...p, ...data } : p))
      );
    } else {
      setProducts((prev) => [
        ...prev,
        { ...data, id: uuidv4(), active: true },
      ]);
    }
  };

  const handleDelete = (id) => {
    if (confirm("¿Eliminar este producto?")) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold">
            Productos ({count}/{total})
          </CardTitle>
          <Button onClick={handleAdd}>Agregar producto</Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* 🔍 Búsqueda global + filtro local */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <Input
            placeholder="Buscar por nombre o SKU..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // Reiniciar a primera página cuando se busca algo nuevo
            }}
            className="max-w-sm"
          />

          <Select
            value={filterStatus}
            onValueChange={(value) => setFilterStatus(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="inactive">Inactivos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 🧾 Tabla */}
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">SKU</th>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Unidad</th>
                <th className="px-4 py-2 text-left">Marca</th>
                <th className="px-4 py-2 text-left">Categoría</th>
                <th className="px-4 py-2 text-left">Precio Compra</th>
                <th className="px-4 py-2 text-left">Activo</th>
                <th className="px-4 py-2 text-left">Creado</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{product.sku}</td>
                  <td className="px-4 py-2">{product.name}</td>
                  <td className="px-4 py-2">{product.unit}</td>
                  <td className="px-4 py-2">{product.brand || "-"}</td>
                  <td className="px-4 py-2">{product.category || "-"}</td>
                  <td className="px-4 py-2">S/ {product.price_purchase}</td>
                  <td className="px-4 py-2">
                    {product.active ? (
                      <span className="text-green-600 font-medium">Activo</span>
                    ) : (
                      <span className="text-red-600 font-medium">Inactivo</span>
                    )}
                  </td>
                  <td className="px-4 py-2">{product.created_at}</td>
                  <td className="px-4 py-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="mr-2"
                      onClick={() => handleEdit(product)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(product.id)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="9" className="text-center py-4 text-gray-500">
                    No se encontraron productos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 📄 Paginación controlada por backend */}
        <div className="flex justify-between items-center mt-4 text-sm">
          <p>
            Página {page} de {totalPages || 1}
          </p>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </CardContent>

      {/* 🪟 Modal crear/editar */}
      <ProductModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        product={editingProduct}
      />
    </Card>
  );
}
