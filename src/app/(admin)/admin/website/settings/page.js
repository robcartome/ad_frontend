"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getWebsiteSettings, updateWebsiteSettings } from "@/services/websiteService";

export default function WebsiteSettingsPage() {
  const [form, setForm] = useState(null); const [message, setMessage] = useState(""); const [error, setError] = useState("");
  useEffect(() => { getWebsiteSettings().then(setForm).catch((err) => setError(err.message)); }, []);
  if (!form) return <p>{error || "Cargando configuración…"}</p>;
  const set = (field, value) => setForm({ ...form, [field]: value });
  async function save(event) { event.preventDefault(); try { setForm(await updateWebsiteSettings({ business_name: form.business_name, whatsapp: form.whatsapp, phone: form.phone, email: form.email, address: form.address, footer_text: form.footer_text, google_maps_url: form.google_maps_url })); setMessage("Configuración guardada."); setError(""); } catch (err) { setError(err.message); } }
  return <form onSubmit={save} className="mx-auto max-w-3xl space-y-5"><div><h1 className="text-2xl font-bold">Configuración pública</h1><p className="text-sm text-slate-500">Datos utilizados en cabecera, pie, contacto y JSON-LD.</p></div><div className="grid gap-4 rounded-xl border bg-white p-5 sm:grid-cols-2">{[["business_name", "Nombre comercial"], ["whatsapp", "WhatsApp"], ["phone", "Teléfono"], ["email", "Correo"], ["google_maps_url", "URL de Google Maps"]].map(([field, label]) => <label className="space-y-1 text-sm" key={field}>{label}<Input value={form[field] || ""} onChange={(event) => set(field, event.target.value)} /></label>)}<label className="space-y-1 text-sm sm:col-span-2">Dirección<Input value={form.address || ""} onChange={(event) => set("address", event.target.value)} /></label><label className="space-y-1 text-sm sm:col-span-2">Texto del pie<Textarea value={form.footer_text || ""} onChange={(event) => set("footer_text", event.target.value)} /></label></div>{message ? <p className="text-green-700">{message}</p> : null}{error ? <p className="text-red-600">{error}</p> : null}<Button type="submit">Guardar configuración</Button></form>;
}
