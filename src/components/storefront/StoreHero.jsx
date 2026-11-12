'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight, ClipboardList, ShieldCheck } from 'lucide-react';
import ProductArt from './ProductArt';

export default function StoreHero({ banners }) {
  const [selected, setSelected] = useState(0);
  const active = banners.filter(banner => banner.enabled);
  const banner = active[Math.min(selected, active.length - 1)];
  if (!banner) return null;

  return <section className="sf-container sf-hero">
    
    <div className="sf-hero-main">
      
      <div className="sf-hero-copy">
        
        <span className="sf-eyebrow">
          <span className="sf-small-line"/>{banner.eyebrow}
        </span>
        
        <h1>{banner.title}</h1>
        
        <p>{banner.description}</p>
        
        <Link href={banner.href} className="sf-button sf-button-dark">{banner.ctaLabel}
          <ArrowRight size={18}/>
        </Link>
        
        <div className="sf-hero-note">
          <ShieldCheck size={17}/> A tu lado, de principio a fin
        </div>
        {active.length > 1 && <div className="sf-banner-controls" aria-label="Seleccionar banner">
          {active.map((item, index) => <button key={item.id} type="button" aria-label={`Banner ${index + 1}: ${item.title}`} aria-pressed={index === Math.min(selected, active.length - 1)} onClick={() => setSelected(index)}>{index + 1}</button>)}
        </div>}
      
      </div>
      
      <div className={`sf-hero-art ${banner.imageUrl ? 'sf-hero-photo' : ''}`}>
        {banner.imageUrl ? <picture>
          {banner.mobileImageUrl && <source media="(max-width: 640px)" srcSet={banner.mobileImageUrl}/>}
          
          <Image unoptimized src={banner.imageUrl} alt={banner.imageAlt} width={800} height={650}/>
        
        </picture> : <>
          <span className="sf-art-circle"/>
          <ProductArt type={banner.art}/>
          <span className="sf-art-footnote">Ilustración de demostración</span>
        </>}
      </div>
    </div>
    
    <div className="sf-hero-side">
      
      <span className="sf-eyebrow">PARA GRANDES IDEAS</span>
      
      <h2>Tu lista de materiales.
        <br/>Nuestra asesoría.
      </h2>
      
      <p>Prepara tu cotización en pocos pasos.</p>
      
      <ClipboardList className="sf-side-icon" strokeWidth={1}/>
      
      <Link href="/cart">Armar mi cotización 
        <ArrowUpRight size={19}/>
      </Link>
    </div>
  </section>;
}
