"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Save,
  Loader2,
  Users,
  ChevronRight,
  Search,
  UserCheck,
  X,
} from "lucide-react";
import {
  createPartnerCustomer,
  updatePartnerCustomer,
} from "@/services/partnersService";

const DOCUMENT_TYPES = [
  { value: "6", label: "RUC - REGISTRO ÚNICO DE CONTRIBUYENTE" },
  { value: "1", label: "DNI - DOCUMENTO NACIONAL DE IDENTIDAD" },
  { value: "4", label: "CE - CARNÉ DE EXTRANJERÍA" },
  { value: "7", label: "PASAPORTE" },
  { value: "0", label: "OTRO" },
];

const TABS = ["General", "Contacto(s)", "Configuración"];

export default function CustomerForm({ initialData = null, mode = "create" }) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("General");

  // Form fields
  const [documentType, setDocumentType] = useState(initialData?.document_type || "6");
  const [documentNumber, setDocumentNumber] = useState(initialData?.document_number || "");
  const [legalName, setLegalName] = useState(initialData?.legal_name || "");
  const [tradeName, setTradeName] = useState(initialData?.trade_name || "");
  const [address, setAddress] = useState(initialData?.address || "");
  const [ubigeo, setUbigeo] = useState(initialData?.ubigeo || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [taxpayerStatus, setTaxpayerStatus] = useState(initialData?.taxpayer_status || "");
  const [taxpayerCondition, setTaxpayerCondition] = useState(initialData?.taxpayer_condition || "");
  const [isRetentionAgent, setIsRetentionAgent] = useState(initialData?.is_retention_agent || false);
  const [paymentTermDays, setPaymentTermDays] = useState(initialData?.payment_term_days?.toString() || "0");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [internalCode, setInternalCode] = useState(initialData?.internal_code || "");
  const [active, setActive] = useState(initialData?.active ?? true);

  // Contacts tab
  const [contacts, setContacts] = useState(initialData?.contacts || []);

  function buildPayload() {
    return {
      document_type: documentType,
      document_number: documentNumber.trim(),
      legal_name: legalName.trim(),
      trade_name: tradeName.trim() || null,
      address: address.trim() || null,
      ubigeo: ubigeo.trim() || null,
      phone: phone.trim() || null,
      email: email.trim() || null,
      taxpayer_status: taxpayerStatus || null,
      taxpayer_condition: taxpayerCondition.trim() || null,
      is_retention_agent: isRetentionAgent,
      payment_term_days: parseInt(paymentTermDays) || 0,
      notes: notes.trim() || null,
      contacts: contacts
        .filter((c) => c.name?.trim())
        .map(({ name, phone, email, position }) => ({ name, phone, email, position })),
    };
  }

  async function handleSave(saveAsInactive = false) {
    if (!documentNumber.trim()) {
      toast.error("El número de documento es obligatorio");
      return;
    }
    if (!legalName.trim()) {
      toast.error("La razón social / nombre es obligatorio");
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayload();
      if (saveAsInactive) payload.active = false;

      let result;
      if (isEdit && initialData?.id) {
        result = await updatePartnerCustomer(initialData.id, payload);
        toast.success("Cliente actualizado correctamente");
      } else {
        result = await createPartnerCustomer(payload);
        toast.success("Cliente creado correctamente");
      }
      router.push(`/admin/partners/customers/${result.id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  function addContact() {
    setContacts([...contacts, { name: "", phone: "", email: "", position: "" }]);
  }

  function removeContact(idx) {
    setContacts(contacts.filter((_, i) => i !== idx));
  }

  function updateContact(idx, field, value) {
    setContacts(contacts.map((c, i) => (i === idx ? { ...c, [field]: value } : c)));
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-gray-500">
        <Users size={15} />
        <span
          className="hover:text-primary cursor-pointer"
          onClick={() => router.push("/admin/partners/customers")}
        >
          Clientes
        </span>
        <ChevronRight size={14} />
        <span className="text-gray-800 font-medium">
          {isEdit ? legalName || "Editar Cliente" : "Crear"}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {/* Active/Inactive badge */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-md p-1">
            <button
              onClick={() => setActive(true)}
              className={`px-3 py-1 rounded text-sm font-medium transition ${active ? "bg-primary text-white shadow" : "text-gray-600 hover:bg-gray-200"}`}
            >
              Activo
            </button>
            <button
              onClick={() => setActive(false)}
              className={`px-3 py-1 rounded text-sm font-medium transition ${!active ? "bg-gray-600 text-white shadow" : "text-gray-600 hover:bg-gray-200"}`}
            >
              Inactivo
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-sm text-gray-600 border rounded-md hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition text-sm font-medium disabled:opacity-60"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Guardar
          </button>
        </div>
      </div>

      {/* Main form card */}
      <div className="bg-white rounded-lg border shadow-sm">
        {/* Top section: document + name */}
        <div className="p-6 border-b">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Document type */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Tipo Documento de Identidad
                <span className="inline-flex items-center ml-1 text-blue-500 cursor-help" title="SUNAT catálogos">?</span>
              </label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
              >
                {DOCUMENT_TYPES.map((dt) => (
                  <option key={dt.value} value={dt.value}>{dt.label}</option>
                ))}
              </select>
            </div>

            {/* Document number */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                {documentType === "6" ? "R.U.C." : "Número de Documento"}
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  maxLength={documentType === "6" ? 11 : documentType === "1" ? 8 : 20}
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value.replace(/\D/g, ""))}
                  placeholder={documentType === "6" ? "00000000000" : documentType === "1" ? "00000000" : ""}
                />
                <button
                  type="button"
                  className="p-2 border rounded-md text-gray-500 hover:bg-gray-100 transition"
                  title="Buscar en SUNAT"
                  onClick={() => toast.info("Consulta SUNAT no implementada aún")}
                >
                  <Search size={15} />
                </button>
              </div>
            </div>

            {/* Legal name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Razón Social o Nombre Completo
              </label>
              <input
                type="text"
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder="Razón social o nombre completo"
              />
            </div>
          </div>

          {/* Address + reference + ubigeo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Dirección del Domicilio Fiscal <span className="text-blue-500 text-[10px] font-normal normal-case">(principal)</span>
              </label>
              <input
                type="text"
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Av. / Jr..."
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Ubigeo
                <span className="inline-flex items-center ml-1 text-blue-500 cursor-help" title="Código INEI 6 dígitos">?</span>
              </label>
              <input
                type="text"
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={ubigeo}
                onChange={(e) => setUbigeo(e.target.value)}
                maxLength={6}
                placeholder="150101"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex gap-0 px-6">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="p-6">
          {activeTab === "General" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Nombre Comercial
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={tradeName}
                    onChange={(e) => setTradeName(e.target.value)}
                    placeholder="Nombre comercial o de fantasía"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Clasificación
                  </label>
                  <select className="w-full border rounded-md px-3 py-2 text-sm text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30" disabled>
                    <option>Elegir</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Sector / Calle
                  </label>
                  <select className="w-full border rounded-md px-3 py-2 text-sm text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30" disabled>
                    <option>Elegir</option>
                  </select>
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Código Interno
                  </label>
                  <div className="flex items-center border rounded-md overflow-hidden">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 text-sm focus:outline-none focus:ring-0"
                      value={internalCode}
                      onChange={(e) => setInternalCode(e.target.value)}
                      placeholder="Código Interno"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Detalle Adicional
                  </label>
                  <textarea
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Notas adicionales"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "Contacto(s)" && (
            <div className="space-y-4">
              {contacts.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">
                  No hay contactos registrados. Haga clic en &quot;Agregar contacto&quot;.
                </p>
              )}
              {contacts.map((c, idx) => (
                <div key={idx} className="border rounded-md p-4 space-y-3 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-700">Contacto {idx + 1}</h4>
                    <button
                      onClick={() => removeContact(idx)}
                      className="text-red-400 hover:text-red-600 p-1"
                    >
                      <X size={15} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-500">Nombre *</label>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                        value={c.name}
                        onChange={(e) => updateContact(idx, "name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-500">Cargo</label>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                        value={c.position}
                        onChange={(e) => updateContact(idx, "position", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-500">Teléfono</label>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                        value={c.phone}
                        onChange={(e) => updateContact(idx, "phone", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-500">Email</label>
                      <input
                        type="email"
                        className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                        value={c.email}
                        onChange={(e) => updateContact(idx, "email", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={addContact}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                + Agregar contacto
              </button>
            </div>
          )}

          {activeTab === "Configuración" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+51 999 999 999"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@empresa.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Condición SUNAT
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={taxpayerCondition}
                    onChange={(e) => setTaxpayerCondition(e.target.value)}
                    placeholder="HABIDO / NO HABIDO"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Estado SUNAT
                  </label>
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={taxpayerStatus}
                    onChange={(e) => setTaxpayerStatus(e.target.value)}
                  >
                    <option value="">Sin información</option>
                    <option value="ACTIVO">ACTIVO</option>
                    <option value="BAJA PROVISIONAL">BAJA PROVISIONAL</option>
                    <option value="BAJA PROV. POR OFICIO">BAJA PROV. POR OFICIO</option>
                    <option value="SUSPENDIDO">SUSPENDIDO</option>
                    <option value="INHABITADO">INHABILITADO</option>
                    <option value="BAJA DEFINITIVA">BAJA DEFINITIVA</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Plazo de Crédito (días)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={paymentTermDays}
                    onChange={(e) => setPaymentTermDays(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={isRetentionAgent}
                      onChange={(e) => setIsRetentionAgent(e.target.checked)}
                    />
                    <div className="w-10 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary/30 rounded-full peer peer-checked:bg-primary transition-all after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                  </label>
                  <span className="text-sm text-gray-700">Agente de retención</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
