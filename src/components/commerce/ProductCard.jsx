'use client';
import Link from 'next/link';
import { Plus, Check, Package } from 'lucide-react';
import { useState } from 'react';
import CatalogImage from '@/components/storefront/CatalogImage';
import { productOffer } from '@/lib/commerce/catalog.mjs';
import { useCart } from './CartProvider';
import { hasPrice, money } from '@/lib/commerce/cart.mjs';
export default function ProductCard({ product }) {
    const { add, ready, store } = useCart();
    const [added, setAdded] = useState(false);
    const offer = productOffer(product);
    const unavailable = product.availability === 'unavailable';
    return <article className="sf-product-card">
    <Link href={`/shop/${product.id}`} className="sf-product-image" aria-label={`Ver ${product.name}`}>
      <span className="sf-card-badges">{offer && <span className="sf-discount">−{offer.percent}%</span>}{product.badge && <span className="sf-product-badge">{product.badge}</span>}</span>
      {store.mode === 'demo' && <span className="sf-product-tag">DEMO</span>}
      <CatalogImage src={product.imageUrl} alt={product.imageAlt || product.name} type={product.image}/>
      {!product.imageUrl && <span className="sf-image-caption">Imagen ilustrativa</span>}
    </Link>
    <div className="sf-product-info">
      <span className="sf-product-brand">{product.brand}</span>
      <Link href={`/shop/${product.id}`} className="sf-product-name">{product.name}</Link>
      <span className="sf-unit">Venta por {product.unit}</span>
      <div className="sf-card-pricing">
        <span className="sf-previous-price">{offer && <><span className="sf-sr-only">Precio anterior </span><del>{money(product.originalPrice)}</del></>}</span>
        <div className="sf-product-price">{hasPrice(product) ? money(product.price) : <span className="sf-consult-price">Consultar precio</span>}</div>
        <span className="sf-saving">{offer ? `Ahorras ${money(offer.savings)}` : 'Cotiza según tu proyecto'}</span>
      </div>
      <span className="sf-availability"><Package size={13}/>{unavailable ? 'No disponible' : product.availability === 'available' ? 'Disponible para cotizar' : 'Consultar disponibilidad'}</span>
      <span className="sf-reference">{store.mode === 'demo' ? 'Precio de demostración' : 'Precio por ' + product.unit}</span>
      <button disabled={!ready || unavailable} aria-label={`${added ? 'Agregar otro' : 'Agregar a cotización'}: ${product.name}`} className="sf-add-button" onClick={() => { add(product.id); setAdded(true); }}>{added ? <Check size={17}/> : <Plus size={17}/>} {unavailable ? 'No disponible' : added ? 'Agregar otro' : 'Agregar a cotización'}</button>
    </div>
  </article>;
}
