import { SOCIAL_NETWORKS, socialUrl, validEmail } from './contact.mjs';

export const WEBSITE_SCHEMA_VERSION = 3;
export const MAX_ANNOUNCEMENTS = 8;
export const MAX_SPECIAL_PRODUCTS = 4;
export const MAX_LOCAL_IMAGE_BYTES = 150 * 1024;
export const BADGE_POSITIONS = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
export const SECTION_TYPES = ['benefits', 'categories', 'announcements', 'specials', 'featured', 'promotions', 'about'];
export const ART_TYPES = ['drill', 'grinder', 'cement', 'paint', 'pipe', 'cable', 'helmet', 'brick'];

// Version 1 used /catalog for storefront links. That URL now belongs exclusively
// to the existing worker catalog. Preserve content while updating its old destinations.
export function upgradeWebsiteDocument(document) {
  if (!document) return document;
  const upgradeItems = items => Array.isArray(items) ? items.map(item => item && typeof item === 'object' ? {
    ...item,
    href: typeof item.href === 'string' ? item.href.replace(/^\/catalog(?=$|[/?#])/, '/shop') : item.href,
  } : item) : items;
  const next = document.schemaVersion === 1 ? { ...document, schemaVersion: 2, banners: upgradeItems(document.banners), promotions: upgradeItems(document.promotions) } : document;
  if (next.schemaVersion !== 2) return next;
  let sections = next.sections;
  if (Array.isArray(sections)) {
    sections = sections.map(section => ({ ...section }));
    const additions = [
      { type: 'announcements', enabled: true, title: 'Encuentra tu próximo proyecto' },
      { type: 'specials', enabled: true, title: 'Destacados y ofertas especiales' },
    ].filter(section => !sections.some(existing => existing.type === section.type));
    const position = sections.findIndex(section => section.type === 'categories');
    sections.splice(position + 1, 0, ...additions);
  }
  return { ...next, schemaVersion: WEBSITE_SCHEMA_VERSION, sections, announcements: next.announcements ?? createAnnouncements(), specials: next.specials ?? { productIds: [] } };
}

function createAnnouncements() {
  return {
    ctaLabel: 'Ver más productos', href: '/shop',
    items: [
      { id: 'aviso-herramientas', enabled: true, ctaLabel: 'Ver herramientas', description: '', title: 'Equípate para tu proyecto', badge: 'DESTACADO', badgePosition: 'top-left', href: '/shop?category=herramientas', imageUrl: '', imageAlt: '', art: 'drill' },
      { id: 'aviso-pinturas', enabled: true, ctaLabel: 'Inspírate', description: '', title: 'Renueva tus espacios', badge: 'INSPÍRATE', badgePosition: 'top-left', href: '/shop?category=pinturas', imageUrl: '', imageAlt: '', art: 'paint' },
      { id: 'aviso-construccion', enabled: true, ctaLabel: 'Prepara tu pedido', description: '', title: 'Todo para empezar tu obra', badge: '', badgePosition: 'top-left', href: '/shop?category=construccion', imageUrl: '', imageAlt: '', art: 'brick' },
      { id: 'aviso-seguridad', enabled: true, ctaLabel: 'Conoce la selección', description: '', title: 'Trabaja con confianza', badge: 'SELECCIÓN', badgePosition: 'top-left', href: '/shop?category=seguridad', imageUrl: '', imageAlt: '', art: 'helmet' },
    ],
  };
}

export function createWebsiteDocument(companyName = 'Ferretería Tolentino', productIds = []) {
  const name = typeof companyName === 'string' && companyName.trim() ? companyName.trim().slice(0, 100) : 'Mi empresa';
  return {
    schemaVersion: WEBSITE_SCHEMA_VERSION,
    identity: { name, shortName: name === 'Ferretería Tolentino' ? 'TOLENTINO' : name.slice(0, 40), location: name === 'Ferretería Tolentino' ? 'La Soledad' : 'Zona de atención por configurar', primaryColor: '#FF8000', logoUrl: '', announcement: 'Materiales, herramientas y soluciones para tu proyecto' },
    contact: { phone: '', secondaryPhone: '', email: '', whatsapp: '', address: '', hours: '', socials: Object.fromEntries(SOCIAL_NETWORKS.map(network => [network.id, ''])) },
    seo: { title: `${name} | Construye tus proyectos`.slice(0, 70), description: 'Herramientas, materiales y asesoría para construir tus proyectos.' },
    announcements: createAnnouncements(),
    specials: { productIds: [...new Set(productIds)].slice(0, MAX_SPECIAL_PRODUCTS) },
    heroSlider: { autoplay: true, intervalMs: 6000 },
    banners: [
      { id: 'banner-principal', enabled: true, eyebrow: 'MANOS A LA OBRA', title: 'Tu próximo proyecto empieza aquí.', description: 'Herramientas, materiales y soluciones. Todo para construir, renovar y hacer más.', ctaLabel: 'Explorar productos', href: '/shop', imageUrl: '', mobileImageUrl: '', imageAlt: '', art: 'drill' },
      { id: 'banner-renueva', enabled: true, eyebrow: 'DALE VIDA A TUS IDEAS', title: 'Un nuevo color para tus espacios.', description: 'Encuentra pinturas y accesorios para darle un nuevo aire a tu hogar.', ctaLabel: 'Explorar pinturas', href: '/shop?category=pinturas', imageUrl: '', mobileImageUrl: '', imageAlt: '', art: 'paint' },
      { id: 'banner-herramientas', enabled: true, eyebrow: 'PREPARA TU EQUIPO', title: 'Herramientas para hacerlo posible.', description: 'Elige lo que necesitas y agrégalo a tu lista de cotización.', ctaLabel: 'Ver herramientas', href: '/shop?category=herramientas', imageUrl: '', mobileImageUrl: '', imageAlt: '', art: 'drill' },
    ],
    promotions: [{ id: 'campana-proyectos', enabled: true, eyebrow: 'DE LA IDEA A LA OBRA', title: 'Hagamos realidad lo que tienes en mente.', description: 'Reúne tus materiales y solicita orientación para tu proyecto.', ctaLabel: 'Preparar mi lista', href: '/shop', startsAt: '', endsAt: '', productIds: [] }],
    sections: [
      { type: 'benefits', enabled: true, title: 'A tu lado, de principio a fin' },
      { type: 'categories', enabled: true, title: 'Una solución para cada proyecto' },
      { type: 'announcements', enabled: true, title: 'Encuentra tu próximo proyecto' },
      { type: 'specials', enabled: true, title: 'Destacados y ofertas especiales' },
      { type: 'featured', enabled: true, title: 'Encuentra lo mejor para tu proyecto' },
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

// Inline files are restricted to editorial banners/announcements, never SVG/HTML.
// Production must upload media separately and replace these values with asset URLs.
export function isAnnouncementImage(value) {
  if (typeof value === 'string' && value.startsWith('data:')) {
    const match = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
    if (!match || match[2].length % 4 !== 0) return false;
    const padding = match[2].endsWith('==') ? 2 : match[2].endsWith('=') ? 1 : 0;
    return match[2].length / 4 * 3 - padding <= MAX_LOCAL_IMAGE_BYTES;
  }
  return isSafeImage(value);
}

export function specialProducts(document, products) {
  const byId = new Map(products.map(product => [product.id, product]));
  return (document.specials?.productIds ?? []).slice(0, MAX_SPECIAL_PRODUCTS).map(id => byId.get(id)).filter(Boolean);
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
  optionalText(document.contact?.secondaryPhone ?? '', 'contact.secondaryPhone', 'Teléfono adicional', 40);
  optionalText(document.contact?.email ?? '', 'contact.email', 'Correo comercial', 180);
  if (document.contact?.email && !validEmail(document.contact.email)) errors['contact.email'] = 'Ingresa un correo comercial válido.';
  const socials = document.contact?.socials;
  if (socials !== undefined && (!socials || typeof socials !== 'object' || Array.isArray(socials))) errors['contact.socials'] = 'La configuración de redes sociales no es válida.';
  else SOCIAL_NETWORKS.forEach(network => {
    optionalText(socials?.[network.id] ?? '', `contact.socials.${network.id}`, `Perfil de ${network.label}`, 300);
    if (socials?.[network.id] && !socialUrl(socials[network.id], network.id)) errors[`contact.socials.${network.id}`] = `Usa la URL HTTPS de tu perfil de ${network.label}.`;
  });
  if (document.contact?.whatsapp && !/^\d{8,15}$/.test(document.contact.whatsapp)) errors['contact.whatsapp'] = 'Incluye código de país y solo dígitos (8–15).';
  requiredText(document.seo?.title, 'seo.title', 'Título SEO', 70);
  requiredText(document.seo?.description, 'seo.description', 'Descripción SEO', 180);

  if (document.heroSlider !== undefined) {
    if (typeof document.heroSlider?.autoplay !== 'boolean') errors['banners.autoplay'] = 'La reproducción automática debe ser activada o desactivada.';
    const interval = document.heroSlider?.intervalMs;
    if (!Number.isInteger(interval) || interval < 3000 || interval > 15000) errors['banners.intervalMs'] = 'El intervalo debe estar entre 3 y 15 segundos.';
  }

  requiredText(document.announcements?.ctaLabel, 'announcements.ctaLabel', 'Texto del botón de productos por categoría', 40);
  if (!isSafeLink(document.announcements?.href)) errors['announcements.href'] = 'El botón de productos por categoría debe enlazar a una ruta interna.';
  const notices = document.announcements?.items;
  if (!Array.isArray(notices) || notices.length > MAX_ANNOUNCEMENTS) errors.announcements = `Máximo ${MAX_ANNOUNCEMENTS} avisos en el slider.`;
  else {
    const seen = new Set();
    notices.forEach((item, index) => {
      const prefix = `announcements.items.${index}`;
      if (!item || typeof item.id !== 'string' || !/^[\w-]{1,80}$/.test(item.id) || seen.has(item.id)) { errors[prefix] = 'Aviso inválido o duplicado.'; return; }
      seen.add(item.id);
      requiredText(item.title, `${prefix}.title`, 'Título del aviso', 100);
      if (item.ctaLabel !== undefined) requiredText(item.ctaLabel, `${prefix}.ctaLabel`, 'Texto del botón del aviso', 40);
      optionalText(item.description ?? '', `${prefix}.description`, 'Descripción del aviso', 180);
      optionalText(item.badge, `${prefix}.badge`, 'Badge del aviso', 40);
      optionalText(item.imageAlt, `${prefix}.imageAlt`, 'Descripción de imagen', 180);
      if (typeof item.enabled !== 'boolean') errors[`${prefix}.enabled`] = 'Visibilidad inválida.';
      if (!BADGE_POSITIONS.includes(item.badgePosition)) errors[`${prefix}.badgePosition`] = 'Posición de badge inválida.';
      if (!ART_TYPES.includes(item.art)) errors[`${prefix}.art`] = 'Ilustración inválida.';
      if (!isSafeLink(item.href)) errors[`${prefix}.href`] = 'Usa un enlace interno, por ejemplo /shop.';
      if (!isAnnouncementImage(item.imageUrl)) errors[`${prefix}.imageUrl`] = 'Usa HTTPS, una ruta local o una imagen local optimizada de hasta 150 KB.';
      if (item.imageUrl && !item.imageAlt?.trim()) errors[`${prefix}.imageAlt`] = 'Describe la imagen para accesibilidad.';
    });
  }
  const selected = document.specials?.productIds;
  if (!Array.isArray(selected) || selected.length > MAX_SPECIAL_PRODUCTS || new Set(selected).size !== selected.length || selected.some(id => !productIds.includes(id))) errors['specials.productIds'] = `Selecciona hasta ${MAX_SPECIAL_PRODUCTS} productos válidos de esta tienda, sin duplicados.`;

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
        for (const key of ['imageUrl', 'mobileImageUrl']) if (!isAnnouncementImage(item[key])) errors[`${prefix}.${key}`] = 'Usa HTTPS, una ruta local o imagen optimizada de hasta 150 KB.';
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
  const { phone, secondaryPhone = '', email = '', whatsapp, address, hours, socials = {} } = document.contact;
  const publicSocials = Object.fromEntries(SOCIAL_NETWORKS.map(network => [network.id, socialUrl(socials?.[network.id], network.id) ?? '']));
  return { ...base, name, shortName, location, logoUrl, announcement, phone, secondaryPhone, email, whatsapp, address, hours, socials: publicSocials, description: document.seo.description, colors: { ...base.colors, primary: document.identity.primaryColor }, mode: 'demo' };
}

export function limaDateInput(iso) {
  return iso && Number.isFinite(Date.parse(iso)) ? new Date(Date.parse(iso) - 5 * 60 * 60 * 1000).toISOString().slice(0, 16) : '';
}
export function fromLimaInput(value) {
  if (!value) return '';
  const parsed = new Date(`${value}:00-05:00`);
  return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : value;
}
