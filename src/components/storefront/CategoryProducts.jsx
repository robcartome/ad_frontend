'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Grid2X2, ShoppingBag } from 'lucide-react';
import { categoryProducts } from '@/lib/commerce/catalog.mjs';
import ProductCard from '@/components/commerce/ProductCard';
import CategoryIcon from './CategoryIcon';
import HorizontalRail from './HorizontalRail';

export default function CategoryProducts({ title, categories, products, demo = false, cta }) {
  const [categoryId, setCategoryId] = useState(null);
  const selected = categories.find(category => category.id === categoryId);
  const visible = categoryProducts(products, categoryId);

  return <section className="sf-container sf-section sf-category-products" aria-label={title}>
    <div className="sf-section-heading">
      <div><span className="sf-eyebrow">ENCUENTRA TU PRÓXIMO PROYECTO</span><h2>{title}</h2><p>{demo ? 'Selección y ofertas de demostración. Explora por categoría.' : 'Descubre ofertas disponibles y productos para cada especialidad.'}</p></div>
      <div className="sf-showcase-cta"><Link className="sf-button sf-button-orange" href={cta?.href || '/shop'}>{cta?.ctaLabel || 'Ver más productos'}<ArrowRight size={17}/></Link></div>
    </div>
    <div className="sf-category-tabs sf-horizontal-scroll" role="group" aria-label="Filtrar productos por categoría">
      <button type="button" aria-pressed={categoryId === null} onClick={() => setCategoryId(null)}><Grid2X2 size={18}/> Todos</button>
      {categories.map(category => <button key={category.id} type="button" aria-pressed={categoryId === category.id} onClick={() => setCategoryId(category.id)}><CategoryIcon type={category.icon} size={18}/>{category.name}</button>)}
    </div>
    <p className="sf-sr-only" role="status">{visible.length} productos en {selected?.name || 'todas las categorías'}</p>
    {visible.length ? <HorizontalRail key={categoryId ?? 'all'} label={`Productos de ${selected?.name || 'todas las categorías'}`} className="sf-product-rail">
      {visible.map(product => <ProductCard key={product.id} product={product}/>)}
    </HorizontalRail> : <div className="sf-category-empty"><ShoppingBag size={28}/><p>No hay productos para esta categoría por el momento.</p><Link href="/shop">Explorar la tienda <ArrowRight size={16}/></Link></div>}
  </section>;
}
