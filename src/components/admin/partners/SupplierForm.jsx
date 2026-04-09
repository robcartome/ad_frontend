"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, Loader2, Truck, ChevronRight } from "lucide-react";
import { createPartnerSupplier } from "@/services/partnersService";

export default function SupplierForm({ initialData = null, mode = "create" }) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(initialData?.name || "");
  const [documentNumber, setDocumentNumber] = useState(initialData?.document_number || "");
  const [address, setAddress] = useState(initialData?.address || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [contactName, setContactName] = useState(initialData?.contact_name || "");

  async function handleSave() {
    if (!name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        document_number: documentNumber.trim() || null,
        address: address.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        contact_name: contactName.trim() || null,
      };

      let result;
      if (isEdit && initialData?.id) {
        // update not implemented in supplier router yet → just show message
        toast.info("Actualización de proveedores próximamente");
        return;
      } else {
        result = await createPartnerSupplier(payload);
        toast.success("Proveedor creado correctamente");
        router.push(`/admin/partners/suppliers`);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-gray-500">
        <Truck size={15} />
        <span
          className="hover:text-primary cursor-pointer"
          onClick={() => router.push("/admin/partners/suppliers")}
        >
          Proveedores
        </span>
        <ChevronRight size={14} />
        <span className="text-gray-800 font-medium">
          {isEdit ? name || "Editar Proveedor" : "Crear"}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-sm text-gray-600 border rounded-md hover:bg-gray-50 transition"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition text-sm font-medium disabled:opacity-60"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Guardar
        </button>
      </div>

      {/* Main form card */}
      <div className="bg-white rounded-lg border shadow-sm p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-800 border-b pb-3">
          Datos del Proveedor
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Nombre / Razón Social *
            </label>
            <input
              type="text"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre o razón social del proveedor"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              N° Documento (RUC/DNI)
            </label>
            <input
              type="text"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              placeholder="20123456789"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Contacto Principal
            </label>
            <input
              type="text"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Nombre del contacto"
            />
          </div>

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
              placeholder="correo@proveedor.com"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Dirección
            </label>
            <input
              type="text"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Dirección fiscal"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
