"use client";
import { Menu } from "lucide-react";
import { useState } from "react";
import Sidebar from "./Sidebar";

export default function Topbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="h-16 bg-white border-b shadow-sm flex items-center justify-between px-4 md:px-6">
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-medium text-gray-800">Panel de Control</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">admin@ferre.com</span>
          <div className="w-8 h-8 bg-gray-200 rounded-full" />
        </div>
      </header>

      {/* Sidebar Mobile */}
      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            onClick={() => setOpen(false)}
            className="flex-1 bg-black bg-opacity-50"
          />
          <div className="w-64 bg-white shadow-md h-full">
            <Sidebar />
          </div>
        </div>
      )}
    </>
  );
}
