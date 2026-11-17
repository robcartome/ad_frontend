"use client";

import Link from "next/link";
import { ArrowUpRight, Notebook, ShoppingBag } from "lucide-react";
import WebsiteAdminEntry from "@/components/admin/website/WebsiteAdminEntry";
import { useAuth } from "@/lib/AuthContext";
import { getAdministrationAccess } from "@/lib/admin/access.mjs";

export default function DashboardPage() {
  const { user, selectedCompany } = useAuth();
  const access = getAdministrationAccess(user, selectedCompany);
  return <div className="mx-auto max-w-6xl space-y-7 px-4 py-5 sm:px-6">
    <header>
      <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">APUDIG Web</span>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">Bienvenido a APUDIG Web</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600">{access.companyAdmin ? 'Gestiona tu página web y consulta los catálogos de tu empresa.' : access.website ? 'Gestiona los contenidos que tienes autorizados y consulta el catálogo de la empresa.' : 'Consulta el catálogo y accede a la información de la empresa desde tu cuenta.'}</p>
    </header>
    {access.website && <WebsiteAdminEntry/>}
    <section aria-label="Catálogos disponibles" className="grid gap-5 md:grid-cols-2">
      {access.companyAdmin && <Link href="/admin/catalog_admin" className="rounded-xl border bg-white p-6 transition hover:border-gray-400">
        <div className="flex items-center justify-between"><Notebook size={25} className="text-gray-600"/><ArrowUpRight size={19}/></div>
        <h2 className="mt-5 text-lg font-semibold">Catálogo interno</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">Consulta la vista administrativa existente del catálogo de productos.</p>
      </Link>}
      <Link href="/catalog" target="_blank" rel="noopener noreferrer" className="rounded-xl border bg-white p-6 transition hover:border-gray-400">
        <div className="flex items-center justify-between"><Notebook size={25} className="text-gray-600"/><ArrowUpRight size={19}/></div>
        <h2 className="mt-5 text-lg font-semibold">Catálogo de productos</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">Consulta los productos y precios disponibles para tu cuenta en la empresa.</p>
      </Link>
    </section>
    <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-white p-6">
      <div className="flex items-start gap-4"><ShoppingBag className="mt-1 shrink-0 text-orange-800" size={25}/><div><h2 className="font-semibold">Página web de la empresa</h2><p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-600">Visita la página de la empresa y consulta sus novedades e información de contacto.</p></div></div>
      <Link href="/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md border px-4 py-3 text-sm font-medium hover:bg-gray-50">Ver página web <ArrowUpRight size={16}/></Link>
    </section>
    {access.companyAdmin && <aside className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-relaxed text-gray-600"><strong className="text-gray-800">La gestión de tu empresa está en APUDIG.</strong> Administra productos, inventario, ventas y clientes desde tu sistema de gestión. En este espacio encontrarás tu página web y los catálogos.</aside>}
  </div>;
}
