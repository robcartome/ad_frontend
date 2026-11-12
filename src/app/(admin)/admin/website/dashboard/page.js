"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentWebsite, getWebsitePages } from "@/services/websiteService";

const modules = [["Páginas", "/admin/website/pages"], ["Catálogo", "/admin/website/catalog"], ["Banners", "/admin/website/banners"], ["Menús", "/admin/website/menus"], ["Tema", "/admin/website/themes"], ["Medios", "/admin/website/media"], ["SEO", "/admin/website/seo"], ["Configuración", "/admin/website/settings"]];
export default function WebsiteDashboardPage() {
  const [website, setWebsite] = useState(null); const [pages, setPages] = useState([]);
  useEffect(() => { Promise.all([getCurrentWebsite(), getWebsitePages()]).then(([site, list]) => { setWebsite(site); setPages(Array.isArray(list) ? list : list.results || []); }); }, []);
  const published = pages.filter((page) => page.status === "PUBLISHED").length;
  return <div className="space-y-6"><div><h1 className="text-2xl font-bold">Sitio web</h1><p className="text-sm text-slate-500">Identidad, contenido y publicación de {website?.name || "tu empresa"}.</p></div><div className="grid gap-4 md:grid-cols-3"><Card><CardHeader><CardTitle>Páginas</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{pages.length}</CardContent></Card><Card><CardHeader><CardTitle>Publicadas</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{published}</CardContent></Card><Card><CardHeader><CardTitle>Estado</CardTitle></CardHeader><CardContent className="text-lg font-semibold">{website?.status || "Cargando…"}</CardContent></Card></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{modules.map(([label, href]) => <Button key={href} asChild variant="outline" className="h-16"><Link href={href}>{label}</Link></Button>)}</div></div>;
}
