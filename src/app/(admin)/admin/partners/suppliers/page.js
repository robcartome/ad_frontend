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
  Truck,
} from "lucide-react";
import { getPartnerSuppliers } from "@/services/partnersService";

export default function SuppliersPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPartnerSuppliers();
      setSuppliers(data || []);
    } catch (err) {
      toast.error("Error al cargar proveedores: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const filtered = search
    ? suppliers.filter(
        (s) =>
          s.name?.toLowerCase().includes(search.toLowerCase()) ||
          s.document_number?.includes(search)
      )
    : suppliers;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Truck size={16} />
            <span>Socios de Negocio</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Proveedores</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchSuppliers}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 transition"
            title="Recargar"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <Link
            href="/admin/partners/suppliers/new"
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition text-sm font-medium"
          >
            <Plus size={15} />
            Crear proveedor
          </Link>
        </div>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-3 bg-white border rounded-lg px-3 py-2 shadow-sm max-w-lg">
        <Search size={16} className="text-gray-400 shrink-0" />
        <input
          type="text"
          className="flex-1 text-sm focus:outline-none"
          placeholder="Buscar por nombre, documento..."
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
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Documento</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Nombre / Razón Social</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Contacto</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Teléfono</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">OP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                    {search ? `Sin resultados para "${search}"` : "No hay proveedores registrados"}
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => router.push(`/admin/partners/suppliers/${s.id}`)}
                  >
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                      {s.document_number || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      {s.name}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {s.contact_name || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {s.phone || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {s.email || "—"}
                    </td>
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <Link
                        href={`/admin/partners/suppliers/${s.id}`}
                        className="inline-flex items-center p-1 text-gray-400 hover:text-gray-600"
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
      </div>
    </div>
  );
}
