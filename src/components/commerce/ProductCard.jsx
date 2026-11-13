'use client';
import Link from 'next/link';
import { ShoppingCart, Check, Package } from 'lucide-react';
import CatalogImage from '@/components/storefront/CatalogImage';
import { productOffer } from '@/lib/commerce/catalog.mjs';
import { useCart } from './CartProvider';
import { hasPrice, money } from '@/lib/commerce/cart.mjs';
export default function ProductCard({ product }) {
    const { add, ready, store, items } = useCart();
    const added = items.some(item => item.id === product.id);
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
        <span className="sf-saving">{offer ? `Ahorras ${money(offer.savings)}` : ''}</span>
      </div>
      <span className="sf-availability"><Package size={13}/>{unavailable ? 'No disponible' : product.availability === 'available' ? 'Disponible para cotizar' : 'Consultar disponibilidad'}</span>
      <span className="sf-reference">{store.mode === 'demo' ? 'Precio de demostración' : 'Precio por ' + product.unit}</span>
      <button disabled={!ready || unavailable} aria-label={`${unavailable ? 'No disponible' : added ? 'Agregar otro a cotización' : 'Agregar al carrito de cotización'}: ${product.name}`} className={`sf-add-button${added ? ' is-added' : ''}`} onClick={() => add(product.id)}>
        {added ? <Check size={18} aria-hidden="true"/> : <ShoppingCart size={18} aria-hidden="true"/>}
        <span className="sf-add-label">{unavailable ? 'No disponible' : added ? 'Agregar otro' : 'Agregar a cotización'}</span>
        <span className="sf-add-label-short">{unavailable ? 'No disponible' : added ? 'Agregar otro' : 'Cotizar'}</span>
      </button>
    </div>
  </article>;
}
