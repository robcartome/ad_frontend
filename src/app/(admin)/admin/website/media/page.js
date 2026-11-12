"use client";
/* R2 already serves optimized WebP thumbnails; the host is tenant configuration. */
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteWebsiteMedia, getWebsiteMedia, uploadWebsiteMedia } from "@/services/websiteService";

export default function WebsiteMediaPage() {
  const [media, setMedia] = useState([]); const [file, setFile] = useState(null); const [altText, setAltText] = useState(""); const [kind, setKind] = useState("IMAGE"); const [error, setError] = useState("");
  const load = () => getWebsiteMedia().then(setMedia).catch((err) => setError(err.message)); useEffect(() => {
    load();
  }, []);
  async function upload(event) { event.preventDefault(); if (!file) return; try { await uploadWebsiteMedia({ file, kind, altText }); setFile(null); setAltText(""); load(); } catch (err) { setError(err.message); } }
  async function remove(id) { try { await deleteWebsiteMedia(id); load(); } catch (err) { setError(err.message); } }
  return <div className="space-y-6"><div><h1 className="text-2xl font-bold">Biblioteca de medios</h1><p className="text-sm text-slate-500">Imágenes aisladas por sitio, optimizadas y almacenadas en R2.</p></div><form onSubmit={upload} className="grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-[1fr_1fr_160px_auto]"><Input type="file" accept="image/jpeg,image/png,image/webp" required onChange={(event) => setFile(event.target.files?.[0] || null)} /><Input value={altText} onChange={(event) => setAltText(event.target.value)} placeholder="Texto alternativo" /><select className="h-9 rounded-md border px-3" value={kind} onChange={(event) => setKind(event.target.value)}><option value="IMAGE">Imagen</option><option value="LOGO">Logo</option><option value="FAVICON">Favicon</option></select><Button type="submit">Subir</Button></form>{error ? <p className="text-red-600">{error}</p> : null}<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{media.map((asset) => <article key={asset.id} className="overflow-hidden rounded-xl border bg-white"><img src={asset.thumbnail_url} alt={asset.alt_text} className="h-40 w-full object-cover" /><div className="space-y-2 p-3"><p className="truncate font-medium">{asset.original_name}</p><p className="text-xs text-slate-500">{asset.width}×{asset.height} · {asset.kind}</p><Button size="sm" variant="destructive" onClick={() => remove(asset.id)}>Eliminar</Button></div></article>)}</div></div>;
}
