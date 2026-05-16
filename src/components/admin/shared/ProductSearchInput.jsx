"use client";

import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Check } from "lucide-react";

/**
 * Input reutilizable de búsqueda de productos con dropdown.
 *
 * Comportamiento:
 *  - Al hacer foco: abre el dropdown con los últimos 50 productos SIN borrar el producto
 *    ya seleccionado. Si hay uno seleccionado aparece primero (pinnedResult) resaltado.
 *  - Al escribir: busca por término. En ese momento sí se limpia la selección (onClearProduct).
 *  - El badge de stock se renderiza en el componente padre (debajo de Cantidad).
 *
 * Props:
 *   isActive        {boolean}             dropdown visible para esta fila
 *   displayValue    {string}              texto cuando hay producto seleccionado / no activo
 *   searchTerm      {string}              texto que escribió el usuario (solo cuando hasTyped)
 *   hasTyped        {boolean}             true cuando el usuario escribió al menos 1 char
 *   searchResults   {Array}               lista de productos del API
 *   searchLoading   {boolean}
 *   noResults       {boolean}
 *   pinnedResult    {Object|null}         producto actualmente seleccionado (primero en dropdown)
 *   priceField      {"sale"|"purchase"}   precio a mostrar en el dropdown
 *   disabled        {boolean}
 *   titleAttr       {string}              tooltip del input
 *   onFocus         {Function}            el padre activa el dropdown
 *   onChange        {Function(value)}     al escribir
 *   onSelect        {Function(product)}   al elegir un producto
 *   onClearProduct  {Function}            cuando el usuario empieza a escribir
 *   useFixed        {boolean}             usar position:fixed para el dropdown (cuando está dentro de overflow containers)
 */
export default function ProductSearchInput({
  isActive,
  displayValue = "",
  searchTerm = "",
  hasTyped = false,
  searchResults = [],
  searchLoading = false,
  noResults = false,
  pinnedResult = null,
  priceField = "sale",
  disabled = false,
  titleAttr = "",
  useFixed = false,
  onFocus,
  onChange,
  onSelect,
  onClearProduct,
}) {
  const inputRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState({});

  // Cuando el dropdown debe usar position:fixed, calculamos las coordenadas del input
  useEffect(() => {
    if (!isActive || !useFixed || !inputRef.current) return;

    function recalc() {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 2,
        left: rect.left,
        width: Math.max(rect.width, 280),
        zIndex: 9999,
      });
    }

    recalc();
    window.addEventListener("scroll", recalc, true);
    window.addEventListener("resize", recalc);
    return () => {
      window.removeEventListener("scroll", recalc, true);
      window.removeEventListener("resize", recalc);
    };
  }, [isActive, useFixed]);
  const inputValue = isActive && hasTyped ? searchTerm : displayValue;
  const listToShow =
    !hasTyped && pinnedResult
      ? [pinnedResult, ...searchResults.filter((p) => p.id !== pinnedResult.id)]
      : searchResults;

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        className="h-7 px-2 text-xs"
        placeholder="Buscar por nombre o SKU..."
        disabled={disabled}
        value={inputValue}
        title={titleAttr}
        onFocus={onFocus}
        onChange={(e) => {
          const val = e.target.value;
          if (!hasTyped && displayValue && val.length > 0) {
            onClearProduct?.();
          }
          onChange?.(val);
        }}
      />

      {isActive && (
        <ul
          className="bg-white border max-h-60 overflow-y-auto shadow-md rounded-md text-xs"
          style={
            useFixed
              ? dropdownStyle
              : { position: "absolute", top: "100%", left: 0, width: "100%", minWidth: 260, zIndex: 70, marginTop: 2 }
          }
        >
          {searchLoading && (
            <li className="p-2 text-xs text-gray-500 flex items-center gap-1">
              <Loader2 size={12} className="animate-spin" /> Buscando...
            </li>
          )}

          {!searchLoading && noResults && (
            <li className="p-3 text-xs text-gray-600">
              No se encontró el producto
              <div className="mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onMouseDown={() => window.open("/admin/products", "_blank")}
                >
                  ➕ Crear producto
                </Button>
              </div>
            </li>
          )}

          {!searchLoading &&
            !noResults &&
            listToShow.map((p) => {
              const isPinned = pinnedResult && p.id === pinnedResult.id && !hasTyped;
              return (
                <li
                  key={p.id}
                  className={`p-2 text-xs cursor-pointer border-b last:border-b-0 flex items-start gap-1.5
                    ${isPinned ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-gray-100"}`}
                  onMouseDown={() => onSelect?.(p)}
                >
                  <div className="mt-0.5 w-3 shrink-0">
                    {isPinned && <Check size={10} className="text-blue-600" />}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium leading-snug">{p.name}</div>
                    <div className="text-gray-500">
                      {p.sku || ""} • Stock: {p.stock_total ?? 0} {p.unit}
                    </div>
                    <div className="text-blue-600 font-medium">
                      {priceField === "purchase"
                        ? `P. Compra: S/ ${parseFloat(p.price_purchase || 0).toFixed(2)}`
                        : `P. Venta: S/ ${parseFloat(p.price_sale || 0).toFixed(2)}`}
                    </div>
                  </div>
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
}
