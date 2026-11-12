import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Headphones, ClipboardList, PackageCheck, Truck } from 'lucide-react';
import { createWebsiteDocument, visiblePromotions } from '@/lib/website/content.mjs';
import ProductArt from './ProductArt';
import StoreHero from './StoreHero';
import ProductCard from '@/components/commerce/ProductCard';

export default function StoreHome({ store, categories, products, content = createWebsiteDocument(store.name), now }) {
  const promotions = visiblePromotions(content, now);
  return <>
    
    <StoreHero banners={content.banners}/>
    {content.sections.filter(section => section.enabled).map(section => {
      if (section.type === 'benefits') return <div key={section.type} className="sf-container sf-benefit-strip" aria-label={section.title}>
        {[[Headphones, 'Atención cercana', 'Asesoría para elegir mejor'], [ClipboardList, 'Cotiza a tu medida', 'Una lista, muchas soluciones'], [PackageCheck, 'Todo para tu obra', 'Materiales y herramientas'], [Truck, 'Coordina tu entrega', 'Consulta cobertura y condiciones']].map(([Icon, title, text]) => <div key={title}>
        <Icon size={27} strokeWidth={1.5}/>
        <span>
          <strong>{title}</strong>
          <small>{text}</small>
        </span>
      </div>)}
      </div>;

      if (section.type === 'categories') return <section key={section.type} className="sf-container sf-section">
        
      <div className="sf-section-heading">
        <div>
          <span className="sf-eyebrow">ENCUENTRA LO QUE NECESITAS</span>
          <h2>{section.title}</h2>
        </div>
        <Link href="/catalog">Ver categorías 
          <ArrowRight size={17}/>
        </Link>
      </div>
        
      <div className="sf-categories">{categories.map(category => <Link href={`/catalog?category=${category.id}`} key={category.id} className="sf-category">
          <div>
            <ProductArt type={category.icon}/>
          </div>
          <h3>{category.name}</h3>
          <span>{category.description}</span>
        </Link>)}</div>
      
    </section>;

      if (section.type === 'featured') return <section key={section.type} className="sf-container sf-section">
        
      <div className="sf-section-heading">
        <div>
          <span className="sf-eyebrow">PREPARA TU CAJA DE HERRAMIENTAS</span>
          <h2>{section.title}</h2>
          <p>Explora una selección ilustrativa de nuestro futuro catálogo.</p>
        </div>
        <Link href="/catalog">Ver todos los productos 
          <ArrowRight size={17}/>
        </Link>
      </div>
        
      <div className="sf-product-grid">{products.slice(0, 4).map(product => <ProductCard key={product.id} product={product}/>)}</div>
      
    </section>;

      if (section.type === 'promotions') return <div key={section.type} aria-label={section.title}>
        {promotions.map(promotion => <section key={promotion.id} className="sf-container sf-project-banner">
          
        <div>
          <span className="sf-eyebrow">{promotion.eyebrow}</span>
          <h2>{promotion.title}</h2>
          <p>{promotion.description}</p>
          <Link href={promotion.href} className="sf-button sf-button-orange">{promotion.ctaLabel}
            <ArrowRight size={18}/>
          </Link>
            {promotion.productIds.length > 0 && <div className="sf-promotion-products">{products.filter(product => promotion.productIds.includes(product.id)).map(product => <Link key={product.id} href={`/catalog/${product.id}`}>{product.name} 
              <ArrowUpRight size={13}/>
            </Link>)}</div>}
          
        </div>
        <div className="sf-project-art">
          <ProductArt type="helmet"/>
          <ProductArt type="brick"/>
        </div>
        
      </section>)}
      </div>;

      if (section.type === 'about') return <section key={section.type} className="sf-container sf-section sf-about-strip">
        
      <span className="sf-eyebrow">{store.name} · {store.location}</span>
      <h2>{section.title}</h2>
      <p>Queremos acompañarte con una experiencia sencilla: encuentra tus materiales, organiza tu lista y consulta con un asesor.</p>
      <Link href="/about">Conoce nuestra propuesta 
        <ArrowUpRight size={18}/>
      </Link>
      
    </section>;
      return null;
    })}
  </>;
}
