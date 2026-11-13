import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Headphones, ClipboardList, PackageCheck, Truck } from 'lucide-react';
import { createWebsiteDocument, visiblePromotions } from '@/lib/website/content.mjs';
import ProductArt from './ProductArt';
import StoreHero from './StoreHero';
import CategoryProducts from './CategoryProducts';
import AnnouncementSlider from './AnnouncementSlider';
import SpecialProducts from './SpecialProducts';

export default function StoreHome({ store, categories, products, content = createWebsiteDocument(store.name, products.map(product => product.id)), now }) {
  const promotions = visiblePromotions(content, now);
  return <>

    <StoreHero banners={content.banners} settings={content.heroSlider}/>
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

      if (section.type === 'announcements') return <AnnouncementSlider key={section.type} title={section.title} content={content.announcements}/>;
      if (section.type === 'specials') return <SpecialProducts key={section.type} title={section.title} document={content} products={products}/>;
      if (section.type === 'featured') return <CategoryProducts key={section.type} title={section.title} categories={categories} products={products} demo={store.mode === 'demo'} cta={content.announcements}/>;

      if (section.type === 'promotions') return <div key={section.type} aria-label={section.title}>
        {promotions.map(promotion => <section key={promotion.id} className="sf-container sf-project-banner">

        <div>
          <span className="sf-eyebrow">{promotion.eyebrow}</span>
          <h2>{promotion.title}</h2>
          <p>{promotion.description}</p>
          <Link href={promotion.href} className="sf-button sf-button-orange">{promotion.ctaLabel}
            <ArrowRight size={18}/>
          </Link>
            {promotion.productIds.length > 0 && <div className="sf-promotion-products">{products.filter(product => promotion.productIds.includes(product.id)).map(product => <Link key={product.id} href={`/shop/${product.id}`}>{product.name}
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
