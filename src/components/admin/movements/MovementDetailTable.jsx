"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProducts } from "@/services/productsService";
import { getStockByProductAndWarehouse } from "@/services/stockService";
import { Loader2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { importExcelFile, downloadExcelTemplate } from "@/utils/importExcel";
import ProductSearchInput from "@/components/admin/shared/ProductSearchInput";


export default function MovementDetailTable({ details, setDetails, type_movement, warehouse_id }) {
  const handleDownloadTemplate = () => {
    const headers = ["CODIGO", "CANTIDAD"];
    const example = ["P0001", 10];
    downloadExcelTemplate(headers, example, `modelo_importacion_${type_movement?.toLowerCase() || "movimiento"}.xlsx`);
  };
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeRow, setActiveRow] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasTyped, setHasTyped] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ processed: 0, total: 0 });
  const [importWarnings, setImportWarnings] = useState([]);
  const isAdjustment = type_movement === "ADJUSTMENT";

  const handleImportExcel = async (e) => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportWarnings([]);
    setImportProgress({ processed: 0, total: 0 });

    try {
      const importedRows = await importExcelFile(file, {
        requiredHeaders: ["CODIGO", "CANTIDAD"],
        rowMapper: (headers, row) => {
          const codeIdx = headers.findIndex(h => h.toString().toLowerCase().includes("codigo"));
          const qtyIdx = headers.findIndex(h => h.toString().toLowerCase().includes("cantidad"));
          if (codeIdx === -1 || qtyIdx === -1) return null;
          return {
            code: row[codeIdx]?.toString().trim(),
            qty: parseFloat(row[qtyIdx]) || 1,
          };
        },
      });

      const normalizedRows = importedRows.filter((row) => row?.code);
      setImportProgress({ processed: 0, total: normalizedRows.length });

      // Buscar productos por código (SKU)
      let newDetails = [];
      const missingCodes = [];

      for (let index = 0; index < normalizedRows.length; index += 1) {
        const { code, qty } = normalizedRows[index];

        try {
          const res = await getProducts(1, 1, code);
          const product = (res.results || []).find(p => p.sku === code);
          if (product) {
            const stockTotal = product.stock_total || 0;
            let warehouseStock = stockTotal;
            if (product.id && warehouse_id) {
              warehouseStock = await getStockByProductAndWarehouse(product.id, warehouse_id);
            }
            newDetails.push({
              product_id: product.id,
              sku: product.sku || "",
              product_name: product.name,
              unit: product.unit,
              unit_price: parseFloat(
                type_movement === "ENTRY"
                  ? product.price_purchase
                  : product.price_sale || 0,
              ),
              price_purchase: product.price_purchase || 0,
              stock_total: stockTotal,
              warehouse_stock: warehouseStock,
              quantity: qty,
              ...(isAdjustment ? { physical_quantity: qty } : {}),
            });
          } else {
            missingCodes.push(code);
          }
        } catch (err) {
          missingCodes.push(code);
        } finally {
          setImportProgress({ processed: index + 1, total: normalizedRows.length });
        }
      }

      if (missingCodes.length > 0) {
        const uniqueMissingCodes = [...new Set(missingCodes)];
        setImportWarnings(uniqueMissingCodes);
      }

      if (newDetails.length === 0) {
        toast.error("No se encontraron productos válidos en el archivo.");
        return;
      }

      setDetails(newDetails);
      toast.success(`Se importaron ${newDetails.length} producto(s) correctamente.`);
    } catch (err) {
      toast.error(err.message || "Error al importar el archivo Excel");
    } finally {
      setIsImporting(false);
      input.value = "";
    }
  };

  const importPercent = importProgress.total > 0
    ? Math.round((importProgress.processed / importProgress.total) * 100)
    : 0;

  // 🔍 Buscar productos al escribir o al abrir el dropdown
  useEffect(() => {
    if (activeRow === null) { setSearchResults([]); return; }

    const delay = setTimeout(async () => {
      const term = hasTyped && searchTerm.trim().length >= 2 ? searchTerm.trim() : "";
      try {
        setLoading(true);
        setNoResults(false);
        const res = await getProducts(1, 50, term);
        const results = res.results || [];
        setSearchResults(results);
        setNoResults(hasTyped && searchTerm.trim().length >= 2 && results.length === 0);
      } catch (err) {
        console.error("Error al buscar productos:", err);
        setNoResults(hasTyped);
      } finally {
        setLoading(false);
      }
    }, hasTyped ? 350 : 0);

    return () => clearTimeout(delay);
  }, [searchTerm, activeRow, hasTyped]);

  // Actualiza solo el stock por almacén cuando cambia el almacén para cualquier tipo de movimiento
  useEffect(() => {
    if (!warehouse_id) return;

    async function updateStocks() {
      const updated = await Promise.all(details.map(async (row) => {
        if (!row.product_id) return row;

        const qty = await getStockByProductAndWarehouse(row.product_id, warehouse_id);
        return {
          ...row,
          warehouse_stock: qty,
        };
      }));

      setDetails(updated);
    }

    updateStocks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warehouse_id]);

  const updateRow = (index, patch) => {
    setDetails((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row,
      ),
    );
  };

  const handleChange = (index, field, value) => {
    updateRow(index, { [field]: value });
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

  const handleSelectProduct = async (index, product) => {
    const stockTotal = product.stock_total || 0;
    let warehouseStock = stockTotal;

    if (product.id && warehouse_id) {
      warehouseStock = await getStockByProductAndWarehouse(product.id, warehouse_id);
    }

    updateRow(index, {
      product_id: product.id,
      sku: product.sku || "",
      product_name: product.name,
      unit: product.unit,
      unit_price: parseFloat(
        type_movement === "ENTRY"
          ? product.price_purchase
          : product.price_sale || 0,
      ),
      price_purchase: product.price_purchase || 0,
      stock_total: stockTotal,
      warehouse_stock: warehouseStock,
      ...(isAdjustment ? { physical_quantity: warehouseStock } : {}),
    });

    setSearchResults([]);
    setSearchTerm("");
    setHasTyped(false);
    setActiveRow(null);
  };

  return (
    <div className="border rounded-md p-3 space-y-3 relative">
      {importWarnings.length > 0 && (
        <div className="border rounded-md p-3 text-sm">
          <div className="flex items-start gap-2">
            <TriangleAlert className="h-4 w-4 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium">
                Algunos códigos no existen y no fueron importados ({importWarnings.length}).
              </p>
              <p className="text-xs break-all">
                {importWarnings.slice(0, 30).join(", ")}
                {importWarnings.length > 30 ? ` ... y ${importWarnings.length - 30} más` : ""}
              </p>
            </div>
          </div>
        </div>
      )}

      {isImporting && (
        <div className="border rounded-md p-3 text-xs space-y-2">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>
              Importando Excel... {importProgress.processed}/{importProgress.total || 0} filas ({importPercent}%)
            </span>
          </div>
          <div className="h-2 w-full rounded bg-gray-200 overflow-hidden">
            <div
              className="h-2 bg-green-600 transition-all"
              style={{ width: `${importPercent}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex justify-end mb-2 gap-2">
        <button
          type="button"
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs"
          onClick={handleDownloadTemplate}
        >
          Descargar modelo Excel
        </button>
        <label className={`inline-flex items-center gap-2 ${isImporting ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}>
          <span className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-xs inline-flex items-center gap-1">
            {isImporting && <Loader2 className="h-3 w-3 animate-spin" />}
            {isImporting ? "Importando..." : "Importar Excel"}
          </span>
          <input
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleImportExcel}
            disabled={isImporting}
          />
        </label>
      </div>
      <h3 className="font-semibold">Detalle del Movimiento</h3>

      {/* Encabezados */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-12 gap-2 text-sm font-medium border-b pb-1 mb-0">
        <div className="col-span-1 text-center">#</div>
        <div className="col-span-5">Producto</div>
        <div className="col-span-2 md:col-span-1">Unidad</div>
        {isAdjustment ? (
          <div className="col-span-2">Cantidad Física</div>
        ) : (
          <>
            <div className="col-span-2 md:col-span-1">Cantidad</div>
            <div className="col-span-2 md:col-span-1">Precio Unit.</div>
            <div className="col-span-2 text-right">Subtotal</div>
          </>
        )}

        <div className="col-span-1 text-right"></div>
      </div>

      {details.map((row, i) => {
        const subtotal = (row.quantity || 0) * (row.unit_price || 0);

        return (
          <div
            key={i}
            className="grid grid-cols-5 md:grid-cols-12 gap-2 items-center border-b py-2 relative mb-0"
          >
            {/* Nº Ítem */}
            <div className="text-center font-semibold">{i + 1}</div>
            <div className="col-span-5">
              <ProductSearchInput
                isActive={activeRow === i}
                displayValue={
                  row.sku ? `${row.sku} ${row.product_name}` : row.product_name || ""
                }
                searchTerm={searchTerm}
                hasTyped={hasTyped}
                searchResults={searchResults}
                searchLoading={loading}
                noResults={noResults}
                pinnedResult={
                  row.product_id
                    ? {
                        id: row.product_id,
                        name: row.product_name,
                        sku: row.sku,
                        stock_total: row.stock_total,
                        price_sale: row.unit_price,
                        price_purchase: row.price_purchase,
                        unit: row.unit,
                        category: "",
                      }
                    : null
                }
                priceField={type_movement === "ENTRY" ? "purchase" : "sale"}
                titleAttr={
                  row.product_id
                    ? `${row.sku} - ${row.product_name} — Stock: ${row.warehouse_stock ?? row.stock_total ?? 0}`
                    : ""
                }
                onFocus={() => {
                  setActiveRow(i);
                  setSearchTerm("");
                  setHasTyped(false);
                }}
                onChange={(val) => {
                  setSearchTerm(val);
                  setActiveRow(i);
                  setHasTyped(true);
                }}
                onClearProduct={() => {
                  updateRow(i, {
                    product_id: "",
                    sku: "",
                    product_name: "",
                    stock_total: 0,
                    warehouse_stock: 0,
                  });
                }}
                onSelect={(p) => handleSelectProduct(i, p)}
              />
            </div>

            <div className="col-span-2 md:col-span-1">
              <Input
                value={row.unit || ""}
                readOnly
                className="!text-xs h-8 px-2 bg-gray-100"
              />
            </div>

            {isAdjustment ? (
              <div className="col-span-1 md:col-span-2 space-y-1">
                <Input
                  className="h-8 px-2 border-blue-500"
                  type="number"
                  value={
                    row.physical_quantity === undefined ||
                    row.physical_quantity === null
                      ? ""
                      : row.physical_quantity
                  }
                  min="0"
                  placeholder="Stock físico"
                  onChange={(e) =>
                    handleChange(
                      i,
                      "physical_quantity",
                      parseFloat(e.target.value),
                    )
                  }
                />
              </div>
            ) : (
              <>
                <div className="col-span-2 md:col-span-1">
                  <Input
                    className="h-8 px-2"
                    type="number"
                    value={
                      row.quantity === undefined || row.quantity === null
                        ? ""
                        : row.quantity
                    }
                    min="1"
                    onChange={(e) =>
                      handleChange(i, "quantity", parseFloat(e.target.value))
                    }
                  />
                  <div className="flex justify-center">
                    <span className="inline-flex items-center rounded bg-blue-50 px-1 text-[9px] text-blue-600 border border-blue-200 leading-4">
                      Stock Alm: {Number(row.warehouse_stock ?? row.stock_total ?? 0)}
                    </span>
                  </div>
                </div>

                <div className="col-span-2 md:col-span-1">
                  <Input
                    className="h-8 px-2"
                    type="number"
                    value={
                      row.unit_price === undefined || row.unit_price === null
                        ? ""
                        : row.unit_price
                    }
                    min="0"
                    step="any"
                    onChange={(e) =>
                      handleChange(i, "unit_price", parseFloat(e.target.value))
                    }
                  />
                </div>

                <div className="col-span-2 pr-2 text-right">
                  <span className="text-gray-700">
                    S/ {subtotal.toFixed(2)}
                  </span>
                </div>
              </>
            )}

            <div className="col-span-1 text-right">
              <Button
                variant="destructive"
                size="sm"
                type="button"
                onClick={() => removeRow(i)}
                className="cursor-pointer"
              >
                ✕
              </Button>
            </div>
          </div>
        );
      })}

      <Button type="button" onClick={addRow} className="mt-2 cursor-pointer">
        + Agregar producto
      </Button>
    </div>
  );
}
