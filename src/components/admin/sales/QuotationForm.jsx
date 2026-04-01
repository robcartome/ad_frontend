"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Trash2,
  Save,
  Send,
  CheckCircle2,
  XCircle,
  Ban,
  GitBranch,
  ShoppingCart,
  Loader2,
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import {
  getSalesCustomers,
  createQuotation,
  sendQuotation,
  approveQuotation,
  rejectQuotation,
  cancelQuotation,
  newVersionQuotation,
  createSaleOrderFromQuotation,
} from "@/services/salesService";
import QuotationDetailTable, { calcLine, newLine } from "./QuotationDetailTable";

const CURRENCIES = [
  { value: "PEN", label: "Soles [S/]" },
  { value: "USD", label: "Dólares [USD]" },
];

// Totals from lines
function calcTotals(lines) {
  let subtotal = 0;
  let igvTotal = 0;
  let totalDiscount = 0;
  let gravada = 0;
  let exonerada = 0;
  let inafecta = 0;
  let gratuita = 0;
  let exportacion = 0;

  for (const line of lines) {
    const c = calcLine(line);
    const qty = parseFloat(line.quantity) || 0;
    const unitPrice = parseFloat(line.unit_price) || 0;
    const discount = parseFloat(line.discount_amount) || 0;
    const base = qty * unitPrice - discount;

    subtotal += c.subtotal;
    igvTotal += c.igvAmount;
    totalDiscount += discount;

    if (line.tax_type === "GRAVADO") gravada += base;
    else if (line.tax_type === "EXONERADO") exonerada += base;
    else if (line.tax_type === "INAFECTO") inafecta += base;
    else if (line.tax_type === "GRATUITO") gratuita += base;
    else if (line.tax_type === "EXPORTACION") exportacion += base;
  }

  return {
    subtotal,
    igvTotal,
    totalDiscount,
    total: subtotal + igvTotal,
    gravada,
    exonerada,
    inafecta,
    gratuita,
    exportacion,
  };
}

