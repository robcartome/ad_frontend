import Link from 'next/link';
import { Building2 } from 'lucide-react';

export default function ErpModuleNotice() {
  return <section className="mx-auto my-6 max-w-3xl rounded-xl border bg-white p-6 sm:p-9">
    <Building2 size={32} className="text-gray-500"/>
    <h1 className="mt-5 text-2xl font-semibold tracking-tight">Este módulo se administra desde APUDIG</h1>
    <p className="mt-4 text-sm leading-relaxed text-gray-600">Accede a tu sistema de gestión APUDIG para administrar productos, inventario, ventas, clientes y la configuración de tu empresa.</p>
    <p className="mt-3 text-sm leading-relaxed text-gray-600">En este panel puedes administrar el contenido del website y consultar el catálogo interno existente.</p>
    <div className="mt-7 flex flex-wrap gap-3">
      <Link href="/admin/website" className="rounded-md bg-orange-500 px-4 py-3 text-sm font-medium text-gray-950 hover:bg-orange-400">Administrar página web</Link>
      <Link href="/admin/catalog_admin" className="rounded-md border px-4 py-3 text-sm font-medium hover:bg-gray-50">Ir al catálogo interno</Link>
    </div>
  </section>;
}
