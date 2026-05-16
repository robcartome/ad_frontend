"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  Search,
  RefreshCw,
  Eye,
  Pencil,
  FileDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Menu,
} from "lucide-react";
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
  getDocumentPdfPreferences,
  getQuotations,
  openQuotationPdfInNewTab,
  sendQuotation,
  approveQuotation,
  rejectQuotation,
  cancelQuotation,
  newVersionQuotation,
} from "@/services/salesService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STATUS_STYLES = {
  DRAFT: "bg-gray-100 text-gray-600",
  SENT: "bg-blue-100 text-blue-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  ORDERED: "bg-purple-100 text-purple-700",
  CANCELLED: "bg-red-100 text-red-600",
  EXPIRED: "bg-orange-100 text-orange-700",
};

const STATUS_LABELS = {
  DRAFT: "Borrador",
  SENT: "Enviada",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
  ORDERED: "Pedido",
  CANCELLED: "Cancelada",
  EXPIRED: "Vencida",
};

export default function QuotationsPage() {
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [pdfFormat, setPdfFormat] = useState("a4");
  const [pdfFormats, setPdfFormats] = useState(["a4", "ticket"]);
  const [actioningId, setActioningId] = useState(null);
  const LIMIT = 20;

  function getFormatLabel(format) {
    if (format === "a4") return "PDF A4";
    if (format === "ticket") return "PDF Ticket";
    return `PDF ${String(format).toUpperCase()}`;
  }

  useEffect(() => {
    let active = true;

    async function loadPdfPreference() {
      try {
        const prefs = await getDocumentPdfPreferences();
        if (active && prefs?.default_pdf_format) {
          setPdfFormat(prefs.default_pdf_format);
        }
        if (active && Array.isArray(prefs?.available_formats) && prefs.available_formats.length > 0) {
          setPdfFormats(prefs.available_formats);
        }
      } catch {
        if (active) {
          setPdfFormat("a4");
          setPdfFormats(["a4", "ticket"]);
        }
      }
    }

    loadPdfPreference();
    return () => {
      active = false;
    };
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getQuotations({
        limit: LIMIT,
        offset: (page - 1) * LIMIT,
        status: statusFilter || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        search: search || undefined,
      });
      setRows(data?.items || []);
      setTotal(data?.total || 0);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, dateFrom, dateTo, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.ceil(total / LIMIT);

  async function handleWorkflowAction(quotationId, action) {
    setActioningId(quotationId);
    try {
      if (action === "send") await sendQuotation(quotationId);
      else if (action === "approve") await approveQuotation(quotationId);
      else if (action === "reject") await rejectQuotation(quotationId);
      else if (action === "cancel") await cancelQuotation(quotationId);
      else if (action === "new-version") await newVersionQuotation(quotationId);

      const labels = {
        send: "Cotización enviada",
        approve: "Cotización aprobada",
        reject: "Cotización rechazada",
        cancel: "Cotización cancelada",
        "new-version": "Nueva versión creada",
      };
      toast.success(labels[action] || "Acción realizada");
      await fetchData();
    } catch (err) {
      toast.error(err.message || "No se pudo ejecutar la acción");
    } finally {
      setActioningId(null);
    }
  }

  return (
    <div className="p-2 md:p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-semibold">Cotizaciones</h1>
        <Link href="/admin/sales/quotations/new">
          <Button className="gap-1" size="sm">
            <Plus size={15} />
            Nueva Cotización
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 items-end">
        <div className="relative">
          <Search size={15} className="absolute left-2.5 top-2.5 text-gray-400" />
          <Input
            className="pl-8 w-52"
            placeholder="Buscar cliente..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === "ALL" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type="date" className="w-36 text-sm" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} />
        <Input type="date" className="w-36 text-sm" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} />
        <Select value={pdfFormat} onValueChange={setPdfFormat}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Formato PDF" />
          </SelectTrigger>
          <SelectContent>
            {pdfFormats.map((format) => (
              <SelectItem key={format} value={format}>{getFormatLabel(format)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" variant="ghost" onClick={fetchData}>
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-3 py-3 text-left">Fecha</th>
              <th className="px-3 py-3 text-left">Tipo de comprobante</th>
              <th className="px-3 py-3 text-left">Serie</th>
              <th className="px-3 py-3 text-left">Número</th>
              <th className="px-3 py-3 text-left">Cliente</th>
              <th className="px-3 py-3 text-center">Moneda</th>
              <th className="px-3 py-3 text-right">Total</th>
              <th className="px-3 py-3 text-center">Valida hasta</th>
              <th className="px-3 py-3 text-center">Estado</th>
              <th className="px-3 py-3 text-center">OP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={10} className="text-center py-8 text-gray-400">
                  <RefreshCw size={18} className="inline animate-spin mr-2 text-primary" />
                  Cargando...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-10 text-gray-400">
                  <FileText size={32} className="mx-auto mb-2 text-gray-200" />
                  No hay cotizaciones
                </td>
              </tr>
            ) : (
              rows.map((q) => (
                <tr
                  key={q.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/admin/sales/quotations/${q.id}`)}
                >
                  <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">
                    {q.issue_date
                      ? new Date(q.issue_date + "T00:00:00").toLocaleDateString("es-PE")
                      : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-gray-600">
                    Cotización
                  </td>
                  <td className="px-3 py-2.5 text-gray-600 text-xs font-mono">
                    {q.series || ""}
                  </td>
                  <td className="px-3 py-2.5 text-gray-600 text-xs font-mono">
                    {q.number != null ? String(q.number) : ""}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="font-medium text-gray-800">{q.customer_legal_name}</div>
                    <div className="text-xs text-gray-400">{q.customer_document_number}</div>
                  </td>
                  <td className="px-3 py-2.5 text-center">{q.currency}</td>
                  <td className="px-3 py-2.5 text-right font-medium tabular-nums">
                    {q.currency === "USD" ? "$ " : "S/ "}
                    {parseFloat(q.total || 0).toFixed(2)}
                  </td>
                  <td className="px-3 py-2.5 text-center text-xs text-gray-500">
                    {q.valid_until
                      ? new Date(q.valid_until + "T00:00:00").toLocaleDateString("es-PE")
                      : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[q.status] || "bg-gray-100 text-gray-600"}`}>
                      {STATUS_LABELS[q.status] || q.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-500 disabled:opacity-50"
                          title="Opciones"
                          disabled={actioningId === q.id}
                        >
                          <Menu size={16} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuItem onClick={() => router.push(`/admin/sales/quotations/${q.id}`)}>
                          <Eye size={14} /> Ver
                        </DropdownMenuItem>
                        {q.status === "DRAFT" && (
                          <DropdownMenuItem onClick={() => router.push(`/admin/sales/quotations/${q.id}?mode=edit`)}>
                            <Pencil size={14} /> Editar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={async () => {
                            try {
                              await openQuotationPdfInNewTab(q.id, pdfFormat);
                            } catch (err) {
                              toast.error(err.message || "No se pudo abrir el PDF");
                            }
                          }}
                        >
                          <FileDown size={14} /> PDF ({pdfFormat.toUpperCase()})
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />

                        {q.status === "DRAFT" && (
                          <DropdownMenuItem onClick={() => handleWorkflowAction(q.id, "send")}>Enviar cotización</DropdownMenuItem>
                        )}
                        {q.status === "SENT" && (
                          <>
                            <DropdownMenuItem onClick={() => handleWorkflowAction(q.id, "approve")}>Aprobar</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleWorkflowAction(q.id, "reject")}>Rechazar</DropdownMenuItem>
                          </>
                        )}
                        {!["CANCELLED", "ORDERED"].includes(q.status) && (
                          <DropdownMenuItem onClick={() => handleWorkflowAction(q.id, "cancel")}>Cancelar</DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleWorkflowAction(q.id, "new-version")}>Nueva versión</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Página {page} de {totalPages} — {total} registros</span>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft size={15} />
            </Button>
            <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight size={15} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
