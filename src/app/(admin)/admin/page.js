import Link from "next/link";
import { ArrowUpRight, Notebook, ShoppingBag } from "lucide-react";
import WebsiteAdminEntry from "@/components/admin/website/WebsiteAdminEntry";

export default function DashboardPage() {
  return <div className="mx-auto max-w-6xl space-y-7 px-4 py-5 sm:px-6">
    <header>
      <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">APUDIG Web</span>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">Administración de la página web</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600">Gestiona el contenido comercial de la tienda y accede a los catálogos. Las funciones disponibles dentro del editor dependen de tus permisos.</p>
    </header>
    <WebsiteAdminEntry/>
    <section aria-label="Catálogos disponibles" className="grid gap-5 md:grid-cols-2">
      <Link href="/admin/catalog_admin" className="rounded-xl border bg-white p-6 transition hover:border-gray-400">
        <div className="flex items-center justify-between"><Notebook size={25} className="text-gray-600"/><ArrowUpRight size={19}/></div>
        <h2 className="mt-5 text-lg font-semibold">Catálogo interno</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">Consulta la vista administrativa existente del catálogo de productos.</p>
      </Link>
      <Link href="/catalog" target="_blank" rel="noopener noreferrer" className="rounded-xl border bg-white p-6 transition hover:border-gray-400">
        <div className="flex items-center justify-between"><Notebook size={25} className="text-gray-600"/><ArrowUpRight size={19}/></div>
        <h2 className="mt-5 text-lg font-semibold">Catálogo para trabajadores</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">Abre el catálogo público habitual para consultar productos y precios o compartir su enlace.</p>
      </Link>
    </section>
    <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-white p-6">
      <div className="flex items-start gap-4"><ShoppingBag className="mt-1 shrink-0 text-orange-800" size={25}/><div><h2 className="font-semibold">Productos del website</h2><p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-600">La tienda comercial tiene su propia ruta y diseño, separados del catálogo que utilizan los trabajadores.</p></div></div>
      <Link href="/shop" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md border px-4 py-3 text-sm font-medium hover:bg-gray-50">Ver tienda <ArrowUpRight size={16}/></Link>
    </section>
    <aside className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-relaxed text-gray-600"><strong className="text-gray-800">El ERP se gestiona desde Django.</strong> Productos, categorías, marcas, almacenes, socios de negocio, inventario y ventas corresponden a apudig_mvp. Este panel se concentra en la web y los catálogos.</aside>
  </div>;
}
