"use client";

import { useState, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CategoryModal from "./CategoryModal";

export default function CategoriesTable({ categories, setCategories}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return categories
      .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
      .slice((page - 1) * pageSize, page * pageSize);
  }, [categories, search, page]);

  const totalPages = Math.ceil(
    categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())).length / pageSize
  );

  const handleAdd = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleSave = (data) => {
    if (editingCategory) {
      setCategories((prev) =>
        prev.map((category) => (category.id === editingCategory.id ? { ...category, ...data } : category))
      );
    } else {
      setCategories((prev) => [...prev, { ...data, id: uuidv4(), active: true }]);
    }
  };

  const handleDelete = (id) => {
    if (confirm("¿Eliminar esta categoría?")) {
      setCategories((prev) => prev.filter((category) => category.id !== id));
    }
  };

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Categorías</CardTitle>
        <Button onClick={handleAdd}>Agregar categoría</Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <Input
            placeholder="Buscar categoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Id</th>
                <th className="px-4 py-2 text-left">Código</th>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Activo</th>
                <th className="px-4 py-2 text-left">Creado</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((category) => (
                <tr key={category.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{category.id}</td>
                  <td className="px-4 py-2">{category.code}</td>
                  <td className="px-4 py-2">{category.name}</td>
                  <td className="px-4 py-2">
                    {category.active ? (
                      <span className="text-green-600 font-medium">Activo</span>
                    ) : (
                      <span className="text-red-600 font-medium">Inactivo</span>
                    )}
                  </td>
                  <td className="px-4 py-2">{category.created_at}</td>
                  <td className="px-4 py-2">
                    <Button size="sm" variant="outline" className="mr-2" onClick={() => handleEdit(category)}>
                      Editar
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(category.id)}>
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-4 text-sm">
          <p>
            Página {page} de {totalPages}
          </p>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </CardContent>

      <CategoryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        category={editingCategory}
      />
    </Card>
  );
}
