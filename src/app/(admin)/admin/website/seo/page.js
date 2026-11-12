"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getWebsiteDomains, getWebsiteSettings, setPrimaryWebsiteDomain, updateWebsiteSettings } from "@/services/websiteService";

export default function WebsiteSeoPage() {
  const [form, setForm] = useState(null); const [domains, setDomains] = useState([]); const [message, setMessage] = useState(""); const [error, setError] = useState("");
  const load = () => Promise.all([getWebsiteSettings(), getWebsiteDomains()]).then(([settings, list]) => { setForm(settings); setDomains(Array.isArray(list) ? list : list.results || []); }).catch((err) => setError(err.message));
  useEffect(() => {
    load();
  }, []);
  if (!form) return <p>{error || "Cargando SEO…"}</p>;
  async function save(event) { event.preventDefault(); try { setForm(await updateWebsiteSettings({ default_seo_title: form.default_seo_title, default_seo_description: form.default_seo_description, default_noindex: form.default_noindex })); setMessage("SEO guardado."); } catch (err) { setError(err.message); } }
  async function makePrimary(id) { try { await setPrimaryWebsiteDomain(id); setMessage("Dominio canónico actualizado."); load(); } catch (err) { setError(err.message); } }
  return <div className="mx-auto max-w-3xl space-y-6"><form onSubmit={save} className="space-y-4"><div><h1 className="text-2xl font-bold">SEO</h1><p className="text-sm text-slate-500">Metadata predeterminada, indexación y dominio canónico.</p></div><div className="space-y-4 rounded-xl border bg-white p-5"><label className="block space-y-1 text-sm">Título predeterminado<Input maxLength={70} value={form.default_seo_title || ""} onChange={(event) => setForm({ ...form, default_seo_title: event.target.value })} /></label><label className="block space-y-1 text-sm">Descripción predeterminada<Textarea maxLength={170} value={form.default_seo_description || ""} onChange={(event) => setForm({ ...form, default_seo_description: event.target.value })} /></label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.default_noindex} onChange={(event) => setForm({ ...form, default_noindex: event.target.checked })} /> Bloquear indexación de todo el sitio</label></div><Button type="submit">Guardar SEO</Button></form><section className="space-y-3"><h2 className="text-lg font-semibold">Dominio canónico</h2>{domains.map((domain) => <div className="flex items-center justify-between rounded-lg border bg-white p-3" key={domain.id}><div><p className="font-medium">{domain.hostname}</p><p className="text-xs text-slate-500">{domain.status}{domain.is_primary ? " · Primario" : ""}</p></div>{!domain.is_primary ? <Button variant="outline" size="sm" disabled={domain.status !== "ACTIVE"} onClick={() => makePrimary(domain.id)}>Hacer primario</Button> : null}</div>)}</section>{message ? <p className="text-green-700">{message}</p> : null}{error ? <p className="text-red-600">{error}</p> : null}</div>;
}
