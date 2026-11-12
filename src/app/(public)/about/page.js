import Link from 'next/link';
import { ArrowRight, Headphones, ClipboardList, Hammer } from 'lucide-react';
import { getStore } from '@/lib/storefront/store';
export const metadata = { title: 'Nosotros' };
export default function AboutPage() {
    const store = getStore();
    return <div className="sf-container sf-page">
    <nav className="sf-breadcrumb" aria-label="Ruta de navegación">
      <Link href="/">Inicio</Link>
      <span>/</span>
      <span>Nosotros</span>
    </nav>
    <section className="sf-info-hero">
      <span className="sf-eyebrow">{store.name} · {store.location}</span>
      <h1>Detrás de cada obra,
        <br />hay una gran idea.
      </h1>
      <p>Una tienda pensada para ayudarte a encontrar materiales, comparar opciones y organizar lo que necesitas para tu próximo proyecto.</p>
      <Link href="/shop" className="sf-button sf-button-dark">Explorar el catálogo
        <ArrowRight size={18}/>
      </Link>
    </section>
    <section className="sf-info-cards">{[[Hammer, 'Soluciones para construir', 'Herramientas, materiales e instalaciones en un catálogo fácil de explorar.'], [Headphones, 'Atención que orienta', 'Consulta las características y condiciones comerciales con un asesor.'], [ClipboardList, 'Cotizaciones sencillas', 'Reúne tus productos en una lista y prepara una solicitud con cantidades y unidades.']].map(([Icon, title, text]) => <article key={title}>
        <Icon size={32}/>
        <h2>{title}</h2>
        <p>{text}</p>
      </article>)}</section>
    <p className="sf-callout">Esta presentación es de demostración. La historia, fotografías y datos oficiales de la empresa se incorporarán con contenido autorizado.</p>
  </div>;
}
