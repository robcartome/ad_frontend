"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { canAccessAdministrationRoute, getAdministrationAccess } from "@/lib/admin/access.mjs";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import DashboardFrame from "./DashboardFrame";
import AuthGuard from "@/components/auth/AuthGuard";
import ErpModuleNotice from "@/components/admin/ErpModuleNotice";
import { isErpRoute } from "@/lib/admin/routes.mjs";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const { user, selectedCompany } = useAuth();
  const access = getAdministrationAccess(user, selectedCompany);

  const canAccess = canAccessAdministrationRoute(pathname, access);

  // Preview retains authentication and company checks, with no ERP chrome in the frame.
  if (pathname === "/admin/website/preview" && canAccess) {
    return <AuthGuard>{children}</AuthGuard>;
  }

  return (
    <AuthGuard>
      <DashboardFrame
        sidebar={({ mobileOpen, setMobileOpen, desktopOpen }) => <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} desktopOpen={desktopOpen}/>}
        topbar={({ onMenuClick, desktopOpen, onDesktopToggle }) => <Topbar onMenuClick={onMenuClick} desktopSidebarOpen={desktopOpen} onDesktopSidebarToggle={onDesktopToggle}/>}
      >{!canAccess ? <section className="mx-auto max-w-xl space-y-4 px-6 py-12">
            <h1 className="text-2xl font-semibold">Acceso no disponible</h1>
            <p className="text-gray-600">Tu cuenta no tiene permisos para esta sección.</p>
            <Link href="/admin" className="inline-flex rounded-md bg-green-700 px-4 py-3 text-white">Volver al inicio</Link>
          </section> : isErpRoute(pathname) ? <ErpModuleNotice /> : children}</DashboardFrame>
    </AuthGuard>
  );
}
