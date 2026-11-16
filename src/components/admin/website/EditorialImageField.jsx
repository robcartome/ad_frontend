'use client';
import LoadingIndicator from '@/components/feedback/LoadingIndicator';

import { useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { useWebsiteMedia } from './WebsiteMediaContext';
import CatalogImage from '@/components/storefront/CatalogImage';

export default function EditorialImageField({ item, path, onChange, errors = {}, label = 'Imagen' }) {
  const media = useWebsiteMedia();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inline = item.imageUrl?.startsWith('data:') ?? false;
  const id = `media-${path}`;
  async function choose(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setLoading(true); setError('');
    try {
      if (!media?.canUpload) throw new Error("Necesitas permiso para gestionar imágenes.");
      const uploaded = await media.upload(file, path.startsWith("banners") ? "BANNER" : path.startsWith("identity") ? "LOGO" : "SECTION", item.imageAlt || "");
      onChange(uploaded.url);
    }
    catch (cause) { setError(cause.message || 'No se pudo leer la imagen.'); }
    finally { setLoading(false); }
  }
  return <div className="we-announcement-image">
    <div className="we-announcement-thumbnail"><CatalogImage src={item.imageUrl} alt={item.imageAlt || item.title} type={item.art}/></div>
    <div>
      <label className="we-file-picker" htmlFor={`${id}-file`}><ImagePlus size={17}/><span>{label}: seleccionar desde la PC</span><input id={`${id}-file`} type="file" accept="image/png,image/jpeg,image/webp" onChange={choose} disabled={loading || !media?.canUpload}/></label>
      <small className="we-image-hint">PNG, JPG o WebP de hasta 5 MiB. La imagen se sube al Website de esta empresa.</small>
      {loading && <LoadingIndicator label="Preparando imagen…"/>}
      {(error || errors[path]) && <p id={`${id}-error`} className="we-field-error" role="alert">{error || errors[path]}</p>}
      <div className="we-field"><label htmlFor={`${id}-url`}>{label}: URL alternativa</label><input id={`${id}-url`} value={inline ? '' : item.imageUrl || ''} onChange={event => { setError(''); onChange(event.target.value); }} aria-invalid={Boolean(errors[path])} aria-describedby={error || errors[path] ? `${id}-error` : undefined} placeholder="https://…"/><small>{inline ? 'Imagen local seleccionada. Pegar una URL la reemplaza.' : 'Ruta local o URL HTTPS. Sin imagen se usa la ilustración.'}</small></div>
      {item.imageUrl && <button type="button" className="we-button we-secondary" onClick={() => onChange('')}>Quitar imagen</button>}
    </div>
  </div>;
}
