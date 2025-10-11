"use client";

import { useState, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BrandModal from "./BrandModal";

export default function BrandsTable({ Brands: brands, setBrands }) {

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const pageSize = 5;

  const filtered = useMemo(() => {
    return brands
      .filter((b) => b.name.toLowerCase().includes(search.toLowerCase()))
      .slice((page - 1) * pageSize, page * pageSize);
  }, [brands, search, page]);

  const totalPages = Math.ceil(
    brands.filter((b) => b.name.toLowerCase().includes(search.toLowerCase())).length / pageSize
  );

  const handleAdd = () => {
    setEditingBrand(null);
    setModalOpen(true);
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setModalOpen(true);
  };

  const handleSave = (data) => {
    if (editingBrand) {
      setBrands((prev) => prev.map((b) => (b.id === editingBrand.id ? { ...b, ...data } : b)));
    } else {
      setBrands((prev) => [...prev, { ...data, id: uuidv4(), active: true }]);
    }
  };

  const handleDelete = (id) => {
    if (confirm("¿Eliminar esta marca?")) {
      setBrands((prev) => prev.filter((b) => b.id !== id));
    }
  };

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Marcas</CardTitle>
        <Button onClick={handleAdd}>Agregar marca</Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <Input
            placeholder="Buscar marca..."
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
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Activo</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((brand) => (
                <tr key={brand.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{brand.id}</td>
                  <td className="px-4 py-2">{brand.name}</td>
                  <td className="px-4 py-2">
                    {brand.active ? (
                      <span className="text-green-600 font-medium">Activo</span>
                    ) : (
                      <span className="text-red-600 font-medium">Inactivo</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <Button size="sm" variant="outline" className="mr-2" onClick={() => handleEdit(brand)}>
                      Editar
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(brand.id)}>
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
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
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

      <BrandModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        brand={editingBrand}
      />
    </Card>
  );
}
