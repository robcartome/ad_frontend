"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  Warehouse,
  Boxes,
  ChevronDown,
  ChevronRight,
  Notebook,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function Sidebar({
  mobileOpen,
  setMobileOpen,
  desktopOpen,
}) {
  const pathname = usePathname();
  const sidebarRef = useRef(null);
  const [inventoryOpen, setInventoryOpen] = useState(
    pathname.startsWith("/admin/inventory")
  );

  useEffect(() => {
    if (desktopOpen) return;

    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setInventoryOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [desktopOpen]);

  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Productos", href: "/admin/products", icon: Package },
    { name: "Categorías", href: "/admin/categories", icon: Tags },
    { name: "Marcas", href: "/admin/brands", icon: Tags },
    { name: "Almacenes", href: "/admin/warehouses", icon: Warehouse },
    { name: "Catalogo", href: "/admin/catalog_admin", icon: Notebook },
  ];

  return (
    <aside
      ref={sidebarRef}
      className={`${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      } fixed inset-y-0 left-0 z-40 w-56 bg-white border-r shadow-sm transition-all duration-300 lg:translate-x-0 lg:static ${
        desktopOpen ? "lg:w-56" : "lg:w-16"
      }`}
    >
      {/* 🔹 Header */}
      <div
        className={`flex items-center p-4 border-b h-14 ${
          desktopOpen ? "justify-between" : "justify-center lg:px-2"
        }`}
      >
        {desktopOpen ? (
          <h1 className="text-lg font-semibold text-gray-800">Panel Admin</h1>
        ) : (
          <span className="hidden lg:block text-sm font-semibold text-primary">
            AD+
          </span>
        )}
        <button
          onClick={() => setMobileOpen(false)}
          className="block lg:hidden ml-auto text-gray-500 hover:text-gray-700"
          aria-label="Cerrar sidebar"
        >
          ✕
        </button>
      </div>

      {/* 🔹 Menú */}
      <nav className={`space-y-1 text-sm ${desktopOpen ? "p-4" : "p-2 lg:p-2"}`}>
        {menuItems.map(({ name, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            title={!desktopOpen ? name : undefined}
            className={`group relative flex items-center py-2 rounded-md transition ${
              desktopOpen ? "gap-2 px-3" : "lg:justify-center lg:px-2 px-3 gap-2"
            } ${
              pathname === href
                ? "bg-primary text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Icon size={18} />
            <span className={desktopOpen ? "" : "lg:hidden"}>{name}</span>
            {!desktopOpen && (
              <span className="hidden lg:block pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap rounded-md bg-gray-900 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {name}
              </span>
            )}
          </Link>
        ))}

        {/* 📦 Inventario con submenús */}
        <div className="relative">
          <button
            onClick={() => setInventoryOpen(!inventoryOpen)}
            title={!desktopOpen ? "Inventario" : undefined}
            className={`group relative flex w-full items-center py-2 rounded-md transition ${
              desktopOpen ? "justify-between px-3" : "lg:justify-center lg:px-2 px-3"
            } ${
              pathname.startsWith("/admin/inventory")
                ? "bg-primary text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span
              className={`flex items-center ${desktopOpen ? "gap-2" : "gap-2 lg:gap-0"}`}
            >
              <Boxes size={18} />
              <span className={desktopOpen ? "" : "lg:hidden"}>Inventario</span>
            </span>
            <span className={desktopOpen ? "" : "lg:hidden"}>
              {inventoryOpen ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </span>
            {!desktopOpen && (
              <span className="hidden lg:block pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap rounded-md bg-gray-900 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Inventario
              </span>
            )}
          </button>

          {inventoryOpen && (desktopOpen || mobileOpen) && (
            <div className="ml-3 mt-1 space-y-1">
              <Link
                href="/admin/inventory/movements"
                className={`block px-3 py-2 rounded-md transition ${
                  pathname === "/admin/inventory/movements"
                    ? "bg-primary/20 text-primary font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Movimientos
              </Link>
              <Link
                href="/admin/inventory/entries"
                className={`block px-3 py-2 rounded-md transition ${
                  pathname === "/admin/inventory/entries"
                    ? "bg-primary/20 text-primary font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Entradas
              </Link>
              <Link
                href="/admin/inventory/exits"
                className={`block px-3 py-2 rounded-md transition ${
                  pathname === "/admin/inventory/exits"
                    ? "bg-primary/20 text-primary font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Salidas
              </Link>
              <Link
                href="/admin/inventory/transfers"
                className={`block px-3 py-2 rounded-md transition ${
                  pathname === "/admin/inventory/transfers"
                    ? "bg-primary/20 text-primary font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Transferencias
              </Link>
              <Link
                href="/admin/inventory/adjustments"
                className={`block px-3 py-2 rounded-md transition ${
                  pathname === "/admin/inventory/adjustments"
                    ? "bg-primary/20 text-primary font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Ajuste de Inventario
              </Link>
            </div>
          )}

          {inventoryOpen && !desktopOpen && !mobileOpen && (
            <div className="hidden lg:block absolute left-full top-0 ml-2 w-52 bg-white border border-gray-200 rounded-md shadow-lg p-2 z-50">
              <Link
                href="/admin/inventory/movements"
                onClick={() => setInventoryOpen(false)}
                className={`block px-3 py-2 rounded-md transition ${
                  pathname === "/admin/inventory/movements"
                    ? "bg-primary/20 text-primary font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Movimientos
              </Link>
              <Link
                href="/admin/inventory/entries"
                onClick={() => setInventoryOpen(false)}
                className={`block px-3 py-2 rounded-md transition ${
                  pathname === "/admin/inventory/entries"
                    ? "bg-primary/20 text-primary font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Entradas
              </Link>
              <Link
                href="/admin/inventory/exits"
                onClick={() => setInventoryOpen(false)}
                className={`block px-3 py-2 rounded-md transition ${
                  pathname === "/admin/inventory/exits"
                    ? "bg-primary/20 text-primary font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Salidas
              </Link>
              <Link
                href="/admin/inventory/transfers"
                onClick={() => setInventoryOpen(false)}
                className={`block px-3 py-2 rounded-md transition ${
                  pathname === "/admin/inventory/transfers"
                    ? "bg-primary/20 text-primary font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Transferencias
              </Link>
              <Link
                href="/admin/inventory/adjustments"
                onClick={() => setInventoryOpen(false)}
                className={`block px-3 py-2 rounded-md transition ${
                  pathname === "/admin/inventory/adjustments"
                    ? "bg-primary/20 text-primary font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Ajuste de Inventario
              </Link>
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}
