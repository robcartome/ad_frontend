"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createWebsitePage, getWebsitePages } from "@/services/websiteService";

export default function WebsitePagesPage() {
  const [pages, setPages] = useState([]); const [title, setTitle] = useState(""); const [slug, setSlug] = useState(""); const [error, setError] = useState("");
  const load = () => getWebsitePages().then((data) => setPages(Array.isArray(data) ? data : data.results || [])).catch((err) => setError(err.message));
  useEffect(() => {
    load();
  }, []);
  async function create(event) { event.preventDefault(); setError(""); try { await createWebsitePage({ title, slug, page_type: "STANDARD" }); setTitle(""); setSlug(""); load(); } catch (err) { setError(err.message); } }
  return <div className="space-y-6"><div><h1 className="text-2xl font-bold">Páginas</h1><p className="text-sm text-slate-500">Crea, edita y publica contenido por bloques.</p></div><form onSubmit={create} className="grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-[1fr_1fr_auto]"><Input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Nombre de la página" /><Input required value={slug} onChange={(event) => setSlug(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} placeholder="slug-de-pagina" /><Button type="submit">Crear página</Button></form>{error ? <p className="text-sm text-red-600">{error}</p> : null}<div className="overflow-hidden rounded-xl border bg-white">{pages.map((page) => <div key={page.id} className="flex items-center justify-between border-b p-4 last:border-0"><div><p className="font-semibold">{page.title}</p><p className="text-xs text-slate-500">/{page.slug === "home" ? "" : page.slug} · {page.status} · borrador v{page.draft_version}</p></div><Button asChild variant="outline"><Link href={`/admin/website/pages/${page.id}`}>Editar</Link></Button></div>)}</div></div>;
}
