'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X, Search, ShoppingBag, ArrowUpRight, Hammer, MapPin } from 'lucide-react';
import { useCart } from '@/components/commerce/CartProvider';
export default function StoreHeader({ store, categories }) {
    const { count } = useCart();
    const [open, setOpen] = useState(false);
    return <>
    <div className="sf-demo">Vista de demostración · Productos y precios ilustrativos · Sin pedidos reales</div>
    <div className="sf-top">
      <div className="sf-container">
        <span>
          <MapPin size={13}/> {store.location}
        </span>
        <span>{store.announcement || 'Materiales, herramientas y soluciones para tu proyecto'}</span>
        <Link href="/contact">Hablemos de tu obra 
          <ArrowUpRight size={13}/>
        </Link>
      </div>
    </div>
    
    <header className="sf-header">
      <div className="sf-container sf-header-main">
        <Link className="sf-logo" href="/" aria-label={`${store.name}, inicio`}>
          {store.logoUrl ? <Image unoptimized src={store.logoUrl} alt={store.name} width={150} height={60} className="sf-custom-logo"/> : <span className="sf-logo-mark">
            <Hammer size={29}/>
          </span>}
          <span>
            <small>FERRETERÍA</small>
            <strong>{store.shortName}</strong>
            <em>{store.location}</em>
          </span>
        </Link>
        <form action="/catalog" className="sf-search" role="search">
          <label className="sf-sr-only" htmlFor="store-search">Buscar productos</label>
          <input id="store-search" name="q" placeholder="¿Qué necesitas para tu proyecto?" type="search" maxLength={120}/>
          <button type="submit" aria-label="Buscar">
            <Search size={21}/>
          </button>
        </form>
        <Link className="sf-header-contact" href="/contact">
          <span>¿Necesitas ayuda?</span>
          <strong>Te asesoramos 
            <ArrowUpRight size={15}/>
          </strong>
        </Link>
        <Link href="/cart" className="sf-cart-link" aria-label={`Mi cotización, ${count} unidades`}>
          <ShoppingBag size={25}/>
          <span className="sf-cart-count">{count}</span>
          <span className="sf-cart-label">Mi cotización</span>
        </Link>
        <button className="sf-menu-toggle" onClick={() => setOpen(!open)} aria-label={open ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={open} aria-controls="store-navigation">{open ? <X /> : <Menu />}</button>
      </div>
      <nav id="store-navigation" aria-label="Navegación comercial" className={`sf-nav ${open ? 'is-open' : ''}`}>
        <div className="sf-container">
          <Link className="sf-all-categories" href="/catalog" onClick={() => setOpen(false)}>
            <Menu size={18}/> Todas las categorías
          </Link>{categories.slice(0, 4).map(category => <Link key={category.id} href={`/catalog?category=${category.id}`} onClick={() => setOpen(false)}>{category.name}</Link>)}
          <Link href="/about" onClick={() => setOpen(false)}>Nosotros</Link>
          <Link href="/contact" onClick={() => setOpen(false)}>Contacto</Link>
        </div>
      </nav>
    </header>
  </>;
}
