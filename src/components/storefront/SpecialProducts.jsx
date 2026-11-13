import { specialProducts } from '@/lib/website/content.mjs';
import ProductCard from '@/components/commerce/ProductCard';
import HorizontalRail from './HorizontalRail';

export default function SpecialProducts({ title, document, products }) {
  const selected = specialProducts(document, products);
  if (!selected.length) return null;
  return <section className="sf-container sf-section sf-special-products" aria-label={title}>
    <header className="sf-showcase-heading"><span className="sf-eyebrow">UNA SELECCIÓN PARA TI</span><h2>{title}</h2></header>
    <HorizontalRail label={title} className="sf-product-rail">
      {selected.map(product => <ProductCard key={product.id} product={product}/>)}
    </HorizontalRail>
  </section>;
}
