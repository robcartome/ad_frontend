"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Trash2,
  Plus,
  TriangleAlert,
  AlignJustify,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { getProducts } from "@/services/productsService";
import { importExcelFile, downloadExcelTemplate } from "@/utils/importExcel";
import ProductSearchInput from "@/components/admin/shared/ProductSearchInput";

// Catálogo SUNAT N° 07 — Código de afectación al IGV
const TAX_TYPES = [
  { value: "10", label: "Gravado - Op. Onerosa" },
  { value: "20", label: "Exonerado" },
  { value: "30", label: "Inafecto" },
  { value: "11", label: "Gratuito" },
  { value: "40", label: "Exportación" },
];

export function calcLine(line) {
  const qty      = parseFloat(line.quantity) || 0;
  const unitPrice = parseFloat(line.unit_price) || 0; // precio CON IGV
  const discount  = parseFloat(line.discount_amount) || 0;
  const igvRate   = parseFloat(line.igv_rate) || 18;
  // Valor unitario = precio SIN IGV
  const valorUnit =
    line.tax_type === "10" ? unitPrice / (1 + igvRate / 100) : unitPrice;
  const subtotal  = qty * valorUnit - discount;   // base imponible sin IGV
  const igvAmount =
    line.tax_type === "10" ? (subtotal * igvRate) / 100 : 0;
  return { subtotal, igvAmount, total: subtotal + igvAmount, valorUnit };
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
    tax_type: "10",
    igv_rate: "18.00",
    sunat_product_code: "",
    product_code: "",
    stock_total: 0,
    memo: "",
  };
}

