'use client';

import { ArrowDown, ArrowUp, Plus, Trash2, ImageIcon, Megaphone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ART_TYPES, limaDateInput, fromLimaInput } from '@/lib/website/content.mjs';

export function Field({ label, path, value, onChange, errors = {}, hint, multiline, ...props }) {
  const id = `website-${path}`;
  const Component = multiline ? Textarea : Input;
  return <div className="we-field">
    
    <Label htmlFor={id}>{label}</Label>
    
    <Component id={id} value={value ?? ''} onChange={event => onChange(event.target.value)} aria-invalid={Boolean(errors[path])} aria-describedby={errors[path] || hint ? `${id}-hint` : undefined} {...props}/>
    {(errors[path] || hint) && <small id={`${id}-hint`} className={errors[path] ? 'we-field-error' : ''}>{errors[path] || hint}</small>}
  </div>;
}

export const sectionLabels = { benefits: 'Beneficios', categories: 'Categorías (navegación)', announcements: 'Slider de avisos', specials: 'Destacados y ofertas especiales', featured: 'Selección por categoría', promotions: 'Campañas', about: 'Presentación de la empresa' };

export function Reorder({ index, length, onMove, label }) {
  return <div className="we-reorder">
    
    <button type="button" disabled={index === 0} onClick={() => onMove(index, -1)} aria-label={`Subir ${label}`}>
      <ArrowUp size={16}/>
    </button>
    
    <button type="button" disabled={index === length - 1} onClick={() => onMove(index, 1)} aria-label={`Bajar ${label}`}>
      <ArrowDown size={16}/>
    </button>
  </div>;
}

