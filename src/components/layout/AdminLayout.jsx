"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AdminLayout({ children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);

  return (
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
        <main className="flex-1 py-3 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
