'use client';
import { useId } from 'react';

export default function FilterRange({ min, max, ceiling, onChange }) {
  const id = useId();
  const upper = Math.max(ceiling, Number(max) || 0, Number(min) || 0, 1);
  const invalid = min !== '' && max !== '' && Number(min) > Number(max);
  return <fieldset className="sf-price-range"><legend className="sf-sr-only">Rango de precio en soles</legend>
    <div className="sf-price-inputs">
      <label htmlFor={`${id}-min`}>Desde S/<input id={`${id}-min`} type="number" min="0" step="0.01" value={min} placeholder="0" onChange={event => onChange({ min: event.target.value, max })}/></label>
      <span aria-hidden="true">—</span>
      <label htmlFor={`${id}-max`}>Hasta S/<input id={`${id}-max`} type="number" min="0" step="0.01" value={max} placeholder={String(ceiling)} onChange={event => onChange({ min, max: event.target.value })}/></label>
    </div>
    <label className="sf-range-label" htmlFor={`${id}-lower`}>Precio mínimo<input id={`${id}-lower`} type="range" min="0" max={upper} step="0.01" value={min === '' ? 0 : min} onChange={event => onChange({ min: event.target.value, max: max !== '' && Number(max) < Number(event.target.value) ? event.target.value : max })}/></label>
    <label className="sf-range-label" htmlFor={`${id}-upper`}>Precio máximo<input id={`${id}-upper`} type="range" min="0" max={upper} step="0.01" value={max === '' ? upper : max} onChange={event => onChange({ min: min !== '' && Number(min) > Number(event.target.value) ? event.target.value : min, max: event.target.value })}/></label>
    {invalid && <p role="alert" className="sf-price-error">El precio mínimo debe ser menor o igual al máximo.</p>}
  </fieldset>;
}
