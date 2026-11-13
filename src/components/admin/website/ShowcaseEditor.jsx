'use client';

import { Plus, Trash2 } from 'lucide-react';
import { ART_TYPES, BADGE_POSITIONS, MAX_ANNOUNCEMENTS, MAX_SPECIAL_PRODUCTS } from '@/lib/website/content.mjs';
import EditorialImageField from './EditorialImageField';
import { Field, Reorder } from './WebsiteFields';

export function AnnouncementsEditor({ value, onChange, errors }) {
  function update(id, patch) { onChange({ ...value, items: value.items.map(item => item.id === id ? { ...item, ...patch } : item) }); }
  function move(index, direction) {
    const items = [...value.items];
    [items[index], items[index + direction]] = [items[index + direction], items[index]];
    onChange({ ...value, items });
  }
  function add() {
    if (value.items.length >= MAX_ANNOUNCEMENTS) return;
    onChange({ ...value, items: [...value.items, { id: crypto.randomUUID(), enabled: false, title: 'Nuevo aviso', ctaLabel: 'Conoce más', description: '', badge: '', badgePosition: 'top-left', imageUrl: '', imageAlt: '', href: '/shop', art: 'drill' }] });
  }
  return <>
    <div className="we-section-intro"><div><h2>Avisos promocionales</h2><p>Hasta 8 imágenes en una fila deslizante. Personaliza el mensaje, CTA y badge sobre cada imagen.</p></div><button type="button" className="we-button we-secondary" disabled={value.items.length >= MAX_ANNOUNCEMENTS} onClick={add}><Plus size={16}/> Agregar aviso ({value.items.length}/{MAX_ANNOUNCEMENTS})</button></div>
    <p className="we-note">Este slider es independiente del banner principal. El botón general se muestra en el encabezado de productos por categoría. Sus imágenes se guardan solo en este navegador. El título, orden y visibilidad de la sección se controlan en «Secciones».</p>
    <div className="we-fields-grid"><Field label="CTA en productos por categoría" path="announcements.ctaLabel" value={value.ctaLabel} maxLength={40} onChange={ctaLabel => onChange({ ...value, ctaLabel })} errors={errors}/><Field label="Destino del CTA" path="announcements.href" value={value.href} onChange={href => onChange({ ...value, href })} errors={errors} placeholder="/shop"/></div>
    {errors.announcements && <p className="we-field-error">{errors.announcements}</p>}
    {!value.items.length && <p className="we-empty">Agrega tu primer aviso para mostrar este slider.</p>}
    {value.items.map((item, index) => {
      const path = `announcements.items.${index}`;
      const field = (key, label, extra = {}) => <Field path={`${path}.${key}`} label={label} value={item[key]} onChange={value => update(item.id, { [key]: value })} errors={errors} {...extra}/>;
      return <article className="we-item" key={item.id}>
        <header className="we-item-header"><span className="we-number">{index + 1}</span><h3>{item.title}</h3><Reorder index={index} length={value.items.length} label={item.title} onMove={move}/><button type="button" className="we-icon-button we-danger" aria-label={`Eliminar aviso ${item.title}`} onClick={() => onChange({ ...value, items: value.items.filter(notice => notice.id !== item.id) })}><Trash2 size={17}/></button></header>
        <label className="we-toggle"><input type="checkbox" checked={item.enabled} onChange={event => update(item.id, { enabled: event.target.checked })}/> Mostrar aviso</label>
        {errors[path] && <p className="we-field-error">{errors[path]}</p>}
        {field('title', 'Título del aviso', { maxLength: 100 })}
        <EditorialImageField item={item} path={`${path}.imageUrl`} errors={errors} onChange={imageUrl => update(item.id, { imageUrl })}/>
        {field('imageAlt', 'Descripción accesible de la imagen', { maxLength: 180 })}
        <div className="we-fields-grid">{field('badge', 'Badge sobre la imagen', { maxLength: 40, placeholder: 'OFERTA POR DÍAS', hint: 'Texto libre. Déjalo vacío para no mostrar badge.' })}<div className="we-field"><label htmlFor={`${item.id}-position`}>Posición del badge</label><select id={`${item.id}-position`} value={item.badgePosition} onChange={event => update(item.id, { badgePosition: event.target.value })}>{BADGE_POSITIONS.map((position, index) => <option key={position} value={position}>{['Arriba izquierda', 'Arriba derecha', 'Abajo izquierda', 'Abajo derecha'][index]}</option>)}</select></div></div>
        {field('description', 'Descripción del aviso', { maxLength: 180, multiline: true })}
        <Field label="Texto del CTA sobre la imagen" path={`${path}.ctaLabel`} value={item.ctaLabel ?? 'Conoce más'} maxLength={40} onChange={ctaLabel => update(item.id, { ctaLabel })} errors={errors}/>
        {field('href', 'Destino de la imagen y su CTA', { placeholder: '/shop' })}
        <div className="we-field"><label htmlFor={`${item.id}-art`}>Ilustración si no hay imagen</label><select id={`${item.id}-art`} value={item.art} onChange={event => update(item.id, { art: event.target.value })}>{ART_TYPES.map(art => <option key={art}>{art}</option>)}</select></div>
      </article>;
    })}
  </>;
}

export function SpecialProductsEditor({ value, onChange, products, errors }) {
  const selected = value.productIds.map(id => products.find(product => product.id === id)).filter(Boolean);
  function move(index, direction) {
    const ids = [...value.productIds];
    [ids[index], ids[index + direction]] = [ids[index + direction], ids[index]];
    onChange({ productIds: ids });
  }
  return <>
    <div className="we-section-intro"><div><h2>Destacados y ofertas especiales</h2><p>Elige hasta 4 productos existentes. Se mostrarán con sus imágenes y precios del catálogo, sin crear descuentos nuevos.</p></div><span className="we-chip">{selected.length}/{MAX_SPECIAL_PRODUCTS} seleccionados</span></div>
    <p className="we-note">Puedes cambiar el título y la visibilidad desde «Secciones». Sin productos seleccionados, el bloque no aparece.</p>
    <fieldset className="we-product-picker"><legend>Seleccionar productos</legend>{products.map(product => {
      const checked = value.productIds.includes(product.id);
      return <label key={product.id}><input type="checkbox" checked={checked} disabled={!checked && selected.length >= MAX_SPECIAL_PRODUCTS} onChange={event => onChange({ productIds: event.target.checked ? [...value.productIds, product.id] : value.productIds.filter(id => id !== product.id) })}/><span>{product.name}</span></label>;
    })}</fieldset>
    {errors['specials.productIds'] && <p className="we-field-error">{errors['specials.productIds']}</p>}
    <h3 className="we-selection-heading">Orden de presentación</h3>
    {selected.map((product, index) => <div className="we-item-header" key={product.id}><span className="we-number">{index + 1}</span><strong>{product.name}</strong><Reorder index={index} length={selected.length} label={product.name} onMove={move}/></div>)}
  </>;
}