export function CollectionEditor({ type, items, onChange, errors, products }) {
  const isBanner = type === 'banners';
  const singular = isBanner ? 'banner' : 'campaña';
  function update(index, key, value) {
    onChange(items.map((item, position) => position === index ? { ...item, [key]: value } : item));
  }
  function move(index, direction) {
    const next = [...items];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    onChange(next);
  }
  function add() {
    const shared = { id: crypto.randomUUID(), enabled: false, eyebrow: isBanner ? 'NOVEDADES' : 'CAMPAÑA', title: isBanner ? 'Nuevo banner' : 'Nueva campaña', description: '', ctaLabel: 'Ver productos', href: '/shop' };
    onChange([...items, isBanner ? { ...shared, imageUrl: '', mobileImageUrl: '', imageAlt: '', art: 'drill' } : { ...shared, startsAt: '', endsAt: '', productIds: [] }]);
  }
  return <>
    
    <div className="we-section-intro">
      <div>
        <h2>{isBanner ? 'Banners de inicio' : 'Campañas y promociones'}</h2>
        <p>{isBanner ? 'Combina imágenes para móvil y escritorio, mensajes y enlaces.' : 'Comunica campañas y vincula productos. Los precios siguen bajo control del ERP.'}</p>
      </div>
      <button className="we-button we-secondary" type="button" disabled={items.length >= 12} onClick={add}>
        <Plus size={16}/> Agregar {singular}
      </button>
    </div>
    {!isBanner && <p className="we-note">Las fechas se ingresan en hora de Lima (UTC−05:00). La vista previa calcula la vigencia; la programación real dependerá de Django. No se aplican descuentos al catálogo.</p>}
    {errors[type] && <p className="we-field-error">{errors[type]}</p>}
    {!items.length && <div className="we-empty">{isBanner ? <ImageIcon/> : <Megaphone/>}
      <h3>Aún no hay {isBanner ? 'banners' : 'campañas'}</h3>
      <p>Agrega el primero y revisa cómo se verá antes de activarlo.</p>
    </div>}
    {items.map((item, index) => {
      const path = `${type}.${index}`;
      const field = (key, label, extra = {}) => <Field label={label} path={`${path}.${key}`} value={item[key]} onChange={value => update(index, key, value)} errors={errors} {...extra}/>;
      return <article className="we-item" key={item.id}>
        
      <header className="we-item-header">
        <span className="we-number">{String(index + 1).padStart(2, '0')}</span>
        <div>
          <h3>{item.title || `Nuevo ${singular}`}</h3>
          <small>{item.enabled ? 'Visible en la versión aplicada' : 'Oculto'}</small>
        </div>
        <Reorder index={index} length={items.length} onMove={move} label={singular}/>
        <button type="button" className="we-icon-button we-danger" aria-label={`Eliminar ${item.title}`} onClick={() => onChange(items.filter((_, position) => position !== index))}>
          <Trash2 size={17}/>
        </button>
      </header>
        
      <label className="we-toggle">
        <input type="checkbox" checked={item.enabled} onChange={event => update(index, 'enabled', event.target.checked)}/> Mostrar {singular}
      </label>
        {errors[path] && <p className="we-field-error">{errors[path]}</p>}
        
      <div className="we-fields-grid">{field('eyebrow', 'Antetítulo', { maxLength: 60 })}{field('title', 'Título', { maxLength: 100 })}</div>
        {field('description', 'Descripción', { multiline: true, maxLength: 300, rows: 3 })}
        
      <div className="we-fields-grid">{field('ctaLabel', 'Texto del botón', { maxLength: 40 })}{field('href', 'Enlace del botón', { placeholder: '/shop', hint: 'Solo enlaces internos, por ejemplo /shop?category=herramientas.' })}</div>
        {isBanner ? <>
          
        <div className="we-fields-grid">{field('imageUrl', 'Imagen de escritorio (URL)', { hint: 'URL HTTPS o ruta local. Carga de archivos disponible al integrar Django.' })}{field('mobileImageUrl', 'Imagen de móvil (URL)', { hint: 'Opcional. Si se omite se usa la imagen de escritorio.' })}</div>
          {field('imageAlt', 'Descripción accesible de la imagen', { maxLength: 180 })}
          
        <div className="we-field">
          <Label htmlFor={`${item.id}-art`}>Ilustración cuando no hay imagen</Label>
          <select id={`${item.id}-art`} value={item.art} onChange={event => update(index, 'art', event.target.value)}>{ART_TYPES.map(art => <option key={art}>{art}</option>)}</select>
        </div>
        
      </> : <>
          
        <div className="we-fields-grid">
            
          <Field label="Inicio · hora Lima" path={`${path}.startsAt`} type="datetime-local" value={limaDateInput(item.startsAt)} onChange={value => update(index, 'startsAt', fromLimaInput(value))} errors={errors}/>
            
          <Field label="Fin · hora Lima" path={`${path}.endsAt`} type="datetime-local" value={limaDateInput(item.endsAt)} onChange={value => update(index, 'endsAt', fromLimaInput(value))} errors={errors}/>
          
        </div>
          
        <fieldset className="we-product-picker">
          <legend>Productos de referencia</legend>
          <p>La selección agrega enlaces a sus fichas; no cambia precios ni stock.</p>{products.map(product => <label key={product.id}>
            <input type="checkbox" checked={item.productIds.includes(product.id)} onChange={event => update(index, 'productIds', event.target.checked ? [...item.productIds, product.id] : item.productIds.filter(id => id !== product.id))}/>
            <span>{product.name}</span>
          </label>)}
        </fieldset>
          {errors[`${path}.productIds`] && <p className="we-field-error">{errors[`${path}.productIds`]}</p>}
        
      </>}
      
    </article>;
    })}
  </>;
}

export function SectionsEditor({ sections, onChange, errors }) {
  function update(index, patch) { onChange(sections.map((item, position) => position === index ? { ...item, ...patch } : item)); }
  function move(index, direction) {
    const next = [...sections];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    onChange(next);
  }
  return <>
    <div className="we-section-intro">
      <div>
        <h2>Secciones de la página de inicio</h2>
        <p>Ordena el contenido y elige qué bloques mostrar. Los banners siempre encabezan la página.</p>
      </div>
    </div>
    {errors.sections && <p className="we-field-error">{errors.sections}</p>}
    {sections.map((section, index) => section.type === 'categories' ? <article className="we-item" key={section.type}><h3>Categorías en la navegación</h3><p className="we-note">Las categorías aparecen con su icono en la barra superior de la tienda. Esta fila ya no es una sección del inicio; se conserva su configuración anterior por compatibilidad.</p></article> : <article className="we-item" key={section.type}>
      
      <header className="we-item-header">
        <span className="we-number">{index + 1}</span>
        <h3>{sectionLabels[section.type]}</h3>
        <Reorder index={index} length={sections.length} onMove={move} label={sectionLabels[section.type]}/>
      </header>
      
      <label className="we-toggle">
        <input type="checkbox" checked={section.enabled} onChange={event => update(index, { enabled: event.target.checked })}/> Mostrar sección
      </label>
      
      <Field label="Título de la sección" path={`sections.${index}.title`} value={section.title} maxLength={100} onChange={value => update(index, { title: value })} errors={errors}/>
    </article>)}
  </>;
}
