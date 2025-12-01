"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProducts } from "@/services/productsService";

export default function MovementDetailTable({ details, setDetails }) {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeRow, setActiveRow] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [noResults, setNoResults] = useState(false);

  console.log("MovementDetailTable details:", details);
  // 🔍 Buscar productos al escribir
  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!searchTerm || searchTerm.length < 2) {
        setSearchResults([]);
        setNoResults(false);
        return;
      }

      try {
        setLoading(true);
        setNoResults(false);
        const res = await getProducts(1, 10, searchTerm);
        const results = res.results || [];
        setSearchResults(results);
        setNoResults(results.length === 0);
      } catch (err) {
        console.error("Error al buscar productos:", err);
        setNoResults(true);
      } finally {
        setLoading(false);
      }
    }, 400); // debounce

    return () => clearTimeout(delay);
  }, [searchTerm]);

  const handleChange = (index, field, value) => {
    const updated = [...details];
    updated[index][field] = value;
    setDetails(updated);
  };

  const addRow = () => {
    setDetails([
      ...details,
      { product_id: "", product_name: "", unit: "", quantity: 1, unit_price: 0 },
    ]);
  };

  const removeRow = (index) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  const handleSelectProduct = (index, product) => {
    handleChange(index, "product_id", product.id);
    handleChange(index, "sku", product.sku || "")
    handleChange(index, "product_name", product.name);
    handleChange(index, "unit", product.unit);
    handleChange(index, "unit_price", parseFloat(product.price_purchase || 0));
    setSearchResults([]);
    setSearchTerm("");
    setActiveRow(null);
  };

  return (
    <div className="border rounded-md p-3 space-y-3 relative">
      <h3 className="font-semibold">Detalle del Movimiento</h3>

      {/* Encabezados */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-12 gap-2 text-sm font-medium border-b pb-1 mb-0">
        <div className="col-span-1 text-center">#</div>
        <div className="col-span-5">Producto</div>
        <div className="col-span-2 md:col-span-1">Unidad</div>
        <div className="col-span-2 md:col-span-1">Cantidad</div>
        <div className="col-span-2 md:col-span-1">Precio Unit.</div>
        <div className="col-span-2 text-right">Subtotal</div>
        <div className="col-span-1 text-right"></div>
      </div>

      {details.map((row, i) => {
        const subtotal = (row.quantity || 0) * (row.unit_price || 0);

        return (
          <div key={i} className="grid grid-cols-5 md:grid-cols-12 gap-2 items-center border-b py-2 relative mb-0">
            {/* Nº Ítem */}
            <div className="text-center font-semibold">
              {i + 1}
            </div>
            {/* 🔹 Campo de búsqueda de producto */}
            <div className="col-span-5 relative">
              <Input
                className="h-8 px-2"
                placeholder="Buscar por nombre o SKU..."
                value={
                  activeRow === i
                    ? searchTerm
                    : row.sku
                    ? `${row.sku} ${row.product_name}`
                    : row.product_name || ""
                }
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setActiveRow(i);
                }}
                onFocus={() => setActiveRow(i)}
                title={`${row.product_id ? `${row.sku} - ${row.product_name}` : ""}`}
              />

              {/* 🔹 Resultados de búsqueda */}
              {activeRow === i && (
                <ul className="absolute z-50 bg-white border w-full max-h-48 overflow-y-auto shadow-md rounded-md">
                  {loading && (
                    <li className="p-2 text-sm text-gray-500">Buscando...</li>
                  )}

                  {!loading && noResults && (
                    <li className="p-3 text-sm text-gray-600">
                      No se encontró el producto
                      <div className="mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open("/admin/products", "_blank")}
                        >
                          ➕ Crear producto
                        </Button>
                      </div>
                    </li>
                  )}

                  {!loading &&
                    !noResults &&
                    searchResults.map((p) => (
                      <li
                        key={p.id}
                        className="p-2 text-sm hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleSelectProduct(i, p)}
                      >
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-gray-500">
                          {p.sku || ""} • {p.brand?.name || ""} • {p.category?.name || ""} • {p.unit}
                        </div>
                        <div className="text-xs text-gray-600">
                          Precio: S/ {p.price_purchase}
                        </div>
                      </li>
                    ))}
                </ul>
              )}
            </div>

            {/* Unidad */}
            <div className="col-span-2 md:col-span-1">
              <Input value={row.unit || ""} readOnly className="!text-xs h-8 px-2 bg-gray-100" />
            </div>

            {/* Cantidad */}
            <div className="col-span-2 md:col-span-1">
              <Input
                className="h-8 px-2"
                type="number"
                value={row.quantity}
                min="1"
                onChange={(e) =>
                  handleChange(i, "quantity", parseFloat(e.target.value))
                }
              />
            </div>

            {/* Precio Unitario */}
            <div className="col-span-2 md:col-span-1">
              <Input
                className="h-8 px-2"
                type="number"
                value={row.unit_price}
                min="0"
                step="any"
                onChange={(e) =>
                  handleChange(i, "unit_price", parseFloat(e.target.value))
                }
              />
            </div>

            {/* Subtotal */}
            <div className="col-span-2 pr-2 text-right">
              <span className="text-gray-700">S/ {subtotal.toFixed(2)}</span>
            </div>

            {/* Eliminar fila */}
            <div className="col-span-1 text-right">
              <Button
                variant="destructive"
                size="sm"
                type="button"
                onClick={() => removeRow(i)}
              >
                ✕
              </Button>
            </div>
          </div>
        );
      })}

      <Button type="button" onClick={addRow} className="mt-2">
        + Agregar producto
      </Button>
    </div>
  );
}
