export const WEBSITE_SCHEMA_VERSION = 2;
export const SECTION_TYPES = ['benefits', 'categories', 'featured', 'promotions', 'about'];
export const ART_TYPES = ['drill', 'grinder', 'cement', 'paint', 'pipe', 'cable', 'helmet', 'brick'];

// Version 1 used /catalog for storefront links. That URL now belongs exclusively
// to the existing worker catalog. Preserve content while updating its old destinations.
export function upgradeWebsiteDocument(document) {
  if (!document || document.schemaVersion !== 1) return document;
  const upgradeItems = items => Array.isArray(items) ? items.map(item => item && typeof item === 'object' ? {
    ...item,
    href: typeof item.href === 'string' ? item.href.replace(/^\/catalog(?=$|[/?#])/, '/shop') : item.href,
  } : item) : items;
  return { ...document, schemaVersion: WEBSITE_SCHEMA_VERSION, banners: upgradeItems(document.banners), promotions: upgradeItems(document.promotions) };
}

export function createWebsiteDocument(companyName = 'Ferretería Tolentino') {
  const name = typeof companyName === 'string' && companyName.trim() ? companyName.trim().slice(0, 100) : 'Mi empresa';
  return {
    schemaVersion: WEBSITE_SCHEMA_VERSION,
    identity: { name, shortName: name === 'Ferretería Tolentino' ? 'TOLENTINO' : name.slice(0, 40), location: name === 'Ferretería Tolentino' ? 'La Soledad' : 'Zona de atención por configurar', primaryColor: '#FF8000', logoUrl: '', announcement: 'Materiales, herramientas y soluciones para tu proyecto' },
    contact: { phone: '', whatsapp: '', address: '', hours: '' },
    seo: { title: `${name} | Construye tus proyectos`.slice(0, 70), description: 'Herramientas, materiales y asesoría para construir tus proyectos.' },
    banners: [{ id: 'banner-principal', enabled: true, eyebrow: 'MANOS A LA OBRA', title: 'Tu próximo proyecto empieza aquí.', description: 'Herramientas, materiales y soluciones. Todo para construir, renovar y hacer más.', ctaLabel: 'Explorar productos', href: '/shop', imageUrl: '', mobileImageUrl: '', imageAlt: '', art: 'drill' }],
    promotions: [{ id: 'campana-proyectos', enabled: true, eyebrow: 'DE LA IDEA A LA OBRA', title: 'Hagamos realidad lo que tienes en mente.', description: 'Reúne tus materiales y solicita orientación para tu proyecto.', ctaLabel: 'Preparar mi lista', href: '/shop', startsAt: '', endsAt: '', productIds: [] }],
    sections: [
      { type: 'benefits', enabled: true, title: 'A tu lado, de principio a fin' },
      { type: 'categories', enabled: true, title: 'Una solución para cada proyecto' },
      { type: 'featured', enabled: true, title: 'Ideas para empezar' },
      { type: 'promotions', enabled: true, title: 'Para tu próximo proyecto' },
      { type: 'about', enabled: true, title: 'Construir también es contar con alguien.' },
    ],
  };
}

export function isSafeLink(value) {
  return typeof value === 'string' && /^\/(?!\/)/.test(value) && !/[\\\s\u0000-\u001f<>]/.test(value) && value.length <= 300;
}

export function isSafeImage(value) {
  if (!value) return true;
  if (typeof value !== 'string' || value.length > 1000 || /[\\\s\u0000-\u001f]/.test(value)) return false;
  if (value.startsWith('/')) return isSafeLink(value);
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch { return false; }
}

export function validateWebsite(document, productIds = []) {
  const errors = {};
  const requiredText = (value, key, label, max) => {
    if (typeof value !== 'string' || !value.trim()) errors[key] = `${label} es obligatorio.`;
    else if (value.length > max) errors[key] = `${label}: máximo ${max} caracteres.`;
  };
  const optionalText = (value, key, label, max) => {
    if (typeof value !== 'string' || value.length > max) errors[key] = `${label}: máximo ${max} caracteres.`;
  };
  if (!document || document.schemaVersion !== WEBSITE_SCHEMA_VERSION) return { document: 'Formato de contenido no compatible.' };
  requiredText(document.identity?.name, 'identity.name', 'Nombre comercial', 100);
  requiredText(document.identity?.shortName, 'identity.shortName', 'Nombre corto', 40);
  requiredText(document.identity?.location, 'identity.location', 'Zona de atención', 100);
  optionalText(document.identity?.announcement, 'identity.announcement', 'Barra informativa', 180);
  if (!/^#[0-9a-f]{6}$/i.test(document.identity?.primaryColor ?? '')) errors['identity.primaryColor'] = 'Usa un color hexadecimal de seis dígitos.';
  if (!isSafeImage(document.identity?.logoUrl)) errors['identity.logoUrl'] = 'Usa una ruta local o URL HTTPS válida.';
  for (const [key, max] of [['phone', 40], ['whatsapp', 15], ['address', 300], ['hours', 180]]) optionalText(document.contact?.[key], `contact.${key}`, 'Dato de contacto', max);
  if (document.contact?.whatsapp && !/^\d{8,15}$/.test(document.contact.whatsapp)) errors['contact.whatsapp'] = 'Incluye código de país y solo dígitos (8–15).';
  requiredText(document.seo?.title, 'seo.title', 'Título SEO', 70);
  requiredText(document.seo?.description, 'seo.description', 'Descripción SEO', 180);

  for (const collection of ['banners', 'promotions']) {
    const list = document[collection];
    if (!Array.isArray(list) || list.length > 12) { errors[collection] = 'Se permiten hasta 12 elementos.'; continue; }
    const seen = new Set();
    list.forEach((item, index) => {
      const prefix = `${collection}.${index}`;
      if (!item || typeof item.id !== 'string' || !/^[\w-]{1,80}$/.test(item.id) || seen.has(item.id)) { errors[prefix] = 'Identificador inválido o duplicado.'; return; }
      seen.add(item.id);
      if (typeof item.enabled !== 'boolean') errors[`${prefix}.enabled`] = 'Visibilidad inválida.';
      requiredText(item.title, `${prefix}.title`, 'Título', 100);
      optionalText(item.eyebrow, `${prefix}.eyebrow`, 'Antetítulo', 60);
      optionalText(item.description, `${prefix}.description`, 'Descripción', 300);
      requiredText(item.ctaLabel, `${prefix}.ctaLabel`, 'Texto del botón', 40);
      if (!isSafeLink(item.href)) errors[`${prefix}.href`] = 'El enlace debe ser una ruta interna, por ejemplo /shop.';
      if (collection === 'banners') {
        if (!ART_TYPES.includes(item.art)) errors[`${prefix}.art`] = 'Ilustración no compatible.';
        for (const key of ['imageUrl', 'mobileImageUrl']) if (!isSafeImage(item[key])) errors[`${prefix}.${key}`] = 'Usa una ruta local o URL HTTPS válida.';
        optionalText(item.imageAlt, `${prefix}.imageAlt`, 'Texto alternativo', 180);
        if ((item.imageUrl || item.mobileImageUrl) && !item.imageAlt?.trim()) errors[`${prefix}.imageAlt`] = 'Describe la imagen para accesibilidad.';
        if (item.mobileImageUrl && !item.imageUrl) errors[`${prefix}.imageUrl`] = 'Agrega primero la imagen de escritorio.';
      } else {
        for (const key of ['startsAt', 'endsAt']) {
          if (typeof item[key] !== 'string' || (item[key] && (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(item[key]) || !Number.isFinite(Date.parse(item[key]))))) errors[`${prefix}.${key}`] = 'Fecha inválida.';
        }
        if (item.startsAt && item.endsAt && Date.parse(item.endsAt) <= Date.parse(item.startsAt)) errors[`${prefix}.endsAt`] = 'El fin debe ser posterior al inicio.';
        if (!Array.isArray(item.productIds) || item.productIds.length > 50 || item.productIds.some(id => !productIds.includes(id)) || new Set(item.productIds).size !== item.productIds.length) errors[`${prefix}.productIds`] = 'Selecciona productos válidos de esta tienda.';
      }
    });
  }
  if (!Array.isArray(document.sections) || document.sections.length !== SECTION_TYPES.length || new Set(document.sections.map(section => section?.type)).size !== SECTION_TYPES.length) errors.sections = 'Las secciones deben aparecer una sola vez.';
  else document.sections.forEach((section, index) => {
    if (!SECTION_TYPES.includes(section?.type) || typeof section.enabled !== 'boolean') errors[`sections.${index}`] = 'Sección inválida.';
    requiredText(section?.title, `sections.${index}.title`, 'Título de sección', 100);
  });
  return errors;
}

export function visiblePromotions(document, now = Date.now()) {
  return document.promotions.filter(item => item.enabled && (!item.startsAt || Date.parse(item.startsAt) <= now) && (!item.endsAt || now < Date.parse(item.endsAt)));
}

export function previewStore(base, document) {
  const { name, shortName, location, logoUrl, announcement } = document.identity;
  const { phone, whatsapp, address, hours } = document.contact;
  return { ...base, name, shortName, location, logoUrl, announcement, phone, whatsapp, address, hours, description: document.seo.description, colors: { ...base.colors, primary: document.identity.primaryColor }, mode: 'demo' };
}

export function limaDateInput(iso) {
  return iso && Number.isFinite(Date.parse(iso)) ? new Date(Date.parse(iso) - 5 * 60 * 60 * 1000).toISOString().slice(0, 16) : '';
}
export function fromLimaInput(value) {
  if (!value) return '';
  const parsed = new Date(`${value}:00-05:00`);
  return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : value;
}