export default function QuotationDetailTable({ lines, setLines, isReadOnly }) {
  const rootRef = useRef(null);

  // ── Búsqueda de productos ────────────────────────────────────────────────
  const [searchResults,  setSearchResults]  = useState([]);
  const [searchLoading,  setSearchLoading]  = useState(false);
  const [activeLineId,   setActiveLineId]   = useState(null);
  const [searchTerm,     setSearchTerm]     = useState("");
  const [hasTyped,       setHasTyped]       = useState(false);
  const [noResults,      setNoResults]      = useState(false);

  // ── Importación Excel ────────────────────────────────────────────────────
  const [isImporting,    setIsImporting]    = useState(false);
  const [importProgress, setImportProgress] = useState({ processed: 0, total: 0 });
  const [importWarnings, setImportWarnings] = useState([]);

  // ── Menú OP y Memo ───────────────────────────────────────────────────────
  const [opMenuLineId,   setOpMenuLineId]   = useState(null);
  const [memoLineId,     setMemoLineId]     = useState(null);

  const importPercent = importProgress.total > 0
    ? Math.round((importProgress.processed / importProgress.total) * 100)
    : 0;

  // ── Fetch productos (50 más recientes o búsqueda) ─────────────────────
  async function fetchProducts(term = "") {
    try {
      setSearchLoading(true);
      setNoResults(false);
      const res     = await getProducts(1, 50, term);
      const results = res.results || [];
      setSearchResults(results);
      setNoResults(term.trim().length >= 2 && results.length === 0);
    } catch {
      setSearchResults([]);
      setNoResults(term.trim().length >= 2);
    } finally {
      setSearchLoading(false);
    }
  }

  // ── Debounce búsqueda ────────────────────────────────────────────────────
  useEffect(() => {
    if (activeLineId === null) { setSearchResults([]); return; }

    const delay = setTimeout(async () => {
      if (hasTyped) {
        // Buscar por término siempre (incluso < 2 chars muestra recientes)
        await fetchProducts(searchTerm.trim().length >= 2 ? searchTerm.trim() : "");
      } else {
        await fetchProducts(""); // Foco inicial → 50 recientes
      }
    }, hasTyped ? 350 : 0);

    return () => clearTimeout(delay);
  }, [searchTerm, activeLineId, hasTyped]);

  // ── Cerrar dropdown / menú OP al click fuera ─────────────────────────────
  useEffect(() => {
    function onOutsideClick(e) {
      if (!rootRef.current?.contains(e.target)) {
        setActiveLineId(null);
        setSearchTerm("");
        setHasTyped(false);
        setOpMenuLineId(null);
      }
    }
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);

  // ── Helpers de líneas ────────────────────────────────────────────────────
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
      if (prev.length === 1) { toast.error("Debe tener al menos 1 línea"); return prev; }
      return prev.filter((l) => l._id !== lineId);
    });
  }

  function selectProduct(lineId, product) {
    setLines((prev) =>
      prev.map((l) =>
        l._id === lineId
          ? {
              ...l,
              product_id:   product.id,
              product_name: product.name,
              product_sku:  product.sku || "",
              description:  product.name,
              product_code: product.sku || product.code || product.barcode || "",
              unit_code:    product.unit || product.unit_code || "NIU",
              unit_price:   parseFloat(product.price_sale || 0).toFixed(2),
              stock_total:  product.stock_total || 0,
            }
          : l
      )
    );
    setSearchResults([]);
    setSearchTerm("");
    setHasTyped(false);
    setActiveLineId(null);
  }

  function getDisplayProduct(line) {
    if (line.product_sku && line.product_name) return `${line.product_sku} ${line.product_name}`;
    return line.product_name || line.description || "";
  }

  // ── Importación Excel ────────────────────────────────────────────────────
  function handleDownloadTemplate() {
    downloadExcelTemplate(["CODIGO", "CANTIDAD"], ["P0001", 1], "modelo_importacion_cotizacion.xlsx");
  }

  const handleImportExcel = async (e) => {
    const input = e.target;
    const file  = input.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportWarnings([]);
    setImportProgress({ processed: 0, total: 0 });

    try {
      const importedRows = await importExcelFile(file, {
        requiredHeaders: ["CODIGO", "CANTIDAD"],
        rowMapper: (headers, row) => {
          const cI = headers.findIndex((h) => h?.toString().toLowerCase().includes("codigo"));
          const qI = headers.findIndex((h) => h?.toString().toLowerCase().includes("cantidad"));
          if (cI === -1 || qI === -1) return null;
          return { code: row[cI]?.toString().trim(), qty: parseFloat(row[qI]) || 1 };
        },
      });

      const normalizedRows = importedRows.filter((r) => r?.code);
      setImportProgress({ processed: 0, total: normalizedRows.length });

      const newDetails  = [];
      const missingCodes = [];

      for (let index = 0; index < normalizedRows.length; index++) {
        const { code, qty } = normalizedRows[index];
        try {
          const res     = await getProducts(1, 50, code);
          const product = (res.results || []).find(
            (p) => (p.sku || "").toLowerCase() === code.toLowerCase()
          );
          if (product) {
            newDetails.push({
              ...newLine(),
              product_id:   product.id,
              product_name: product.name,
              product_sku:  product.sku || "",
              description:  product.name,
              product_code: product.sku || product.code || product.barcode || "",
              unit_code:    product.unit || product.unit_code || "NIU",
              quantity:     String(qty),
              unit_price:   parseFloat(product.price_sale || 0).toFixed(2),
              stock_total:  product.stock_total || 0,
            });
          } else {
            missingCodes.push(code);
          }
        } catch {
          missingCodes.push(code);
        } finally {
          setImportProgress({ processed: index + 1, total: normalizedRows.length });
        }
      }

      if (missingCodes.length > 0) setImportWarnings([...new Set(missingCodes)]);
      if (newDetails.length === 0) { toast.error("No se encontraron productos válidos."); return; }

      setLines(newDetails);
      toast.success(`Se importaron ${newDetails.length} producto(s) correctamente.`);
    } catch (err) {
      toast.error(err.message || "Error al importar Excel");
    } finally {
      setIsImporting(false);
      input.value = "";
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div ref={rootRef} className="border rounded-md p-3 space-y-3 relative overflow-visible">

      {/* Warnings importación */}
      {importWarnings.length > 0 && (
        <div className="border rounded-md p-3 text-sm">
          <div className="flex items-start gap-2">
            <TriangleAlert className="h-4 w-4 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="font-medium">
                Algunos códigos no existen y no fueron importados ({importWarnings.length}).
              </p>
              <p className="text-xs break-all text-gray-600">
                {importWarnings.slice(0, 30).join(", ")}
                {importWarnings.length > 30 ? ` … y ${importWarnings.length - 30} más` : ""}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progreso importación */}
      {isImporting && (
        <div className="border rounded-md p-3 text-xs space-y-2">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>
              Importando Excel… {importProgress.processed}/{importProgress.total || 0} ({importPercent}%)
            </span>
          </div>
          <div className="h-2 w-full rounded bg-gray-200 overflow-hidden">
            <div className="h-2 bg-green-600 transition-all" style={{ width: `${importPercent}%` }} />
          </div>
        </div>
      )}

      {!isReadOnly && (
        <div className="flex justify-end gap-2">
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
              {isImporting ? "Importando…" : "Importar Excel"}
            </span>
            <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImportExcel} disabled={isImporting} />
          </label>
        </div>
      )}

      <h2 className="text-sm font-semibold text-gray-700">Detalle del Comprobante</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse min-w-[860px]">
          <thead>
            <tr className="border-b text-gray-500 text-[11px] uppercase">
              <th className="py-1.5 px-1 text-center w-6">#</th>
              <th className="py-1.5 px-2 text-left">Bien o Servicio</th>
              <th className="py-1.5 px-1 text-center w-12">UND.</th>
              <th className="py-1.5 px-1 text-center w-[72px]">Cantidad</th>
              <th className="py-1.5 px-1 text-left w-[115px]">Tipo IGV</th>
              <th className="py-1.5 px-1 text-right w-[62px]">V. Unit.</th>
              <th className="py-1.5 px-1 text-right w-[72px]">P. Unit.</th>
              <th className="py-1.5 px-1 text-right w-[64px]">SubTotal</th>
              <th className="py-1.5 px-1 text-right w-[58px]">Impuesto</th>
              <th className="py-1.5 px-1 text-right w-[64px]">Total</th>
              <th className="py-1.5 px-1 text-center w-8">OP</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, idx) => {
              const c = calcLine(line);
              const pinnedResult = line.product_id
                ? {
                    id:           line.product_id,
                    name:         line.product_name,
                    sku:          line.product_sku,
                    stock_total:  line.stock_total,
                    price_sale:   parseFloat(line.unit_price),
                    price_purchase: parseFloat(line.unit_price),
                    unit:         line.unit_code,
                    category:     "",
                  }
                : null;

              return (
                <tr key={line._id} className="border-b align-top hover:bg-gray-50">

                  <td className="py-1.5 px-1 text-center text-gray-400 pt-2">{idx + 1}</td>
                  <td className="py-1.5 px-2 relative">
                    {isReadOnly ? (
                      <div>
                        <span className="text-sm">{line.description}</span>
                        {line.memo && (
                          <p className="text-[10px] text-gray-400 mt-0.5 italic">{line.memo}</p>
                        )}
                      </div>
                    ) : (
                      <>
                        <ProductSearchInput
                          isActive={activeLineId === line._id}
                          displayValue={getDisplayProduct(line)}
                          searchTerm={searchTerm}
                          hasTyped={hasTyped}
                          searchResults={searchResults}
                          searchLoading={searchLoading}
                          noResults={noResults}
                          pinnedResult={pinnedResult}
                          priceField="sale"
                          useFixed={true}
                          titleAttr={
                            line.product_id
                              ? `${line.product_sku || ""} - ${line.product_name} — Stock: ${line.stock_total ?? 0}`
                              : ""
                          }
                          onFocus={() => {
                            setActiveLineId(line._id);
                            setSearchTerm("");
                            setHasTyped(false);
                            setOpMenuLineId(null);
                          }}
                          onChange={(val) => {
                            setSearchTerm(val);
                            setActiveLineId(line._id);
                            setHasTyped(true);
                          }}
                          onClearProduct={() => {
                            setLines((prev) =>
                              prev.map((item) =>
                                item._id === line._id
                                  ? {
                                      ...item,
                                      product_id: "",
                                      product_name: "",
                                      product_sku: "",
                                      description: "",
                                      product_code: "",
                                      stock_total: 0,
                                      unit_price: "0.00",
                                    }
                                  : item
                              )
                            );
                          }}
                          onSelect={(p) => selectProduct(line._id, p)}
                        />
                        {/* Memo preview si tiene texto */}
                        {line.memo && (
                          <p className="text-[10px] text-gray-400 mt-0.5 italic truncate max-w-xs">
                            {line.memo}
                          </p>
                        )}
                      </>
                    )}
                  </td>

                  {/* UND. */}
                  <td className="py-1.5 px-1">
                    <Input
                      className="text-xs h-7 text-center px-1"
                      value={line.unit_code}
                      onChange={(e) => updateLine(line._id, "unit_code", e.target.value)}
                      disabled={isReadOnly}
                    />
                  </td>

                  {/* Cantidad */}
                  <td className="py-1.5 px-1">
                    <Input
                      type="number"
                      className="text-xs h-7 text-center px-1"
                      min="1"
                      step="1"
                      value={line.quantity}
                      onChange={(e) => updateLine(line._id, "quantity", e.target.value)}
                      disabled={isReadOnly}
                    />
                    <div className="flex justify-center">
                      <span className="inline-flex items-center rounded bg-blue-50 px-1 text-[9px] font-medium text-blue-600 border border-blue-200 leading-4">
                        Stock: {Number(line.stock_total ?? 0)}
                      </span>
                    </div>
                  </td>

                  <td className="py-1.5 px-1">
                    <Select
                      value={line.tax_type}
                      onValueChange={(v) => updateLine(line._id, "tax_type", v)}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger className="h-7 text-[10px] px-1.5">
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

                  {/* Valor unit. (sin IGV) */}
                  <td className="py-1.5 px-1 text-right tabular-nums text-gray-500 pt-2.5">
                    {c.valorUnit.toFixed(3)}
                  </td>

                  {/* Precio unit. (con IGV) — editable */}
                  <td className="py-1.5 px-1">
                    <Input
                      type="number"
                      className="text-xs h-7 text-right tabular-nums px-1"
                      min="0"
                      step="0.01"
                      value={line.unit_price}
                      onChange={(e) => updateLine(line._id, "unit_price", e.target.value)}
                      disabled={isReadOnly}
                    />
                  </td>

                  {/* SubTotal (base sin IGV) */}
                  <td className="py-1.5 px-1 text-right tabular-nums text-gray-700 pt-2.5">
                    {c.subtotal.toFixed(2)}
                  </td>

                  {/* Impuesto */}
                  <td className="py-1.5 px-1 text-right tabular-nums text-gray-500 pt-2.5">
                    {c.igvAmount.toFixed(2)}
                  </td>

                  {/* Total (con IGV) */}
                  <td className="py-1.5 px-1 text-right tabular-nums font-semibold pt-2.5">
                    {c.total.toFixed(2)}
                  </td>

                  {/* OP */}
                  <td className="py-1.5 px-1 text-center pt-1.5">
                    {!isReadOnly && (
                      <div className="relative inline-block">
                        <button
                          type="button"
                          className="text-gray-400 hover:text-gray-700 p-0.5 rounded hover:bg-gray-100"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setOpMenuLineId(opMenuLineId === line._id ? null : line._id);
                            setActiveLineId(null);
                          }}
                        >
                          <AlignJustify size={13} />
                        </button>

                        {opMenuLineId === line._id && (
                          <div className="absolute right-0 top-full mt-1 z-[80] bg-white border rounded shadow-lg min-w-[110px] text-xs">
                            <div className="px-2 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wide border-b">
                              OPCIONES
                            </div>
                            <button
                              type="button"
                              className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600 flex items-center gap-1.5"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                removeLine(line._id);
                                setOpMenuLineId(null);
                              }}
                            >
                              <Trash2 size={11} /> Eliminar
                            </button>
                            <button
                              type="button"
                              className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center gap-1.5 text-gray-700"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                setMemoLineId(line._id);
                                setOpMenuLineId(null);
                              }}
                            >
                              <FileText size={11} /> Memo
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Agregar ítem */}
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

      {/* ── Modal Memo ──────────────────────────────────────────────────── */}
      {memoLineId && (
        <div
          className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center"
          onMouseDown={() => setMemoLineId(null)}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-sm mb-1">
              Memo{" "}
              <span className="text-gray-400 font-normal text-xs">
                (No se informa a SUNAT)
              </span>
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              {lines.find((l) => l._id === memoLineId)?.description || ""}
            </p>
            <textarea
              className="w-full border rounded-md p-2 text-sm resize-y focus:outline-none focus:ring-1 focus:ring-blue-400 min-h-[90px]"
              placeholder="Información adicional del bien o servicio"
              value={lines.find((l) => l._id === memoLineId)?.memo || ""}
              onChange={(e) => updateLine(memoLineId, "memo", e.target.value)}
              autoFocus
            />
            <div className="flex justify-end mt-3">
              <Button size="sm" onClick={() => setMemoLineId(null)}>
                Aceptar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
