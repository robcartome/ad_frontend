import Link from 'next/link';
import { ArrowUpRight, Hammer } from 'lucide-react';
export default function StoreFooter({ store, categories }) {
    return <footer className="sf-footer">
    <div className="sf-container sf-footer-grid">
      <div>
        <Link href="/" className="sf-footer-brand">
          <Hammer size={25}/> {store.shortName}
        </Link>
        <p>Todo gran proyecto empieza
          <br />con las herramientas correctas.
        </p>
        <span className="sf-eyebrow">{store.location}</span>
      </div>
      <div>
        <h2>Explora la tienda</h2>
        <Link href="/catalog">Todos los productos</Link>
        <Link href="/cart">Mi cotización</Link>
        <Link href="/about">Conócenos</Link>
        <Link href="/contact">Contacto y atención</Link>
      </div>
      <div>
        <h2>Para tu proyecto</h2>{categories.slice(0, 4).map(category => <Link key={category.id} href={`/catalog?category=${category.id}`}>{category.name}</Link>)}
      </div>
      <div>
        <h2>Construyamos juntos</h2>
        <p>Encuentra materiales y prepara tu lista para recibir asesoría comercial.</p>
        {store.phone && <p>Teléfono: {store.phone}</p>}
        {store.whatsapp && <p>WhatsApp: {store.whatsapp} · No activo en demo</p>}
        {store.address && <p>{store.address}</p>}
        {store.hours && <p>{store.hours}</p>}
        <Link href="/contact" className="sf-footer-cta">Consulta con un asesor 
          <ArrowUpRight size={17}/>
        </Link>
      </div>
    </div>
    <div className="sf-container sf-footer-bottom">
      <span>© {new Date().getFullYear()} {store.name}. Vista de demostración.</span>
      <Link href="/login">Acceso administrativo</Link>
      <span>Desarrollado por APUDIG</span>
    </div>
  </footer>;
}
