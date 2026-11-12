'use client';
import Link from 'next/link';
import { Plus, Check } from 'lucide-react';
import { useState } from 'react';
import ProductArt from '@/components/storefront/ProductArt';
import { useCart } from './CartProvider';
import { hasPrice, money } from '@/lib/commerce/cart.mjs';
export default function ProductCard({ product }) {
    const { add, ready } = useCart();
    const [added, setAdded] = useState(false);
    return <article className="sf-product-card">
    <Link href={`/catalog/${product.id}`} className="sf-product-image" aria-label={`Ver ${product.name}`}>
      <span className="sf-product-tag">DEMO</span>
      <ProductArt type={product.image}/>
      <span className="sf-image-caption">Imagen ilustrativa</span>
    </Link>
    <div className="sf-product-info">
      <span className="sf-product-brand">{product.brand}</span>
      <Link href={`/catalog/${product.id}`} className="sf-product-name">{product.name}</Link>
      <span className="sf-unit">Venta por {product.unit}</span>
      <div className="sf-product-price">{hasPrice(product) ? money(product.price) : <span className="sf-consult-price">Consultar precio</span>}</div>
      <span className="sf-reference">{hasPrice(product) ? 'Precio de demostración' : 'Precio por confirmar'}</span>
      <button disabled={!ready} className="sf-add-button" onClick={() => { add(product.id); setAdded(true); }}>{added ? <Check size={17}/> : <Plus size={17}/>} {added ? 'Agregar otro' : 'Agregar a cotización'}</button>
    </div>
  </article>;
}
