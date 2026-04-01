"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { getProducts } from "@/services/productsService";

const TAX_TYPES = [
  { value: "GRAVADO", label: "Gravado - Op. Onerosa" },
  { value: "EXONERADO", label: "Exonerado" },
  { value: "INAFECTO", label: "Inafecto" },
  { value: "GRATUITO", label: "Gratuito" },
  { value: "EXPORTACION", label: "Exportación" },
];

export function calcLine(line) {
  const qty = parseFloat(line.quantity) || 0;
  const unitPrice = parseFloat(line.unit_price) || 0;
  const discount = parseFloat(line.discount_amount) || 0;
  const igvRate = parseFloat(line.igv_rate) || 18;
  const subtotal = qty * unitPrice - discount;
  const igvAmount = line.tax_type === "GRAVADO" ? (subtotal * igvRate) / 100 : 0;
  return { subtotal, igvAmount, total: subtotal + igvAmount };
}

export function newLine() {
  return {
    _id: Math.random().toString(36).slice(2),
    product_id: "",
    product_name: "",
    product_sku: "",
    description: "",
    unit_code: "NIU",
    quantity: "1",
    unit_price: "0.00",
    discount_amount: "0.00",
    tax_type: "GRAVADO",
    igv_rate: "18.00",
    sunat_product_code: "",
    product_code: "",
    stock_total: 0,
  };
}

