"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  Search,
  RefreshCw,
  AlignJustify,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getPartnerCustomers } from "@/services/partnersService";

const DOCUMENT_TYPE_LABELS = {
  "6": "RUC",
  "1": "DNI",
  "4": "C.E.",
  "7": "Pasaporte",
  "0": "Otro",
};

const PAGE_SIZE = 20;

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPartnerCustomers({
        search,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      });
      setCustomers(data?.items || []);
      setTotal(data?.total || 0);
    } catch (err) {
      toast.error("Error al cargar clientes: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    const timer = setTimeout(fetchCustomers, search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [fetchCustomers, search]);

  // Reset to page 1 on search change
  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Users size={16} />
            <span>Socios de Negocio</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchCustomers}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 transition"
            title="Recargar"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <Link
            href="/admin/partners/customers/new"
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition text-sm font-medium"
          >
            <Plus size={15} />
            Crear nuevo cliente
          </Link>
        </div>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-3 bg-white border rounded-lg px-3 py-2 shadow-sm max-w-lg">
        <Search size={16} className="text-gray-400 shrink-0" />
        <input
          type="text"
          className="flex-1 text-sm focus:outline-none"
          placeholder="Buscar por RUC, nombre, teléfono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600 text-xs">
            ✕
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Fecha</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">R.U.C. / Doc.</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Nro. Documento</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Teléfono</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Razón Social / Nombre</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Dirección fiscal</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Estado</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">OP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                    {search ? `Sin resultados para "${search}"` : "No hay clientes registrados"}
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => router.push(`/admin/partners/customers/${c.id}`)}
                  >
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString("es-PE") : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-gray-700">
                      {DOCUMENT_TYPE_LABELS[c.document_type] || c.document_type}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                      {c.document_number}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {c.phone || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      {c.legal_name}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">
                      {c.address || "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          c.active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {c.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <Link
                        href={`/admin/partners/customers/${c.id}`}
                        className="inline-flex items-center p-1 text-gray-400 hover:text-gray-600"
                        title="Ver / Editar"
                      >
                        <AlignJustify size={16} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && total > 0 && (
          <div className="px-4 py-3 border-t flex items-center justify-between text-sm text-gray-500">
            <span>
              Página {page} de {totalPages} · {total} clientes
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Primera página"
              >
                «
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page >= totalPages}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Última página"
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
