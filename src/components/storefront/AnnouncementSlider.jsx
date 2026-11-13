import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { MAX_ANNOUNCEMENTS } from '@/lib/website/content.mjs';
import CatalogImage from './CatalogImage';
import HorizontalRail from './HorizontalRail';

export default function AnnouncementSlider({ title, content }) {
  const items = content.items.filter(item => item.enabled).slice(0, MAX_ANNOUNCEMENTS);
  if (!items.length) return null;

  return <section className="sf-container sf-section sf-announcements" aria-label={title}>
    <header className="sf-showcase-heading"><span className="sf-eyebrow">IDEAS, NOVEDADES Y OPORTUNIDADES</span><h2>{title}</h2></header>
    <HorizontalRail label="Avisos promocionales" className="sf-announcement-rail">
      {items.map(item => <article className="sf-announcement-card" key={item.id}>
        <Link href={item.href} className="sf-announcement-image" aria-label={item.title}>
          <CatalogImage src={item.imageUrl} alt={item.imageAlt || item.title} type={item.art}/>
          {item.badge && <span className={`sf-announcement-badge ${item.badgePosition}`}>{item.badge}</span>}
        </Link>
        <h3><Link href={item.href}>{item.title}</Link></h3>
      </article>)}
    </HorizontalRail>
    <div className="sf-showcase-cta"><Link href={content.href} className="sf-button sf-button-orange">{content.ctaLabel}<ArrowRight size={18}/></Link></div>
  </section>;
}
