// Public commerce DTOs. Never pass an administrative response through to React.
const text = value => typeof value === 'string' ? value : '';
const amount = value => (typeof value === 'number' || (typeof value === 'string' && value.trim())) && Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : null;
export function imageUrl(value) {
  if (typeof value !== 'string') return null;
  try { const url = new URL(value); return url.protocol === 'https:' ? url.href : null; } catch { return null; }
}
export function normalizeProduct(raw) {
  if (!raw || raw.id == null || !text(raw.name).trim()) throw new Error('Producto público inválido');
  const price = amount(raw.price);
  const previous = amount(raw.originalPrice ?? raw.original_price);
  return {
    id: String(raw.id), name: raw.name, brand: text(raw.brand?.name ?? raw.brand),
    category: String(raw.category?.id ?? raw.category ?? ''), sku: text(raw.sku),
    price, originalPrice: price !== null && previous > price ? previous : null,
    unit: text(raw.unit?.name ?? raw.unit) || 'unidad', description: text(raw.description),
    image: text(raw.image) || 'drill', imageUrl: imageUrl(raw.imageUrl ?? raw.image_url),
    imageAlt: text(raw.imageAlt ?? raw.image_alt) || raw.name,
    badge: text(raw.badge), availability: ['available', 'unavailable'].includes(raw.availability) ? raw.availability : 'unknown',
  };
}
export function normalizeCategory(raw) {
  if (!raw || raw.id == null || !text(raw.name).trim()) throw new Error('Categoría pública inválida');
  return { id: String(raw.id), name: raw.name, description: text(raw.description), icon: text(raw.icon) || 'drill', imageUrl: imageUrl(raw.imageUrl ?? raw.image_url), parentId: raw.parent_id == null ? null : String(raw.parent_id) };
}
export function productOffer(product) {
  const price = amount(product.price), previous = amount(product.originalPrice);
  if (price === null || previous === null || previous <= price) return null;
  return { percent: Math.floor((previous - price) / previous * 100), savings: Math.round((previous - price) * 100) / 100 };
}
