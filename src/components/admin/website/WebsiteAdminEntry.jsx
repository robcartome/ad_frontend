'use client';
import Link from 'next/link';
import { ArrowUpRight, Globe } from 'lucide-react';
import { useWebsiteAccess } from './useWebsiteAccess';

export default function WebsiteAdminEntry() {
  const { canView } = useWebsiteAccess();
  if (!canView) return null;
  return <Link href="/admin/website" className="flex items-center justify-between gap-4 rounded-xl border border-orange-200 bg-orange-50 p-6 transition hover:bg-orange-100">
    <div className="flex items-center gap-4"><Globe className="text-orange-800" size={28}/><div><h2 className="font-semibold text-gray-900">Administra tu página web</h2><p className="mt-1 text-sm text-gray-700">Banners, campañas, secciones y datos comerciales.</p></div></div><ArrowUpRight size={22}/>
  </Link>;
}
