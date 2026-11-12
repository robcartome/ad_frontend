"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import AuthGuard from "@/components/auth/AuthGuard";
import ErpModuleNotice from "@/components/admin/ErpModuleNotice";
import { isErpRoute } from "@/lib/admin/routes.mjs";

export default function AdminLayout({ children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const pathname = usePathname();

  // Preview retains authentication and company checks, with no ERP chrome in the frame.
  if (pathname === "/admin/website/preview") {
    return <AuthGuard>{children}</AuthGuard>;
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-100">
        {/* Sidebar */}
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          setMobileOpen={setMobileSidebarOpen}
          desktopOpen={desktopSidebarOpen}
        />

        {mobileSidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 z-30 lg:hidden bg-black/20"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Cerrar sidebar"
          />
        )}

        {/* Contenido principal */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Topbar */}
          <Topbar
            onMenuClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            desktopSidebarOpen={desktopSidebarOpen}
            onDesktopSidebarToggle={() =>
              setDesktopSidebarOpen(!desktopSidebarOpen)
            }
          />

          {/* Contenido */}
          <main className="flex-1 py-3 overflow-y-auto">{isErpRoute(pathname) ? <ErpModuleNotice /> : children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
