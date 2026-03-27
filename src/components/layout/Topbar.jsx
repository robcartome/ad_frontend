"use client";

import { Menu, PanelLeftClose } from "lucide-react";

export default function Topbar({
  onMenuClick,
  desktopSidebarOpen,
  onDesktopSidebarToggle,
}) {
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 shadow-sm">
      <div className="flex items-center gap-2">
        {/* Botón menú móvil */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition"
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>

        {/* Botón menú escritorio */}
        <button
          onClick={onDesktopSidebarToggle}
          className="hidden lg:flex p-2 rounded-md hover:bg-gray-100 text-gray-600 transition"
          aria-label={desktopSidebarOpen ? "Ocultar sidebar" : "Mostrar sidebar"}
        >
          {desktopSidebarOpen ? <PanelLeftClose size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <h2 className="font-semibold text-gray-800">PANEL ADMIN</h2>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">admin@apudig.com</span>
        <img
          src="/avatar.png"
          alt="Admin"
          className="w-8 h-8 rounded-full border border-gray-300"
        />
      </div>
    </header>
  );
}
