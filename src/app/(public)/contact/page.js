import Link from 'next/link';
import { MapPin, Clock, MessageCircle, ArrowRight } from 'lucide-react';
import { getStore } from '@/lib/storefront/store';
export const metadata = { title: 'Contacto' };
export default function ContactPage() {
    const store = getStore();
    return <div className="sf-container sf-page">
    <nav className="sf-breadcrumb" aria-label="Ruta de navegación">
      <Link href="/">Inicio</Link>
      <span>/</span>
      <span>Contacto</span>
    </nav>
    <section className="sf-info-hero">
      <span className="sf-eyebrow">CONVERSEMOS DE TU PROYECTO</span>
      <h1>La ayuda correcta
        <br />hace la diferencia.
      </h1>
      <p>Prepara tu lista de materiales y consulta precios, disponibilidad y opciones de entrega antes de confirmar tu compra.</p>
      <Link href="/catalog" className="sf-button sf-button-orange">Preparar una cotización 
        <ArrowRight size={18}/>
      </Link>
    </section>
    <div className="sf-info-cards">
      <article>
        <MapPin size={30}/>
        <h2>Visítanos</h2>
        <p>{store.address ?? `${store.location} · Dirección comercial pendiente de confirmar.`}</p>
      </article>
      <article>
        <Clock size={30}/>
        <h2>Horario de atención</h2>
        <p>{store.hours ?? 'El horario se publicará al verificar los datos de la tienda.'}</p>
      </article>
      <article>
        <MessageCircle size={30}/>
        <h2>Atención comercial</h2>
        <p>{store.phone ?? 'Teléfono y WhatsApp pendientes de verificación.'}</p>
      </article>
    </div>
    <p className="sf-callout">Vista de demostración: los canales de contacto y envío de solicitudes aún no están activos.</p>
  </div>;
}
