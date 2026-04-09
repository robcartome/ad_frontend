"use client";

/**
 * CustomerSearchInput
 * Buscador de clientes reutilizable (dropdown con debounce).
 *
 * Props:
 *  value       — objeto cliente seleccionado { id, legal_name, document_number, document_type, address } | null
 *  onChange    — callback(customer | null)  se llama al seleccionar o limpiar
 *  readOnly    — boolean (muestra solo texto, sin interacción)
 *  placeholder — string
 *  className   — clases extra para el wrapper
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Loader2, Plus } from "lucide-react";
import { getSalesCustomers } from "@/services/salesService";

export default function CustomerSearchInput({
  value = null,
  onChange,
  readOnly = false,
  placeholder = "Buscar por RUC o nombre...",
  className = "",
}) {
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState([]);
  const [showDrop, setShowDrop] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropStyle, setDropStyle] = useState({});

  const inputRef = useRef(null);
  const blurTimer = useRef(null);

  // ── Posicionamiento fixed del dropdown ───────────────────────────────────
  const recalc = useCallback(() => {
    if (!inputRef.current) return;
    const r = inputRef.current.getBoundingClientRect();
    setDropStyle({
      position: "fixed",
      top: r.bottom + 2,
      left: r.left,
      width: Math.max(r.width, 320),
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

  // ── Limpiar búsqueda al cerrar ───────────────────────────────────────────
  useEffect(() => {
    if (!showDrop) setSearch("");
  }, [showDrop]);

  // ── Fetch con debounce ───────────────────────────────────────────────────
  const fetchCustomers = useCallback(async (q = "") => {
    setLoading(true);
    try {
      const data = await getSalesCustomers({ search: q.trim(), limit: 20, offset: 0 });
      setOptions(data?.items || []);
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!showDrop) return;
    const t = setTimeout(() => fetchCustomers(search), 300);
    return () => clearTimeout(t);
  }, [search, showDrop, fetchCustomers]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  function handleFocus() {
    clearTimeout(blurTimer.current);
    recalc();
    setShowDrop(true);
  }

  function handleBlur() {
    blurTimer.current = setTimeout(() => setShowDrop(false), 200);
  }

  function handleInputChange(e) {
    if (value) onChange(null); // limpiar selección si empieza a escribir de nuevo
    setSearch(e.target.value);
  }

  function select(customer) {
    onChange(customer);
    setSearch("");
    setOptions([]);
    setShowDrop(false);
  }

  function clear() {
    onChange(null);
    setSearch("");
    setOptions([]);
  }

  // ── Read-only ─────────────────────────────────────────────────────────────
  if (readOnly) {
    return (
      <div className={`px-3 py-2 border rounded-md bg-gray-50 text-sm text-gray-700 ${className}`}>
        <div className="font-medium">{value?.legal_name || "—"}</div>
        {value?.document_number && (
          <div className="text-xs text-gray-400">{value.document_number}</div>
        )}
      </div>
    );
  }

  // ── Editable ──────────────────────────────────────────────────────────────
  return (
    <div className={`relative ${className}`}>
      <Search size={15} className="absolute left-2.5 top-2.5 text-gray-400 pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        autoComplete="off"
        placeholder={value ? value.legal_name : placeholder}
        value={value ? value.legal_name : search}
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
        <div
          style={dropStyle}
          className="bg-white border rounded-lg shadow-xl max-h-72 overflow-y-auto"
        >
          {loading ? (
            <div className="p-3 text-sm text-gray-400 text-center flex items-center justify-center gap-2">
              <Loader2 size={14} className="animate-spin" /> Cargando...
            </div>
          ) : options.length === 0 ? (
            <div className="p-3 text-sm text-gray-400 text-center">
              {search ? `Sin resultados para "${search}"` : "No hay clientes"}
            </div>
          ) : (
            options.map((c) => (
              <button
                key={c.id}
                type="button"
                className="w-full text-left px-4 py-2.5 hover:bg-blue-50 border-b last:border-b-0"
                onMouseDown={() => select(c)}
              >
                <div className="text-sm font-medium text-gray-800">
                  {c.document_number} — {c.legal_name}
                </div>
                <div className="text-xs text-gray-400">
                  {c.document_type} · {c.address || "Sin dirección"}
                </div>
              </button>
            ))
          )}
          <button
            type="button"
            className="w-full text-left px-4 py-2.5 text-sm text-blue-600 font-medium hover:bg-blue-50 border-t flex items-center gap-1"
            onMouseDown={() => window.open("/admin/partners/customers/new", "_blank")}
          >
            <Plus size={14} /> Crear nuevo socio de negocio
          </button>
        </div>
      )}
    </div>
  );
}
