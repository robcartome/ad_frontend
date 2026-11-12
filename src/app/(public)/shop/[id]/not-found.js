import Link from 'next/link';
export default function NotFound() { return <div className="sf-container sf-page sf-empty">
    <h1>Producto no encontrado</h1>
    <p>Este producto no está disponible en el catálogo de esta tienda.</p>
    <Link className="sf-button sf-button-orange" href="/shop">Volver al catálogo</Link>
  </div>; }
