"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, Layers, Warehouse, Store, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Dashboard", href: "/admin", icon: Home },
  { name: "Productos", href: "/admin/products", icon: Package },
  { name: "Categorías", href: "/admin/categories", icon: Layers },
  { name: "Marcas", href: "/admin/brands", icon: Settings },
  { name: "Almacenes", href: "/admin/warehouses", icon: Warehouse },
  { name: "Tiendas", href: "/admin/stores", icon: Store },
];

export default function Sidebar({ open, setOpen }) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay móvil */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed lg:static z-50 w-64 bg-white border-r border-gray-200 h-full transform transition-transform duration-200 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">ApuDig Admin</h1>
        </div>
        <nav className="flex flex-col p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