export default function QuotationForm({ initialData = null, mode = "create" }) {
  const router = useRouter();
  const isView = mode === "view";

  // Header state
  const [customerId, setCustomerId] = useState(initialData?.customer_id || "");
  const [customerName, setCustomerName] = useState(
    initialData?.customer_legal_name || ""
  );
  const [customerSearch, setCustomerSearch] = useState("");
  const [allCustomers, setAllCustomers] = useState([]);
  const [showCustomerDrop, setShowCustomerDrop] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  const [issueDate, setIssueDate] = useState(
    initialData?.issue_date || new Date().toISOString().slice(0, 10)
  );
  const [validUntil, setValidUntil] = useState(initialData?.valid_until || "");
  const [currency, setCurrency] = useState(initialData?.currency || "PEN");
  const [exchangeRate, setExchangeRate] = useState(
    initialData?.exchange_rate?.toString() || "1.00"
  );
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [internalRef, setInternalRef] = useState(
    initialData?.internal_reference || ""
  );

  // Lines state
  const [lines, setLines] = useState(() => {
    if (initialData?.lines?.length) {
      return initialData.lines.map((l) => ({
        _id: Math.random().toString(36).slice(2),
        product_id: l.product_id || "",
        product_name: l.description || "",
        description: l.description || "",
        unit_code: l.unit_code || "NIU",
        quantity: l.quantity?.toString() || "1",
        unit_price: l.unit_price?.toString() || "0.00",
        discount_amount: l.discount_amount?.toString() || "0.00",
        tax_type: l.tax_type || "GRAVADO",
        igv_rate: l.igv_rate?.toString() || "18.00",
        sunat_product_code: l.sunat_product_code || "",
        product_code: l.product_code || "",
      }));
    }
    return [newLine()];
  });

  const [saving, setSaving] = useState(false);
  const [actioning, setActioning] = useState(false);

  // Load first 50 customers on mount
  useEffect(() => {
    async function loadCustomers() {
      setLoadingCustomers(true);
      try {
        const data = await getSalesCustomers({ limit: 50 });
        setAllCustomers(data?.items || []);
      } catch {
        setAllCustomers([]);
      } finally {
        setLoadingCustomers(false);
      }
    }
    loadCustomers();
  }, []);

  // Filter customers from loaded list; if search term, also call API
  const filteredCustomers = customerSearch.length >= 1
    ? allCustomers.filter(
        (c) =>
          c.legal_name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
          c.document_number?.includes(customerSearch)
      )
    : allCustomers;

  function selectCustomer(c) {
    setCustomerId(c.id);
    setCustomerName(c.legal_name);
    setCustomerSearch("");
    setShowCustomerDrop(false);
  }

  const totals = useMemo(() => calcTotals(lines), [lines]);

  function buildPayload() {
    return {
      customer_id: customerId,
      issue_date: issueDate,
      valid_until: validUntil || null,
      currency,
      exchange_rate: parseFloat(exchangeRate) || 1,
      notes: notes || null,
      internal_reference: internalRef || null,
      lines: lines.map((l) => ({
        product_id: l.product_id,
        description: l.description,
        quantity: parseFloat(l.quantity),
        unit_price: parseFloat(l.unit_price),
        unit_code: l.unit_code,
        discount_amount: parseFloat(l.discount_amount) || 0,
        tax_type: l.tax_type,
        igv_rate: parseFloat(l.igv_rate) || 18,
        sunat_product_code: l.sunat_product_code || null,
        product_code: l.product_code || null,
      })),
    };
  }

  async function handleSave() {
    if (!customerId) {
      toast.error("Seleccione un cliente");
      return;
    }
    if (lines.some((l) => !l.product_id)) {
      toast.error("Seleccione un producto en cada línea");
      return;
    }
    setSaving(true);
    try {
      const result = await createQuotation(buildPayload());
      toast.success("Cotización guardada como borrador");
      router.push(`/admin/sales/quotations/${result.id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleAction(action) {
    if (!initialData?.id) return;
    setActioning(true);
    try {
      let result;
      const id = initialData.id;
      if (action === "send") result = await sendQuotation(id);
      else if (action === "approve") result = await approveQuotation(id);
      else if (action === "reject") result = await rejectQuotation(id);
      else if (action === "cancel") result = await cancelQuotation(id);
      else if (action === "new-version")
        result = await newVersionQuotation(id, issueDate);

      const labels = {
        send: "Cotización enviada",
        approve: "Cotización aprobada",
        reject: "Cotización rechazada",
        cancel: "Cotización cancelada",
        "new-version": "Nueva versión creada",
      };
      toast.success(labels[action] || "Acción realizada");

      if (action === "new-version" && result?.id) {
        router.push(`/admin/sales/quotations/${result.id}`);
      } else {
        router.refresh();
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActioning(false);
    }
  }

  async function handleConvertToOrder() {
    if (!initialData?.id) return;
    setActioning(true);
    try {
      const result = await createSaleOrderFromQuotation(initialData.id, {
        document_type_code: "NV",
        issue_date: new Date().toISOString().slice(0, 10),
        payment_term_days: 0,
      });
      toast.success("Cotización convertida a Pedido de Venta");
      router.push(`/admin/sales/orders/${result.id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActioning(false);
    }
  }

  const status = initialData?.status;
  const isDraft = !status || status === "DRAFT";
  const isSent = status === "SENT";
  const isApproved = status === "APPROVED";
  const isReadOnly = isView || ["CANCELLED", "ORDERED", "EXPIRED", "REJECTED"].includes(status);

  const STATUS_BADGE = {
    DRAFT: "bg-gray-100 text-gray-600",
    SENT: "bg-blue-100 text-blue-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    ORDERED: "bg-purple-100 text-purple-700",
    CANCELLED: "bg-red-100 text-red-700",
    EXPIRED: "bg-orange-100 text-orange-700",
  };

  return (
    <Card className="max-w-7xl mx-auto">
      <CardHeader className="bg-blue-500 text-white p-2 border gap-0">
        <CardTitle>
          Ventas / Cotización / {mode === "create" ? "CREAR" : initialData?.code || "VER"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6 space-y-4">
      {/* ── Header bar ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Volver
          </button>
          <h1 className="text-xl font-semibold text-gray-800">
            {mode === "create" ? "Nueva Cotización" : "Cotización"}
            {initialData?.version_number
              ? ` — v${initialData.version_number}`
              : ""}
          </h1>
          {status && (
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${
                STATUS_BADGE[status] || "bg-gray-100 text-gray-600"
              }`}
            >
              {status}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          {mode === "create" && (
            <Button onClick={handleSave} disabled={saving} className="gap-1">
              {saving ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Save size={15} />
              )}
              Guardar Borrador
            </Button>
          )}
          {isDraft && initialData?.id && (
            <Button
              variant="outline"
              onClick={() => handleAction("send")}
              disabled={actioning}
              className="gap-1"
            >
              <Send size={15} />
              Enviar
            </Button>
          )}
          {isSent && (
            <>
              <Button
                onClick={() => handleAction("approve")}
                disabled={actioning}
                className="gap-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 size={15} />
                Aprobar
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAction("reject")}
                disabled={actioning}
                className="gap-1 text-red-600 border-red-300 hover:bg-red-50"
              >
                <XCircle size={15} />
                Rechazar
              </Button>
            </>
          )}
          {isApproved && (
            <Button
              onClick={handleConvertToOrder}
              disabled={actioning}
              className="gap-1 bg-purple-600 hover:bg-purple-700"
            >
              <ShoppingCart size={15} />
              Convertir a Pedido
            </Button>
          )}
          {initialData?.id && !["CANCELLED", "ORDERED", "REJECTED"].includes(status) && (
            <Button
              variant="outline"
              onClick={() => handleAction("new-version")}
              disabled={actioning}
              className="gap-1"
            >
              <GitBranch size={15} />
              Nueva Versión
            </Button>
          )}
          {initialData?.id && !["CANCELLED", "ORDERED"].includes(status) && (
            <Button
              variant="outline"
              onClick={() => handleAction("cancel")}
              disabled={actioning}
              className="gap-1 text-red-600 border-red-200 hover:bg-red-50"
            >
              <Ban size={15} />
              Cancelar
            </Button>
          )}
        </div>
      </div>

      {/* ── Form card ── */}
      <div className="bg-white rounded-lg border shadow-sm">
        {/* Status bar */}
        {initialData?.id && (
          <div className="flex items-center gap-4 px-6 py-2 border-b bg-gray-50 text-xs text-gray-500 flex-wrap">
            {["DRAFT", "SENT", "APPROVED", "ORDERED"].map((s, i, arr) => {
              const stepIdx = arr.indexOf(status);
              const curIdx = i;
              return (
                <div
                  key={s}
                  className={`flex items-center gap-1 ${
                    curIdx <= stepIdx
                      ? "text-primary font-medium"
                      : "text-gray-300"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                      curIdx <= stepIdx
                        ? "border-primary bg-primary text-white"
                        : "border-gray-300"
                    }`}
                  >
                    {i + 1}
                  </span>
                  {s === "DRAFT"
                    ? "Borrador"
                    : s === "SENT"
                    ? "Enviada"
                    : s === "APPROVED"
                    ? "Aprobada"
                    : "Pedido"}
                  {i < arr.length - 1 && (
                    <span className="ml-1 text-gray-200">›</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* ── Row 1: Cliente + dates ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Cliente search */}
            <div className="md:col-span-2 space-y-1 relative">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Cliente *
              </label>
              {isReadOnly ? (
                <div className="px-3 py-2 border rounded-md bg-gray-50 text-sm text-gray-700">
                  {customerName || initialData?.customer_legal_name}
                  <div className="text-xs text-gray-400">
                    {initialData?.customer_document_number}
                  </div>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search
                      size={15}
                      className="absolute left-2.5 top-2.5 text-gray-400"
                    />
                    <Input
                      className="pl-8"
                      placeholder={loadingCustomers ? "Cargando clientes..." : "Buscar por RUC o nombre..."}
                      value={customerId ? customerName : customerSearch}
                      onChange={(e) => {
                        if (customerId) {
                          setCustomerId("");
                          setCustomerName("");
                        }
                        setCustomerSearch(e.target.value);
                        setShowCustomerDrop(true);
                      }}
                      onFocus={() => setShowCustomerDrop(true)}
                      onBlur={() => setTimeout(() => setShowCustomerDrop(false), 200)}
                    />
                  </div>
                  {showCustomerDrop && (
                    <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {loadingCustomers ? (
                        <div className="p-3 text-sm text-gray-400 text-center flex items-center justify-center gap-2">
                          <Loader2 size={14} className="animate-spin" /> Cargando clientes...
                        </div>
                      ) : filteredCustomers.length === 0 ? (
                        <div className="p-3 text-sm text-gray-400 text-center">
                          Sin resultados para &ldquo;{customerSearch}&rdquo;
                        </div>
                      ) : (
                        filteredCustomers.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            className="w-full text-left px-4 py-2.5 hover:bg-gray-50 border-b last:border-b-0"
                            onMouseDown={() => selectCustomer(c)}
                          >
                            <div className="text-sm font-medium">
                              {c.document_number} {c.legal_name}
                            </div>
                            <div className="text-xs text-gray-400">
                              {c.document_type_name || c.document_type}
                            </div>
                          </button>
                        ))
                      )}
                      <button
                        type="button"
                        className="w-full text-left px-4 py-2.5 text-sm text-blue-600 font-medium hover:bg-blue-50 border-t flex items-center gap-1"
                        onMouseDown={() => window.open("/admin/administration/customers", "_blank")}
                      >
                        <Plus size={14} /> Crear nuevo socio de negocio
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Dates */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Fecha Emisión *
                </label>
                <Input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  disabled={isReadOnly}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Válido hasta
                </label>
                <Input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  disabled={isReadOnly}
                />
              </div>
            </div>
          </div>

          {/* ── Row 2: Currency + ref ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Moneda
              </label>
              <Select
                value={currency}
                onValueChange={setCurrency}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Tipo de Cambio
              </label>
              <Input
                type="number"
                step="0.001"
                min="0.001"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
                disabled={isReadOnly || currency === "PEN"}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Referencia / Orden de Compra
              </label>
              <Input
                placeholder="Ref. interna u OC del cliente"
                value={internalRef}
                onChange={(e) => setInternalRef(e.target.value)}
                disabled={isReadOnly}
              />
            </div>
          </div>

          {/* ── Lines table ── */}
          <QuotationDetailTable
            lines={lines}
            setLines={setLines}
            isReadOnly={isReadOnly}
          />

          {/* ── Footer: notes + totals ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Notes */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Información Adicional
              </label>
              <textarea
                className="w-full border rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isReadOnly}
                placeholder="Observaciones, condiciones comerciales..."
              />
            </div>

            {/* Totals */}
            <div className="space-y-1.5 text-sm">
              {[
                { label: "Descuento (-)", value: totals.totalDiscount },
                { label: "Total Exportación", value: totals.exportacion },
                { label: "Total Exonerada", value: totals.exonerada },
                { label: "Total Inafecta", value: totals.inafecta },
                { label: "Total Gravada", value: totals.gravada },
                { label: "Total IGV (18%)", value: totals.igvTotal },
                { label: "Total Gratuita", value: totals.gratuita },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between border-b pb-1">
                  <span className="text-gray-500">{label}</span>
                  <span className="tabular-nums text-gray-700">
                    {currency === "USD" ? "$" : "S/"} {value.toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between pt-1 font-bold text-base border-t-2">
                <span>Total</span>
                <span className="tabular-nums text-primary">
                  {currency === "USD" ? "$" : "S/"}{" "}
                  {totals.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </CardContent>
    </Card>
  );
}
