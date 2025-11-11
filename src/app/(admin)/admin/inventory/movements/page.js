"use client";

import { useEffect, useState } from "react";
import { getMovements } from "@/services/movementsService";
import { getWarehouses } from "@/services/warehousesServices";

import MovementsTable from "@/components/admin/MovementsTable";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function MovementsPage() {
  const [movements, setMovements] = useState([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(5);
  const [offset, setOffset] = useState(0);

  // filtros
  const [type, setType] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const [date, setDate] = useState("");

  // Cargar almacenes y movimientos
  useEffect(() => {
    console.log("Cargando almacenes...", getWarehouses());
    getWarehouses().then(setWarehouses);
  }, []);

  const fetchMovements = async () => {
    const data = await getMovements({ limit, offset, type, warehouse_id: warehouseId, date });
    setMovements(data.results);
    setTotal(data.total);
  };

  useEffect(() => {
    fetchMovements();
  }, [limit, offset, type, warehouseId, date]);

  const handleNext = () => {
    if (offset + limit < total) setOffset(offset + limit);
  };

  const handlePrev = () => {
    if (offset > 0) setOffset(offset - limit);
  };
              console.log(warehouses);
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Movimientos</h1>

      {/* 🔍 Filtros */}
      <div className="flex flex-wrap gap-3 items-end">
        {/* Tipo */}
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tipo de movimiento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="ENTRY">Entradas</SelectItem>
            <SelectItem value="EXIT">Salidas</SelectItem>
            <SelectItem value="TRANSFER">Transferencias</SelectItem>
          </SelectContent>
        </Select>

        {/* Almacén */}
        <Select value={warehouseId} onValueChange={setWarehouseId}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Seleccionar almacén" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los almacenes</SelectItem>
            {
            warehouses.map((w) => (
              <SelectItem key={w.id} value={w.id}>
                {w.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Fecha */}
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-[180px]"
        />

        <Button onClick={() => { setOffset(0); fetchMovements(); }}>
          Buscar
        </Button>
      </div>

      {/* 🧾 Tabla */}
      <MovementsTable movements={movements} />

      {/* 📄 Paginación */}
      <div className="flex justify-between items-center mt-4 text-sm">
        <p>
          Mostrando {offset + 1} - {Math.min(offset + limit, total)} de {total}
        </p>
        <div className="space-x-2">
          <Button variant="outline" size="sm" disabled={offset === 0} onClick={handlePrev}>
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={offset + limit >= total}
            onClick={handleNext}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
