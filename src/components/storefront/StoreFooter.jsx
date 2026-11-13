import Link from 'next/link';
import { ArrowUpRight, Clock3, Hammer, Headphones, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { SOCIAL_NETWORKS, emailHref, phoneHref, socialLinks } from '@/lib/website/contact.mjs';
import SocialIcon from './SocialIcon';

export default function StoreFooter({ store, categories }) {
  const phones = [...new Set([store.phone, store.secondaryPhone].filter(Boolean))];
  const networks = socialLinks(store);
  const email = emailHref(store.email);
  const whatsapp = store.mode !== 'demo' && /^\d{8,15}$/.test(store.whatsapp ?? '') ? `https://wa.me/${store.whatsapp}` : null;

  return <footer className="sf-footer">
    <div className="sf-footer-service-strip"><div className="sf-container"><Headphones size={24} aria-hidden="true"/><div><strong>Estamos para ayudarte a construir</strong><span>Consulta productos, prepara tu lista y recibe orientación comercial.</span></div><Link href="/contact">Hablemos de tu proyecto <ArrowUpRight size={17}/></Link></div></div>
    <div className="sf-container sf-footer-grid">
      <div className="sf-footer-company">
        <Link href="/" className="sf-footer-brand"><Hammer size={25} aria-hidden="true"/>{store.shortName}</Link>
        <p>Materiales, herramientas y soluciones para llevar tus ideas a la obra.</p>
        <div className="sf-footer-detail"><MapPin size={17} aria-hidden="true"/><span>{store.address || store.location || 'Dirección por confirmar'}</span></div>
        <div className="sf-footer-detail"><Clock3 size={17} aria-hidden="true"/><span>{store.hours || 'Horario de atención por confirmar'}</span></div>
      </div>
      <div>
        <h2>Atención al cliente</h2>
        <ul className="sf-footer-contacts">
          {phones.length ? phones.map((phone, index) => <li key={phone}><Phone size={18} aria-hidden="true"/><div><small>{index === 0 ? 'Atención comercial' : 'Línea adicional'}</small>{phoneHref(phone) ? <a href={phoneHref(phone)}>{phone}</a> : <span>{phone}</span>}</div></li>) : <li><Phone size={18} aria-hidden="true"/><div><small>Atención comercial</small><span>Teléfonos por confirmar</span></div></li>}
          <li><Mail size={18} aria-hidden="true"/><div><small>Escríbenos</small>{email ? <a href={email}>{store.email}</a> : <span>Correo por confirmar</span>}</div></li>
          {store.whatsapp && <li><MessageCircle size={18} aria-hidden="true"/><div><small>WhatsApp comercial</small>{whatsapp ? <a href={whatsapp} target="_blank" rel="noopener noreferrer">{store.whatsapp}</a> : <span>{store.whatsapp} · No activo en demo</span>}</div></li>}
        </ul>
        <Link href="/contact" className="sf-footer-cta">Ver canales de atención <ArrowUpRight size={16}/></Link>
      </div>
      <div>
        <h2>Conoce la tienda</h2>
        <Link href="/about">Nosotros</Link>
        <Link href="/contact">Contacto y atención</Link>
        <Link href="/shop">Todos los productos</Link>
        <Link href="/cart">Mi cotización</Link>
        <h2 className="sf-footer-subheading">Para tu proyecto</h2>
        {categories.slice(0, 3).map(category => <Link key={category.id} href={`/shop?${new URLSearchParams({ category: category.id })}`}>{category.name}</Link>)}
      </div>
      <div className="sf-footer-follow">
        <h2>Sigamos en contacto</h2>
        <p>Encuentra novedades, ideas y productos para tu próximo proyecto en nuestras redes.</p>
        {networks.length ? <div className="sf-social-links" aria-label="Redes sociales">{networks.map(network => <a key={network.id} href={network.href} target="_blank" rel="noopener noreferrer" aria-label={`${store.name} en ${network.label}`} title={network.label}><SocialIcon network={network.id}/></a>)}</div> : store.mode === 'demo' ? <><div className="sf-social-links sf-social-placeholders">{SOCIAL_NETWORKS.map(network => <span key={network.id} role="img" aria-label={`${network.label}: enlace por confirmar`} title={`${network.label}: enlace por confirmar`}><SocialIcon network={network.id}/></span>)}</div><small className="sf-footer-placeholder-note">Redes sociales por confirmar.</small></> : <p>Los perfiles oficiales se anunciarán aquí.</p>}
        <Link href="/contact" className="sf-footer-help"><Headphones size={21} aria-hidden="true"/><span>¿Tienes alguna consulta?<strong>Conversemos <ArrowUpRight size={14}/></strong></span></Link>
      </div>
    </div>
    <div className="sf-footer-bottom"><div className="sf-container"><span>© {new Date().getFullYear()} {store.name}.{store.mode === 'demo' ? ' Vista de demostración.' : ' Todos los derechos reservados.'}</span><Link href="/login">Acceso administrativo</Link><span>Desarrollado por APUDIG</span></div></div>
  </footer>;
}