export default function QuotationDetailTable({ lines, setLines, isReadOnly }) {
  // Shared product search state (one active row at a time — like MovementDetailTable)
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeLineId, setActiveLineId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [noResults, setNoResults] = useState(false);

  // Debounce product search
  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!searchTerm || searchTerm.length < 2) {
        setSearchResults([]);
        setNoResults(false);
        return;
      }
      try {
        setSearchLoading(true);
        setNoResults(false);
        const res = await getProducts(1, 10, searchTerm);
        const results = res.results || [];
        setSearchResults(results);
        setNoResults(results.length === 0);
      } catch {
        setNoResults(true);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  function updateLine(lineId, field, value) {
    setLines((prev) =>
      prev.map((l) => (l._id === lineId ? { ...l, [field]: value } : l))
    );
  }

  function addLine() {
    setLines((prev) => [...prev, newLine()]);
  }

  function removeLine(lineId) {
    setLines((prev) => {
      if (prev.length === 1) {
        toast.error("Debe tener al menos 1 línea");
        return prev;
      }
      return prev.filter((l) => l._id !== lineId);
    });
  }

  function selectProduct(lineId, product) {
    setLines((prev) =>
      prev.map((l) =>
        l._id === lineId
          ? {
              ...l,
              product_id: product.id,
              product_name: product.name,
              product_sku: product.sku || "",
              description: product.name,
              product_code: product.sku || product.code || product.barcode || "",
              unit_code: product.unit || product.unit_code || "NIU",
              unit_price: parseFloat(product.price_sale || 0).toFixed(2),
              stock_total: product.stock_total || 0,
            }
          : l
      )
    );
    setSearchResults([]);
    setSearchTerm("");
    setActiveLineId(null);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">Detalle del Comprobante</h2>
        {!isReadOnly && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={addLine}
            className="gap-1 text-xs cursor-pointer"
          >
            <Plus size={13} />
            Agregar ítem
          </Button>
        )}
      </div>

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-2 py-2 text-center w-8">#</th>
              <th className="px-2 py-2 text-left min-w-[220px]">Bien o Servicio</th>
              <th className="px-2 py-2 text-center w-16">UND.</th>
              <th className="px-2 py-2 text-center w-20">Cantidad</th>
              <th className="px-2 py-2 text-left w-40">Tipo IGV</th>
              <th className="px-2 py-2 text-right w-24">Valor Unit.</th>
              <th className="px-2 py-2 text-right w-24">Precio Unit.</th>
              <th className="px-2 py-2 text-right w-24">SubTotal</th>
              <th className="px-2 py-2 text-right w-24">Impuesto</th>
              <th className="px-2 py-2 text-right w-24">Total</th>
              {!isReadOnly && <th className="px-2 py-2 text-center w-10">OP</th>}
            </tr>
          </thead>
          <tbody className="divide-y">
            {lines.map((line, idx) => {
              const c = calcLine(line);
              const igvRate = parseFloat(line.igv_rate) || 18;
              const valorUnit =
                line.tax_type === "GRAVADO"
                  ? parseFloat(line.unit_price) / (1 + igvRate / 100)
                  : parseFloat(line.unit_price) || 0;

              return (
                <tr key={line._id} className="hover:bg-gray-50">
                  {/* # */}
                  <td className="px-2 py-1.5 text-center text-gray-400 text-xs">
                    {idx + 1}
                  </td>

                  {/* Producto */}
                  <td className="px-2 py-1.5 relative">
                    {isReadOnly ? (
                      <span className="text-sm">{line.description}</span>
                    ) : (
                      <div className="relative">
                        <Input
                          className="text-sm h-8"
                          placeholder="Buscar por nombre o SKU..."
                          value={
                            activeLineId === line._id
                              ? searchTerm
                              : line.product_sku
                              ? `${line.product_sku} ${line.product_name}`
                              : line.product_name || ""
                          }
                          onChange={(e) => {
                            if (line.product_id) {
                              updateLine(line._id, "product_id", "");
                              updateLine(line._id, "product_name", "");
                              updateLine(line._id, "product_sku", "");
                              updateLine(line._id, "stock_total", 0);
                            }
                            setSearchTerm(e.target.value);
                            setActiveLineId(line._id);
                          }}
                          onFocus={() => setActiveLineId(line._id)}
                          title={
                            line.product_id
                              ? `${line.product_sku || ""} - ${line.product_name} — Stock: ${line.stock_total ?? 0}`
                              : ""
                          }
                        />
                        {/* Stock badge */}
                        <div className="flex justify-end mt-0.5">
                          <span className="inline-flex items-center rounded-md bg-blue-50 px-1 py-0.5 text-[10px] font-medium text-blue-600 border border-blue-200">
                            Stock: {Number(line.stock_total ?? 0).toFixed(2)}
                          </span>
                        </div>
                        {/* Dropdown */}
                        {activeLineId === line._id && (
                          <ul className="absolute z-50 bg-white border w-full max-h-48 overflow-y-auto shadow-md rounded-md top-8">
                            {searchLoading && (
                              <li className="p-2 text-sm text-gray-500 flex items-center gap-1">
                                <Loader2 size={12} className="animate-spin" /> Buscando...
                              </li>
                            )}
                            {!searchLoading && noResults && (
                              <li className="p-3 text-sm text-gray-600">
                                No se encontró el producto
                                <div className="mt-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open("/admin/products", "_blank")}
                                  >
                                    ➕ Crear producto
                                  </Button>
                                </div>
                              </li>
                            )}
                            {!searchLoading &&
                              !noResults &&
                              searchResults.map((p) => (
                                <li
                                  key={p.id}
                                  className="p-2 text-sm hover:bg-gray-100 cursor-pointer"
                                  onMouseDown={() => selectProduct(line._id, p)}
                                >
                                  <div className="font-medium">{p.name}</div>
                                  <div className="text-xs text-gray-500">
                                    {p.sku || ""} • Stock: {p.stock_total ?? 0} {p.unit} • {p.category}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    P. Venta: S/ {parseFloat(p.price_sale || 0).toFixed(2)}
                                  </div>
                                </li>
                              ))}
                          </ul>
                        )}
                        {/* Descripción editable */}
                        {line.product_id && (
                          <Input
                            className="text-xs h-7 mt-1 text-gray-500"
                            placeholder="Descripción"
                            value={line.description}
                            onChange={(e) =>
                              updateLine(line._id, "description", e.target.value)
                            }
                          />
                        )}
                      </div>
                    )}
                  </td>

                  {/* Unidad */}
                  <td className="px-2 py-1.5 text-center">
                    <Input
                      className="text-xs h-8 text-center w-16"
                      value={line.unit_code}
                      onChange={(e) => updateLine(line._id, "unit_code", e.target.value)}
                      disabled={isReadOnly}
                    />
                  </td>

                  {/* Cantidad */}
                  <td className="px-2 py-1.5 text-center">
                    <Input
                      type="number"
                      className="text-xs h-8 text-center w-20"
                      min="0.001"
                      step="1"
                      value={line.quantity}
                      onChange={(e) => updateLine(line._id, "quantity", e.target.value)}
                      disabled={isReadOnly}
                    />
                  </td>

                  {/* Tipo IGV */}
                  <td className="px-2 py-1.5">
                    <Select
                      value={line.tax_type}
                      onValueChange={(v) => updateLine(line._id, "tax_type", v)}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TAX_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value} className="text-xs">
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>

                  {/* Valor unit (exc. IGV) */}
                  <td className="px-2 py-1.5 text-right">
                    <span className="text-xs tabular-nums text-gray-500">
                      {valorUnit.toFixed(3)}
                    </span>
                  </td>

                  {/* Precio unit */}
                  <td className="px-2 py-1.5">
                    <Input
                      type="number"
                      className="text-xs h-8 text-right tabular-nums w-24"
                      min="0"
                      step="0.01"
                      value={line.unit_price}
                      onChange={(e) => updateLine(line._id, "unit_price", e.target.value)}
                      disabled={isReadOnly}
                    />
                  </td>

                  {/* SubTotal */}
                  <td className="px-2 py-1.5 text-right text-xs tabular-nums text-gray-700">
                    {c.subtotal.toFixed(2)}
                  </td>

                  {/* IGV */}
                  <td className="px-2 py-1.5 text-right text-xs tabular-nums text-gray-700">
                    {c.igvAmount.toFixed(2)}
                  </td>

                  {/* Total */}
                  <td className="px-2 py-1.5 text-right text-xs tabular-nums font-medium">
                    {c.total.toFixed(2)}
                  </td>

                  {/* Eliminar */}
                  {!isReadOnly && (
                    <td className="px-2 py-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => removeLine(line._id)}
                        className="text-gray-300 hover:text-red-500 cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
