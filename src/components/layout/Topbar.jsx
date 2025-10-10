"use client";

import { Menu } from "lucide-react";

export default function Topbar({ onMenuClick }) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 shadow-sm">
      {/* Botón menú móvil */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition"
      >
        <Menu size={20} />
      </button>

      <h2 className="font-semibold text-gray-800">Panel de Administración</h2>

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
