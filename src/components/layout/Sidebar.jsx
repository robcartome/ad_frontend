"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  Warehouse,
  Boxes,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  Notebook,
  ShoppingCart,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/AuthContext";

export default function Sidebar({
  mobileOpen,
  setMobileOpen,
  desktopOpen,
}) {
  const pathname = usePathname();
  const { isSuperuser, hasRole } = useAuth();
  const isAdmin = isSuperuser || hasRole("admin", "super_admin", "superadmin");
  const sidebarRef = useRef(null);
  const [inventoryOpen, setInventoryOpen] = useState(
    pathname.startsWith("/admin/inventory")
  );
  const [reportsOpen, setReportsOpen] = useState(
    pathname.startsWith("/admin/reports")
  );
  const [administrationOpen, setAdministrationOpen] = useState(
    pathname.startsWith("/admin/administration")
  );
  const [salesOpen, setSalesOpen] = useState(
    pathname.startsWith("/admin/sales")
  );
  const [partnersOpen, setPartnersOpen] = useState(
    pathname.startsWith("/admin/partners")
  );

  useEffect(() => {
    if (desktopOpen) return;

    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setInventoryOpen(false);
        setReportsOpen(false);
        setAdministrationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [desktopOpen]);

  useEffect(() => {
    if (pathname.startsWith("/admin/inventory")) {
      setInventoryOpen(true);
    }
    if (pathname.startsWith("/admin/reports")) {
      setReportsOpen(true);
    }
    if (pathname.startsWith("/admin/administration")) {
      setAdministrationOpen(true);
    }
    if (pathname.startsWith("/admin/sales")) {
      setSalesOpen(true);
    }
    if (pathname.startsWith("/admin/partners")) {
      setPartnersOpen(true);
    }
  }, [pathname]);

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
          <h1 className="text-lg font-semibold text-gray-800">ApuDig</h1>
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

        <div className="relative">
          <button
            onClick={() => setPartnersOpen(!partnersOpen)}
            title={!desktopOpen ? "Socios de Negocio" : undefined}
            className={`group relative flex w-full items-center py-2 rounded-md transition ${
              desktopOpen ? "justify-between px-3" : "lg:justify-center lg:px-2 px-3"
            } ${
              pathname.startsWith("/admin/partners")
                ? "bg-primary text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className={`flex items-center ${desktopOpen ? "gap-2" : "gap-2 lg:gap-0"}`}>
              <Users size={18} />
              <span className={desktopOpen ? "" : "lg:hidden"}>Socios de Negocio</span>
            </span>
            <span className={desktopOpen ? "" : "lg:hidden"}>
              {partnersOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
            {!desktopOpen && (
              <span className="hidden lg:block pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap rounded-md bg-gray-900 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Socios de Negocio
              </span>
            )}
          </button>

          {partnersOpen && (desktopOpen || mobileOpen) && (
            <div className="ml-3 mt-1 space-y-1">
              <div className="px-3 py-1 text-[10px] font-semibold uppercase text-gray-400 tracking-widest">Clientes</div>
              <Link href="/admin/partners/customers" className={`block px-3 py-2 rounded-md transition ${pathname === "/admin/partners/customers" ? "bg-primary/20 text-primary font-medium" : "text-gray-700 hover:bg-gray-100"}`}>
                Lista de Clientes
              </Link>
              <Link href="/admin/partners/customers/new" className={`block px-3 py-2 rounded-md transition ${pathname === "/admin/partners/customers/new" ? "bg-primary/20 text-primary font-medium" : "text-gray-700 hover:bg-gray-100"}`}>
                + Crear Cliente
              </Link>
              <div className="px-3 py-1 text-[10px] font-semibold uppercase text-gray-400 tracking-widest mt-1">Proveedores</div>
              <Link href="/admin/partners/suppliers" className={`block px-3 py-2 rounded-md transition ${pathname === "/admin/partners/suppliers" ? "bg-primary/20 text-primary font-medium" : "text-gray-700 hover:bg-gray-100"}`}>
                Lista de Proveedores
              </Link>
              <Link href="/admin/partners/suppliers/new" className={`block px-3 py-2 rounded-md transition ${pathname === "/admin/partners/suppliers/new" ? "bg-primary/20 text-primary font-medium" : "text-gray-700 hover:bg-gray-100"}`}>
                + Crear Proveedor
              </Link>
            </div>
          )}

          {partnersOpen && !desktopOpen && !mobileOpen && (
            <div className="hidden lg:block absolute left-full top-0 ml-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg p-2 z-50">
              <div className="px-3 py-1 text-[10px] font-semibold uppercase text-gray-400 tracking-widest">Clientes</div>
              <Link href="/admin/partners/customers" onClick={() => setPartnersOpen(false)} className={`block px-3 py-2 rounded-md transition ${pathname === "/admin/partners/customers" ? "bg-primary/20 text-primary font-medium" : "text-gray-700 hover:bg-gray-100"}`}>
                Lista de Clientes
              </Link>
              <Link href="/admin/partners/customers/new" onClick={() => setPartnersOpen(false)} className={`block px-3 py-2 rounded-md transition ${pathname === "/admin/partners/customers/new" ? "bg-primary/20 text-primary font-medium" : "text-gray-700 hover:bg-gray-100"}`}>
                + Crear Cliente
              </Link>
              <div className="px-3 py-1 text-[10px] font-semibold uppercase text-gray-400 tracking-widest mt-1">Proveedores</div>
              <Link href="/admin/partners/suppliers" onClick={() => setPartnersOpen(false)} className={`block px-3 py-2 rounded-md transition ${pathname === "/admin/partners/suppliers" ? "bg-primary/20 text-primary font-medium" : "text-gray-700 hover:bg-gray-100"}`}>
                Lista de Proveedores
              </Link>
              <Link href="/admin/partners/suppliers/new" onClick={() => setPartnersOpen(false)} className={`block px-3 py-2 rounded-md transition ${pathname === "/admin/partners/suppliers/new" ? "bg-primary/20 text-primary font-medium" : "text-gray-700 hover:bg-gray-100"}`}>
                + Crear Proveedor
              </Link>
            </div>
          )}
        </div>

        {/* Ventas con submenús */}
        <div className="relative">
          <button
            onClick={() => setSalesOpen(!salesOpen)}
            title={!desktopOpen ? "Ventas" : undefined}
            className={`group relative flex w-full items-center py-2 rounded-md transition ${
              desktopOpen ? "justify-between px-3" : "lg:justify-center lg:px-2 px-3"
            } ${
              pathname.startsWith("/admin/sales")
                ? "bg-primary text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span
              className={`flex items-center ${desktopOpen ? "gap-2" : "gap-2 lg:gap-0"}`}
            >
              <ShoppingCart size={18} />
              <span className={desktopOpen ? "" : "lg:hidden"}>Ventas</span>
            </span>
            <span className={desktopOpen ? "" : "lg:hidden"}>
              {salesOpen ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </span>
            {!desktopOpen && (
              <span className="hidden lg:block pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap rounded-md bg-gray-900 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Ventas
              </span>
            )}
          </button>

          {salesOpen && (desktopOpen || mobileOpen) && (
            <div className="ml-3 mt-1 space-y-1">
              <Link
                href="/admin/sales"
                className={`block px-3 py-2 rounded-md transition ${
                  pathname === "/admin/sales"
                    ? "bg-primary/20 text-primary font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Comprobantes
              </Link>
              <Link
                href="/admin/sales/quotations"
                className={`block px-3 py-2 rounded-md transition ${
                  pathname.startsWith("/admin/sales/quotations")
                    ? "bg-primary/20 text-primary font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Cotizaciones
              </Link>
              <Link
                href="/admin/sales/orders"
                className={`block px-3 py-2 rounded-md transition ${
                  pathname.startsWith("/admin/sales/orders")
                    ? "bg-primary/20 text-primary font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Pedidos de Venta
              </Link>
            </div>
          )}

          {salesOpen && !desktopOpen && !mobileOpen && (
            <div className="hidden lg:block absolute left-full top-0 ml-2 w-52 bg-white border border-gray-200 rounded-md shadow-lg p-2 z-50">
              <Link
                href="/admin/sales"
                onClick={() => setSalesOpen(false)}
                className={`block px-3 py-2 rounded-md transition ${
                  pathname === "/admin/sales"
                    ? "bg-primary/20 text-primary font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Comprobantes
              </Link>
              <Link
                href="/admin/sales/quotations"
                onClick={() => setSalesOpen(false)}
                className={`block px-3 py-2 rounded-md transition ${
                  pathname.startsWith("/admin/sales/quotations")
                    ? "bg-primary/20 text-primary font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Cotizaciones
              </Link>
              <Link
                href="/admin/sales/orders"
                onClick={() => setSalesOpen(false)}
                className={`block px-3 py-2 rounded-md transition ${
                  pathname.startsWith("/admin/sales/orders")
                    ? "bg-primary/20 text-primary font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Pedidos de Venta
              </Link>
            </div>
          )}
        </div>

        {/* �📦 Inventario con submenús */}
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

        <div className="relative">
          <button
            onClick={() => setReportsOpen(!reportsOpen)}
            title={!desktopOpen ? "Reportes" : undefined}
            className={`group relative flex w-full items-center py-2 rounded-md transition ${
              desktopOpen ? "justify-between px-3" : "lg:justify-center lg:px-2 px-3"
            } ${
              pathname.startsWith("/admin/reports")
                ? "bg-primary text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span
              className={`flex items-center ${desktopOpen ? "gap-2" : "gap-2 lg:gap-0"}`}
            >
              <FileText size={18} />
              <span className={desktopOpen ? "" : "lg:hidden"}>Reportes</span>
            </span>
            <span className={desktopOpen ? "" : "lg:hidden"}>
              {reportsOpen ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </span>
            {!desktopOpen && (
              <span className="hidden lg:block pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap rounded-md bg-gray-900 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Reportes
              </span>
            )}
          </button>

          {reportsOpen && (desktopOpen || mobileOpen) && (
            <div className="ml-3 mt-1 space-y-1">
              <Link
                href="/admin/reports/stock-by-warehouse"
                className={`block px-3 py-2 rounded-md transition ${
                  pathname === "/admin/reports/stock-by-warehouse"
                    ? "bg-primary/20 text-primary font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Stock por Almacen
              </Link>
              <Link
                href="/admin/reports/stock-by-warehouses"
                className={`block px-3 py-2 rounded-md transition ${
                  pathname === "/admin/reports/stock-by-warehouses"
                    ? "bg-primary/20 text-primary font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Stock Comparativo
              </Link>
              <Link
                href="/admin/reports/movements"
                className={`block px-3 py-2 rounded-md transition ${
                  pathname === "/admin/reports/movements"
                    ? "bg-primary/20 text-primary font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Movimientos del Almacen
              </Link>
              <Link
                href="/admin/reports/kardex"
                className={`block px-3 py-2 rounded-md transition ${
                  pathname === "/admin/reports/kardex"
                    ? "bg-primary/20 text-primary font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Kardex de Inventario
              </Link>
            </div>
          )}

          {reportsOpen && !desktopOpen && !mobileOpen && (
            <div className="hidden lg:block absolute left-full top-0 ml-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg p-2 z-50">
              <Link
                href="/admin/reports/stock-by-warehouse"
                onClick={() => setReportsOpen(false)}
                className={`block px-3 py-2 rounded-md transition ${
                  pathname === "/admin/reports/stock-by-warehouse"
                    ? "bg-primary/20 text-primary font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Stock por Almacen
              </Link>
              <Link
                href="/admin/reports/stock-by-warehouses"
                onClick={() => setReportsOpen(false)}
                className={`block px-3 py-2 rounded-md transition ${
                  pathname === "/admin/reports/stock-by-warehouses"
                    ? "bg-primary/20 text-primary font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Stock Comparativo
              </Link>
              <Link
                href="/admin/reports/movements"
                onClick={() => setReportsOpen(false)}
                className={`block px-3 py-2 rounded-md transition ${
                  pathname === "/admin/reports/movements"
                    ? "bg-primary/20 text-primary font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Movimientos del Almacen
              </Link>
              <Link
                href="/admin/reports/kardex"
                onClick={() => setReportsOpen(false)}
                className={`block px-3 py-2 rounded-md transition ${
                  pathname === "/admin/reports/kardex"
                    ? "bg-primary/20 text-primary font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Kardex de Inventario
              </Link>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setAdministrationOpen(!administrationOpen)}
            title={!desktopOpen ? "Administración" : undefined}
            className={`group relative flex w-full items-center py-2 rounded-md transition ${
              desktopOpen ? "justify-between px-3" : "lg:justify-center lg:px-2 px-3"
            } ${
              pathname.startsWith("/admin/administration")
                ? "bg-primary text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span
              className={`flex items-center ${desktopOpen ? "gap-2" : "gap-2 lg:gap-0"}`}
            >
              <Settings size={18} />
              <span className={desktopOpen ? "" : "lg:hidden"}>Administración</span>
            </span>
            <span className={desktopOpen ? "" : "lg:hidden"}>
              {administrationOpen ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </span>
            {!desktopOpen && (
              <span className="hidden lg:block pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap rounded-md bg-gray-900 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Administración
              </span>
            )}
          </button>

          {administrationOpen && (desktopOpen || mobileOpen) && (
            <div className="ml-3 mt-1 space-y-1">
              <Link
                href="/admin/administration/configuration"
                className={`block px-3 py-2 rounded-md transition ${
                  pathname === "/admin/administration/configuration"
                    ? "bg-primary/20 text-primary font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Configuración
              </Link>
              <Link
                href="/admin/sales/series"
                className={`block px-3 py-2 rounded-md transition ${
                  pathname.startsWith("/admin/sales/series")
                    ? "bg-primary/20 text-primary font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Series y correlativos
              </Link>
              {isAdmin && (
                <Link
                  href="/admin/administration/users"
                  className={`block px-3 py-2 rounded-md transition ${
                    pathname.startsWith("/admin/administration/users")
                      ? "bg-primary/20 text-primary font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Usuarios
                </Link>
              )}
            </div>
          )}

          {administrationOpen && !desktopOpen && !mobileOpen && (
            <div className="hidden lg:block absolute left-full top-0 ml-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg p-2 z-50">
              <Link
                href="/admin/administration/configuration"
                onClick={() => setAdministrationOpen(false)}
                className={`block px-3 py-2 rounded-md transition ${
                  pathname === "/admin/administration/configuration"
                    ? "bg-primary/20 text-primary font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Configuración
              </Link>
              <Link
                href="/admin/sales/series"
                onClick={() => setAdministrationOpen(false)}
                className={`block px-3 py-2 rounded-md transition ${
                  pathname.startsWith("/admin/sales/series")
                    ? "bg-primary/20 text-primary font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Series y correlativos
              </Link>
              {isAdmin && (
                <Link
                  href="/admin/administration/users"
                  onClick={() => setAdministrationOpen(false)}
                  className={`block px-3 py-2 rounded-md transition ${
                    pathname.startsWith("/admin/administration/users")
                      ? "bg-primary/20 text-primary font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Usuarios
                </Link>
              )}
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}
