import Link from "@/components/feedback/LoadingLink";
import { MapPin, Clock, MessageCircle, ArrowRight } from "lucide-react";
import { getStore } from "@/lib/storefront/store";
import { emailHref, phoneHref } from "@/lib/website/contact.mjs";
export const metadata = { title: "Contacto" };
export default async function ContactPage() {
  const store = await getStore();
  return (
    <div className="sf-container sf-page">
      <nav className="sf-breadcrumb" aria-label="Ruta de navegación">
        <Link href="/">Inicio</Link>
        <span>/</span>
        <span>Contacto</span>
      </nav>
      <section className="sf-info-hero">
        <span className="sf-eyebrow">CONVERSEMOS DE TU PROYECTO</span>
        <h1>
          La ayuda correcta
          <br />
          hace la diferencia.
        </h1>
        <p>
          Consulta nuestros productos y los datos de contacto de la empresa.
        </p>
        <Link href="/shop" className="sf-button sf-button-orange">
          Ver productos
          <ArrowRight size={18} />
        </Link>
      </section>
      <div className="sf-info-cards">
        <article>
          <MapPin size={30} />
          <h2>Visítanos</h2>
          <p>
            {store.address ??
              `${store.location} · Dirección comercial pendiente de confirmar.`}
          </p>
        </article>
        <article>
          <Clock size={30} />
          <h2>Horario de atención</h2>
          <p>
            {store.hours ??
              "El horario se publicará al verificar los datos de la tienda."}
          </p>
        </article>
        <article>
          <MessageCircle size={30} />
          <h2>Atención comercial</h2>
          <p>
            {phoneHref(store.phone) ? (
              <a href={phoneHref(store.phone)}>{store.phone}</a>
            ) : (
              store.phone || "Teléfono pendiente de verificación."
            )}
          </p>
          {store.secondaryPhone && (
            <p>
              {phoneHref(store.secondaryPhone) ? (
                <a href={phoneHref(store.secondaryPhone)}>
                  {store.secondaryPhone}
                </a>
              ) : (
                store.secondaryPhone
              )}
            </p>
          )}
          <p>
            {emailHref(store.email) ? (
              <a href={emailHref(store.email)}>{store.email}</a>
            ) : (
              "Correo comercial por confirmar."
            )}
          </p>
        </article>
      </div>
      <p className="sf-callout">
        Los datos de contacto corresponden a la última revisión publicada.
        Las cotizaciones comerciales estarán disponibles próximamente.
      </p>
    </div>
  );
}
