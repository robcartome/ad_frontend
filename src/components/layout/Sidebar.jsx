"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, Globe, LayoutDashboard, Notebook, ShoppingBag, X } from "lucide-react";

// The ERP belongs to Django. Keep Next navigation focused on website content
// and the existing internal catalog. Website permissions are checked at the destination.
const menuItems = [
  { name: "Inicio", href: "/admin", icon: LayoutDashboard },
  { name: "Administrar página web", href: "/admin/website", icon: Globe },
  { name: "Catálogo interno", href: "/admin/catalog_admin", icon: Notebook },
];
const publicLinks = [
  { name: "Ver página web", href: "/", icon: ExternalLink },
  { name: "Productos del website", href: "/shop", icon: ShoppingBag },
  { name: "Catálogo para trabajadores", href: "/catalog", icon: Notebook },
];

export default function Sidebar({ mobileOpen, setMobileOpen, desktopOpen }) {
  const pathname = usePathname();
  const labelClass = desktopOpen ? "" : "lg:hidden";

  function item({ name, href, icon: Icon }, external = false) {
    const active = !external && (pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`)));
    return <Link
      key={href}
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      title={name}
      aria-label={name}
      aria-current={active ? "page" : undefined}
      onClick={() => setMobileOpen(false)}
      className={`group relative flex min-h-11 items-center rounded-md px-3 py-2 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700 ${desktopOpen ? "gap-3" : "gap-3 lg:justify-center lg:px-2"} ${active ? "bg-orange-100 text-orange-950 font-medium" : "text-gray-700 hover:bg-gray-100"}`}
    >
      <Icon size={18} className="shrink-0" aria-hidden="true"/>
      <span className={labelClass}>{name}</span>
      {!desktopOpen && <span aria-hidden="true" className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 lg:block">{name}</span>}
    </Link>;
  }

  return <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r bg-white shadow-sm transition-transform lg:static lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"} ${desktopOpen ? "lg:w-64" : "lg:w-16"}`}>
    <div className={`flex h-14 items-center border-b p-4 ${desktopOpen ? "justify-between" : "lg:justify-center lg:px-2"}`}>
      <Link href="/admin" onClick={() => setMobileOpen(false)} aria-label="APUDIG Web, inicio" className="font-semibold tracking-tight">
        <span className={labelClass}>APUDIG <span className="text-orange-700">Web</span></span>
        {!desktopOpen && <span className="hidden text-sm lg:inline">AD</span>}
      </Link>
      <button type="button" onClick={() => setMobileOpen(false)} className="ml-auto p-2 text-gray-500 lg:hidden" aria-label="Cerrar menú"><X size={19}/></button>
    </div>
    <nav aria-label="Administración web" className={`space-y-1 ${desktopOpen ? "p-4" : "p-2"}`}>
      <p className={`px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500 ${labelClass}`}>Contenido y catálogos</p>
      {menuItems.map(entry => item(entry))}
    </nav>
    <nav aria-label="Consultar vistas públicas" className={`border-t ${desktopOpen ? "p-4" : "p-2"}`}>
      <p className={`px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500 ${labelClass}`}>Abrir en otra pestaña</p>
      {publicLinks.map(entry => item(entry, true))}
    </nav>
    <div className={`mt-auto border-t px-6 py-5 text-xs leading-relaxed text-gray-500 ${labelClass}`}>
      Productos, inventario, ventas y gestión ERP se administran en Django, con apudig_mvp.
    </div>
  </aside>;
}
