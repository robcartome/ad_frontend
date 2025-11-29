import Link from 'next/link';
// Importamos los iconos de Lucide React
import { Home, ShoppingCart, User } from 'lucide-react';

export default function PublicLayout({ children }) {
  // Paleta de colores sugerida: Azul corporativo y Rojo/Naranja para acento ferretero
  const primaryColor = 'text-gray-600';
  const secondaryColor = 'text-green-600';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50"> {/* Fondo general sutil */}

      {/* 🛠️ HEADER: Barra de Navegación Principal */}
      <header className="sticky top-0 z-50 bg-white shadow-lg border-b border-blue-100">
        <nav className="container mx-auto px-4 sm:px-0 sm:py-2 flex justify-between items-center">

          {/* Nombre de la Empresa Usuario */}
          <Link href="/" className="flex items-center space-x-3"> {/* Aumenté un poco el espacio */}
            {/* Usamos el icono Home de Lucide */}
            <Home className={`w-6 h-6 ${secondaryColor} sm:w-8 sm:h-8`} />
            <h1 className={`text-xl sm:text-3xl font-bold ${primaryColor}`}>
              Mega Ferretero Tolentino
            </h1>
          </Link>

          {/* Elementos de Navegación o Iconos de Usuario/Carrito */}
          <div className="flex items-center space-x-4 sm:space-x-6">

            {/* Carrito (ShoppingCart) */}
            <Link href="/cart" className={`p-2 rounded-full text-gray-700 hover:bg-gray-100 transition-colors hover:${secondaryColor}`}>
                <ShoppingCart className="w-6 h-6" />
            </Link>

            {/* Usuario/Login (User) */}
            <Link href="/login" className={`p-2 rounded-full text-gray-700 hover:bg-gray-100 transition-colors hover:${primaryColor}`}>
                <User className="w-6 h-6" />
            </Link>

            {/* Enlace de Admin (oculto en público, pero puedes descomentar si es necesario) */}
            {/* <Link href="/admin" className="text-sm font-medium text-gray-700 hover:text-blue-600 hidden md:inline">Panel</Link> */}
          </div>
        </nav>
      </header>

      {/* 📦 MAIN: Contenido de la Página */}
      <main className="flex-1 py-3 overflow-y-auto">
        {children}
      </main>

      {/* 📝 FOOTER: Pie de Página y Marca Desarrolladora */}
      <footer className="bg-gray-800 py-6 text-center text-white">
        <div className="container mx-auto px-4">

          {/* Derechos de la Empresa Usuaria */}
          <p className="text-sm">
            © 2025 Mega Ferretero Tolentino — Todos los derechos reservados
          </p>

          {/* Marca del Desarrollador (ApuDig) - Más sutil y profesional */}
          <div className="mt-2 pt-2 border-t border-gray-700">
            {/* La marca ApuDig sigue siendo un Link sutil */}
            <Link href="https://apudig.com" target="_blank" rel="noopener noreferrer" className="text-xs font-light text-blue-400 hover:text-blue-300 transition-colors">
              Desarrollado por ApuDig
            </Link>
          </div>

        </div>
      </footer>
    </div>
  );
}