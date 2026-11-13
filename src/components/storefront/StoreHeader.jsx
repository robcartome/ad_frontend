'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Menu, X, Search, ShoppingBag, ArrowUpRight, Hammer, MapPin, ChevronRight, UsersRound, Headphones } from 'lucide-react';
import { useCart } from '@/components/commerce/CartProvider';
import CategoryIcon from './CategoryIcon';
import CategoryNavLink from './CategoryNavLink';
export default function StoreHeader({ store, categories }) {
    const { count } = useCart();
    const [open, setOpen] = useState(false);
    return <Dialog.Root open={open} onOpenChange={setOpen}>
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
        <form action="/shop" className="sf-search" role="search">
          <label className="sf-sr-only" htmlFor="store-search">Buscar productos</label>
          <input id="store-search" name="q" placeholder="¿Qué necesitas para tu proyecto?" type="search" maxLength={120}/>
          <button type="submit" aria-label="Buscar">
            <Search size={21}/>
          </button>
        </form>
        <div className="sf-header-actions">
          <Link href="/about" className="sf-header-quick-link"><UsersRound size={22} aria-hidden="true"/><span>Nosotros</span></Link>
          <Link href="/contact" className="sf-header-quick-link"><Headphones size={22} aria-hidden="true"/><span>Contacto</span></Link>
        <Link href="/cart" className="sf-cart-link" aria-label={`Mi cotización, ${count} unidades`}>
          <ShoppingBag size={25}/>
          <span className="sf-cart-count">{count}</span>
          <span className="sf-cart-label">Mi cotización</span>
        </Link>
        </div>
      </div>
      <nav id="store-navigation" aria-label="Navegación comercial" className="sf-nav">
        <div className="sf-container sf-nav-inner">
          <Dialog.Trigger asChild><button className="sf-all-categories" aria-label="Todas las categorías">
            <Menu size={18}/><span>Todas las categorías</span>
          </button></Dialog.Trigger>
          <div className="sf-categories sf-nav-categories" role="region" aria-label="Categorías de productos" tabIndex={0}>
            {categories.map(category => <CategoryNavLink key={category.id} category={category}/>)}
          </div>
        </div>
      </nav>
    </header>
    <Dialog.Portal>
      <Dialog.Overlay className="sf-drawer-overlay"/>
      <Dialog.Content className="storefront sf-category-drawer">
        <div className="sf-drawer-heading"><div><span className="sf-eyebrow">TODO PARA TU PROYECTO</span><Dialog.Title>Categorías</Dialog.Title></div><Dialog.Close asChild><button aria-label="Cerrar categorías"><X size={22}/></button></Dialog.Close></div>
        <Dialog.Description className="sf-drawer-description">Encuentra lo que necesitas para construir, renovar y reparar.</Dialog.Description>
        <nav className="sf-drawer-shortcuts" aria-label="Accesos rápidos">
          {[[ShoppingBag, '/shop', 'Productos'], [ChevronRight, '/cart', 'Mi cotización'], [UsersRound, '/about', 'Nosotros'], [Headphones, '/contact', 'Contacto']].map(([Icon, href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)}><span><Icon size={23}/></span>{label}</Link>)}
        </nav>
        <h3 className="sf-drawer-section-title">Explora por categoría</h3>
        <nav aria-label="Todas las categorías" className="sf-drawer-links">
          <Link href="/shop" onClick={() => setOpen(false)}><span className="sf-drawer-icon"><Menu size={22}/></span><span><strong>Ver todos los productos</strong><small>Explora el catálogo completo</small></span><ChevronRight size={17}/></Link>
          {categories.map(category => <Link key={category.id} href={`/shop?${new URLSearchParams({ category: category.id })}`} onClick={() => setOpen(false)}><span className="sf-drawer-icon"><CategoryIcon type={category.icon} size={22}/></span><span><strong>{category.name}</strong><small>{category.description}</small></span><ChevronRight size={17}/></Link>)}
        </nav>
        <h3 className="sf-drawer-section-title">Ayuda para tu proyecto</h3>
        <Link href="/contact" className="sf-drawer-help" onClick={() => setOpen(false)}><Headphones size={23}/><span>¿No sabes cuál elegir?<strong>Conversa con un asesor</strong></span><ArrowUpRight size={17}/></Link>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
