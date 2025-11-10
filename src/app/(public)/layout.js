import Link from 'next/link';

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow sticky top-0 z-50">
        <nav className="container mx-auto flex justify-between items-center p-4">
          <Link href="/" className="text-xl font-bold text-blue-600">ApuDig</Link>
          <div className="space-x-6 text-gray-700">
            <a href="/products" className="hover:text-blue-600">Productos</a>
            <a href="/admin" className="hover:text-blue-600">Panel</a>
          </div>
        </nav>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>

      <footer className="bg-gray-100 py-4 text-center text-sm text-gray-500">
        © 2025 ApuDig — Todos los derechos reservados
      </footer>
    </div>
  );
}
