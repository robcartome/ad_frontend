'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, ClipboardList, Pause, Play, ShieldCheck } from 'lucide-react';
import { heroSliderSettings, nextSlide } from '@/lib/website/slider.mjs';
import ProductArt from './ProductArt';

export default function StoreHero({ banners, settings }) {
  const active = banners.filter(banner => banner.enabled);
  const { autoplay, intervalMs } = heroSliderSettings(settings);
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const rail = useRef(null);
  const id = useId();
  const index = Math.min(selected, Math.max(0, active.length - 1));
  const currentIndex = useRef(index);
  currentIndex.current = index;
  const running = autoplay && !paused && !hovered && !hidden && !reducedMotion && active.length > 1;

  function goTo(position) {
    const node = rail.current;
    const slide = node?.children[position];
    if (slide) node.scrollTo({ left: slide.offsetLeft - node.children[0].offsetLeft, behavior: reducedMotion ? 'instant' : 'smooth' });
  }

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const motion = () => setReducedMotion(media.matches);
    const visibility = () => setHidden(document.hidden);
    motion(); visibility();
    media.addEventListener('change', motion);
    document.addEventListener('visibilitychange', visibility);
    return () => { media.removeEventListener('change', motion); document.removeEventListener('visibilitychange', visibility); };
  }, []);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      const node = rail.current;
      const slide = node?.children[nextSlide(index, active.length)];
      if (slide) node.scrollTo({ left: slide.offsetLeft - node.children[0].offsetLeft, behavior: 'smooth' });
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [running, index, active.length, intervalMs]);

  useEffect(() => {
    const node = rail.current;
    if (!node) return;
    const resize = new ResizeObserver(() => {
      const slide = node.children[currentIndex.current];
      if (slide) node.scrollTo({ left: slide.offsetLeft - node.children[0].offsetLeft, behavior: 'instant' });
    });
    resize.observe(node);
    return () => resize.disconnect();
  }, [active.length]);

  if (!active.length) return null;
  return <section className="sf-container sf-hero" aria-label="Destacados de la tienda">
    <div className="sf-hero-carousel" role="region" aria-roledescription="carrusel" aria-label="Banners promocionales" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={event => { if (!event.target.closest('[data-slider-playback]')) setPaused(true); }}>
      <div id={id} className="sf-hero-track" ref={rail} onPointerDown={() => setPaused(true)} onScroll={() => {
        const node = rail.current;
        if (node?.children.length > 1) {
          const step = node.children[1].offsetLeft - node.children[0].offsetLeft;
          if (step) setSelected(Math.min(active.length - 1, Math.max(0, Math.round(node.scrollLeft / step))));
        }
      }}>
        {active.map((banner, position) => {
          const Heading = position === 0 ? 'h1' : 'h2';
          return <div key={banner.id} className={`sf-hero-main ${banner.imageUrl ? 'sf-hero-has-photo' : ''}`} role="group" aria-roledescription="diapositiva" aria-label={`${position + 1} de ${active.length}`} aria-hidden={position !== index} inert={position !== index}>
            <div className="sf-hero-copy">
              <span className="sf-eyebrow"><span className="sf-small-line"/>{banner.eyebrow}</span>
              <Heading className="sf-hero-title">{banner.title}</Heading>
              <p>{banner.description}</p>
              <Link href={banner.href} className="sf-button sf-button-orange">{banner.ctaLabel}<ArrowRight size={18}/></Link>
              <div className="sf-hero-note"><ShieldCheck size={17}/> A tu lado, de principio a fin</div>
            </div>
            <div className={`sf-hero-art ${banner.imageUrl ? 'sf-hero-photo' : ''}`}>
              {banner.imageUrl ? <picture>
                {banner.mobileImageUrl && <source media="(max-width: 640px)" srcSet={banner.mobileImageUrl}/>}
                <Image unoptimized src={banner.imageUrl} alt={banner.imageAlt} width={800} height={650}/>
              </picture> : <><span className="sf-art-circle"/><ProductArt type={banner.art}/><span className="sf-art-footnote">Ilustración de demostración</span></>}
            </div>
          </div>;
        })}
      </div>
      {active.length > 1 && <div className="sf-hero-controls">
        <button type="button" aria-label="Banner anterior" aria-controls={id} onClick={() => { setPaused(true); goTo(nextSlide(index, active.length, -1)); }}><ChevronLeft size={18}/></button>
        <div className="sf-hero-dots" aria-label="Seleccionar banner">{active.map((banner, position) => <button type="button" key={banner.id} aria-label={`Banner ${position + 1}: ${banner.title}`} aria-current={position === index ? 'true' : undefined} aria-controls={id} onClick={() => { setPaused(true); goTo(position); }}/>)}</div>
        <button type="button" aria-label="Banner siguiente" aria-controls={id} onClick={() => { setPaused(true); goTo(nextSlide(index, active.length)); }}><ChevronRight size={18}/></button>
        {autoplay && !reducedMotion && <button type="button" data-slider-playback aria-label={paused ? 'Reanudar reproducción automática' : 'Pausar reproducción automática'} aria-controls={id} onClick={() => setPaused(value => !value)}>{paused ? <Play size={16}/> : <Pause size={16}/>}</button>}
      </div>}
    </div>
    <div className="sf-hero-side">
      <span className="sf-eyebrow">PARA GRANDES IDEAS</span>
      <h2>Tu lista de materiales.<br/>Nuestra asesoría.</h2>
      <p>Prepara tu cotización en pocos pasos.</p>
      <ClipboardList className="sf-side-icon" strokeWidth={1}/>
      <Link href="/cart">Armar mi cotización <ArrowUpRight size={19}/></Link>
    </div>
  </section>;
}
