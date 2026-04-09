"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Loader2, Plus } from "lucide-react";
import { getSuppliers } from "@/services/suppliersService";

export default function SupplierSearchInput({
  value = null,
  onChange,
  readOnly = false,
  placeholder = "Buscar por RUC o proveedor...",
  className = "",
}) {
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState([]);
  const [showDrop, setShowDrop] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropStyle, setDropStyle] = useState({});

  const inputRef = useRef(null);
  const blurTimer = useRef(null);

  const recalc = useCallback(() => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setDropStyle({
      position: "fixed",
      top: rect.bottom + 2,
      left: rect.left,
      width: Math.max(rect.width, 320),
      zIndex: 9999,
    });
  }, []);

  useEffect(() => {
    if (!showDrop) return;
    recalc();
    window.addEventListener("scroll", recalc, true);
    window.addEventListener("resize", recalc);
    return () => {
      window.removeEventListener("scroll", recalc, true);
      window.removeEventListener("resize", recalc);
    };
  }, [showDrop, recalc]);

  useEffect(() => {
    if (!showDrop) setSearch("");
  }, [showDrop]);

  const fetchSuppliers = useCallback(async (query = "") => {
    setLoading(true);
    try {
      const data = await getSuppliers({ search: query.trim(), limit: 20, offset: 0, active: true });
      setOptions(Array.isArray(data) ? data : (data?.items || []));
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!showDrop) return;
    const timer = setTimeout(() => fetchSuppliers(search), 300);
    return () => clearTimeout(timer);
  }, [search, showDrop, fetchSuppliers]);

  function handleFocus() {
    clearTimeout(blurTimer.current);
    recalc();
    setShowDrop(true);
  }

  function handleBlur() {
    blurTimer.current = setTimeout(() => setShowDrop(false), 200);
  }

  function handleInputChange(e) {
    if (value) onChange(null);
    setSearch(e.target.value);
  }

  function select(supplier) {
    onChange(supplier);
    setSearch("");
    setOptions([]);
    setShowDrop(false);
  }

  function clear() {
    onChange(null);
    setSearch("");
    setOptions([]);
  }

  if (readOnly) {
    return (
      <div className={`px-3 py-2 border rounded-md bg-gray-50 text-sm text-gray-700 ${className}`}>
        <div className="font-medium">{value?.name || "—"}</div>
        {value?.document_number && (
          <div className="text-xs text-gray-400">{value.document_number}</div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Search size={15} className="absolute left-2.5 top-2.5 text-gray-400 pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        autoComplete="off"
        placeholder={value ? value.name : placeholder}
        value={value ? value.name : search}
        className="w-full pl-8 pr-8 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      {value && (
        <button
          type="button"
          onClick={clear}
          className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
        >
          <X size={14} />
        </button>
      )}

      {showDrop && (
        <div style={dropStyle} className="bg-white border rounded-lg shadow-xl max-h-72 overflow-y-auto">
          {loading ? (
            <div className="p-3 text-sm text-gray-400 text-center flex items-center justify-center gap-2">
              <Loader2 size={14} className="animate-spin" /> Cargando...
            </div>
          ) : options.length === 0 ? (
            <div className="p-3 text-sm text-gray-400 text-center">
              {search ? `Sin resultados para \"${search}\"` : "No hay proveedores"}
            </div>
          ) : (
            options.map((s) => (
              <button
                key={s.id}
                type="button"
                className="w-full text-left px-4 py-2.5 hover:bg-blue-50 border-b last:border-b-0"
                onMouseDown={() => select(s)}
              >
                <div className="text-sm font-medium text-gray-800">
                  {s.document_number} — {s.name}
                </div>
                <div className="text-xs text-gray-400">
                  {s.contact_name || "Sin contacto"} · {s.address || "Sin dirección"}
                </div>
              </button>
            ))
          )}
          <button
            type="button"
            className="w-full text-left px-4 py-2.5 text-sm text-blue-600 font-medium hover:bg-blue-50 border-t flex items-center gap-1"
            onMouseDown={() => window.open("/admin/partners/suppliers/new", "_blank")}
          >
            <Plus size={14} /> Crear nuevo proveedor
          </button>
        </div>
      )}
    </div>
  );
}
