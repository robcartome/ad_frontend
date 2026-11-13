'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HorizontalRail({ label, className = '', children }) {
  const rail = useRef(null);
  const id = useId();
  const [position, setPosition] = useState({ start: true, end: true, overflow: false });

  useEffect(() => {
    const element = rail.current;
    function measure() {
      setPosition({
        start: element.scrollLeft <= 2,
        end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 2,
        overflow: element.scrollWidth > element.clientWidth + 2,
      });
    }
    measure();
    element.addEventListener('scroll', measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    for (const child of element.children) observer.observe(child);
    return () => { element.removeEventListener('scroll', measure); observer.disconnect(); };
  }, [children]);

  function scroll(direction) {
    const element = rail.current;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    element.scrollBy({ left: direction * element.clientWidth * 0.85, behavior: reducedMotion ? 'auto' : 'smooth' });
  }

  function keyboard(event) {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      scroll(event.key === 'ArrowLeft' ? -1 : 1);
    }
  }

  return <div className="sf-rail">
    <div ref={rail} id={id} className={`sf-horizontal-scroll ${className}`} role="region" aria-label={label} tabIndex={0} onKeyDown={keyboard}>
      {children}
    </div>
    {position.overflow && <div className="sf-rail-footer">
      <span>Desliza para explorar</span>
      <div className="sf-rail-arrows">
        <button type="button" aria-label={`Ver anteriores: ${label}`} aria-controls={id} disabled={position.start} onClick={() => scroll(-1)}><ChevronLeft size={18}/></button>
        <button type="button" aria-label={`Ver siguientes: ${label}`} aria-controls={id} disabled={position.end} onClick={() => scroll(1)}><ChevronRight size={18}/></button>
      </div>
    </div>}
  </div>;
}
