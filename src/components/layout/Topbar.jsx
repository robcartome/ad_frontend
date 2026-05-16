"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, PanelLeftClose, LogOut, ChevronDown, Building2, User } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";

export default function Topbar({
  onMenuClick,
  desktopSidebarOpen,
  onDesktopSidebarToggle,
}) {
  const { user, selectedCompany, logout, isSuperuser } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await logout();
    toast.success("Sesión cerrada");
    router.push("/login");
  }

  const displayName = user?.name || user?.email || "Usuario";
  const companyName = selectedCompany?.company_name || "Sin empresa";

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

      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Building2 size={14} className="text-blue-500" />
        <span className="hidden sm:inline font-medium">{companyName}</span>
      </div>

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition"
        >
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
            {displayName[0]?.toUpperCase()}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-sm font-medium text-gray-800 leading-none">{displayName}</div>
            {isSuperuser && (
              <div className="text-xs text-blue-600 mt-0.5">Superadmin</div>
            )}
          </div>
          <ChevronDown size={14} className="text-gray-400" />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 top-10 z-20 bg-white border border-gray-200 rounded-xl shadow-lg w-52 py-1">
              <div className="px-4 py-2 border-b border-gray-100">
                <div className="text-sm font-semibold text-gray-800 truncate">{displayName}</div>
                <div className="text-xs text-gray-500 truncate">{user?.email}</div>
              </div>
              <button
                onClick={() => { setMenuOpen(false); router.push("/admin/administration"); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <User size={14} />
                Mi perfil
              </button>
              <button
                onClick={() => { setMenuOpen(false); handleLogout(); }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut size={14} />
                Cerrar sesión
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
