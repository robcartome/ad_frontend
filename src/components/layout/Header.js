"use client";
export default function Header() {
  return (
    <header className="h-14 bg-white border-b flex items-center justify-between px-6 shadow-sm">
      <h1 className="font-semibold text-gray-700">Panel de Administración</h1>
      <div className="text-sm text-gray-500">Usuario: admin</div>
    </header>
  );
}