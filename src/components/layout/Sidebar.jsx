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
import { useState } from "react";

export default function Sidebar({ open, setOpen }) {
  const pathname = usePathname();
  const [inventoryOpen, setInventoryOpen] = useState(
    pathname.startsWith("/admin/inventory")
  );

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
      className={`${
        open ? "translate-x-0" : "-translate-x-full"
      } fixed lg:static lg:translate-x-0 z-40 w-64 bg-white border-r shadow-sm transition-transform duration-300`}
    >
      {/* 🔹 Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-lg font-semibold text-gray-800">Panel Admin</h1>
        <button
          onClick={() => setOpen(false)}
          className="block lg:hidden text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {/* 🔹 Menú */}
      <nav className="p-4 space-y-1 text-sm">
        {menuItems.map(({ name, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition ${
              pathname === href
                ? "bg-primary text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Icon size={18} />
            {name}
          </Link>
        ))}

        {/* 📦 Inventario con submenús */}
        <div>
          <button
            onClick={() => setInventoryOpen(!inventoryOpen)}
            className={`flex w-full items-center justify-between px-3 py-2 rounded-md transition ${
              pathname.startsWith("/admin/inventory")
                ? "bg-primary text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className="flex items-center gap-2">
              <Boxes size={18} />
              Inventario
            </span>
            {inventoryOpen ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>

          {inventoryOpen && (
            <div className="ml-6 mt-1 space-y-1">
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
        </div>
      </nav>
    </aside>
  );
}
