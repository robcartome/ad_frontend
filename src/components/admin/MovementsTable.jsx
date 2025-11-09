"use client";

import { useState, useMemo } from "react";
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

export default function MovementsTable({ movements }) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // 🔎 Filtrar por búsqueda + tipo
  const filtered = useMemo(() => {
    return movements
      .filter((m) => {
        const matchesSearch =
          m.operation.toLowerCase().includes(search.toLowerCase()) ||
          m.warehouse.toLowerCase().includes(search.toLowerCase()) ||
          m.document.toLowerCase().includes(search.toLowerCase()) ||
          m.partner.toLowerCase().includes(search.toLowerCase());
        const matchesType =
          filterType === "all" ? true : m.type === filterType;
        return matchesSearch && matchesType;
      })
      .slice((page - 1) * pageSize, page * pageSize);
  }, [search, filterType, page, movements]);

  const totalPages = Math.ceil(
    movements.filter((m) => {
      const matchesSearch =
        m.operation.toLowerCase().includes(search.toLowerCase()) ||
        m.warehouse.toLowerCase().includes(search.toLowerCase()) ||
        m.document.toLowerCase().includes(search.toLowerCase()) ||
        m.partner.toLowerCase().includes(search.toLowerCase());
      const matchesType =
        filterType === "all" ? true : m.type === filterType;
      return matchesSearch && matchesType;
    }).length / pageSize
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold">Movimientos</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        {/* 🔍 Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <Input
            placeholder="Buscar operación, almacén o socio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />

          <Select
            value={filterType}
            onValueChange={(value) => {
              setFilterType(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="ENTRADA">Entradas</SelectItem>
              <SelectItem value="SALIDA">Salidas</SelectItem>
              <SelectItem value="TRANSFERENCIA">Transferencias</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 🧾 Tabla */}
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Fecha</th>
                <th className="px-4 py-2 text-left">Operación</th>
                <th className="px-4 py-2 text-left">N° Operación</th>
                <th className="px-4 py-2 text-left">Almacén</th>
                <th className="px-4 py-2 text-left">Documento</th>
                <th className="px-4 py-2 text-left">Socio de Negocio</th>
                <th className="px-4 py-2 text-left">Tipo</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{m.date}</td>
                  <td className="px-4 py-2">{m.operation}</td>
                  <td className="px-4 py-2">{m.operation_number}</td>
                  <td className="px-4 py-2">{m.warehouse}</td>
                  <td className="px-4 py-2">{m.document}</td>
                  <td className="px-4 py-2">{m.partner}</td>
                  <td className="px-4 py-2 font-medium">
                    {m.type === "ENTRADA" && (
                      <span className="text-green-600">{m.type}</span>
                    )}
                    {m.type === "SALIDA" && (
                      <span className="text-red-600">{m.type}</span>
                    )}
                    {m.type === "TRANSFERENCIA" && (
                      <span className="text-blue-600">{m.type}</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => alert(`Ver detalles de ${m.operation_number}`)}
                    >
                      Ver
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 📄 Paginación */}
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
    </Card>
  );
}
