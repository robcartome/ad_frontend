"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, Store, Warehouse, Tag, Layers } from "lucide-react";

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: Layers },
  { href: "/admin/products", label: "Productos", icon: Package },
  { href: "/admin/categories", label: "Categorías", icon: Tag },
  { href: "/admin/brands", label: "Marcas", icon: Layers },
  { href: "/admin/warehouses", label: "Almacenes", icon: Warehouse },
  { href: "/admin/stores", label: "Tiendas", icon: Store },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r shadow-sm flex flex-col">
      <div className="p-4 text-xl font-bold text-blue-600 border-b">
        🧱 ApuDig
      </div>
      <nav className="flex-1 p-2">
        {menuItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 p-2 rounded-lg mb-1 transition ${
                active
                  ? "bg-blue-100 text-blue-700 font-semibold"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}