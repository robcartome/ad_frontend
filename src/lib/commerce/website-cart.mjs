// Persistent selections only. Prices, stock and customer identity are never
// trusted from browser storage. Missing products remain visible for review.
import { MAX_QUANTITY, MAX_ITEM_NOTES, hasPrice, validQuantity } from './cart.mjs';

export const WEBSITE_CART_VERSION = 2;
export const MAX_CART_LINES = 200;
const uuid = value => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
export const websiteCartKey = websiteId => `apudig:website-cart:${websiteId}:v${WEBSITE_CART_VERSION}`;
export const cartLineId = item => `${item.id}:${item.unitId}`;

export function validateWebsiteCart(items) {
  if (!Array.isArray(items) || items.length > MAX_CART_LINES) throw new Error('No pudimos recuperar todas las líneas del carrito.');
  const seen = new Set();
  return items.map(item => {
    if (!item || !uuid(item.id) || !uuid(item.unitId) || !validQuantity(item.quantity) || seen.has(cartLineId(item))) throw new Error('El carrito contiene selecciones que requieren revisión.');
    seen.add(cartLineId(item));
    return { id: item.id, unitId: item.unitId, quantity: item.quantity, ...(typeof item.notes === 'string' ? { notes: item.notes.slice(0, MAX_ITEM_NOTES) } : {}) };
  });
}

export function restoreWebsiteCart(raw, websiteId) {
  if (raw === null) return [];
  const data = JSON.parse(raw);
  if (data?.version !== WEBSITE_CART_VERSION || data.websiteId !== websiteId) throw new Error('El carrito guardado no corresponde a este Website.');
  return validateWebsiteCart(data.items);
}

export function serializeWebsiteCart(items, websiteId) {
  return JSON.stringify({ version: WEBSITE_CART_VERSION, websiteId, items: validateWebsiteCart(items) });
}

export function addWebsiteCartItem(items, product, unitId = product.unitId, quantity = 1) {
  if (!validQuantity(quantity)) throw new Error('Usa una cantidad entre 1 y 999.');
  const candidate = { id: product.id, unitId, quantity };
  validateWebsiteCart([candidate]);
  const unit = product.saleUnits?.find(row => row.unitId === unitId) || (product.unitId === unitId ? product : null);
  if (!unit || unit.availability === 'unavailable' || !hasPrice(unit)) throw new Error('La unidad no tiene una oferta disponible.');
  const existing = items.find(item => cartLineId(item) === cartLineId(candidate));
  if (existing) {
    if (existing.quantity + quantity > MAX_QUANTITY) throw new Error('La cantidad máxima por línea es 999.');
    return items.map(item => item === existing ? { ...item, quantity: item.quantity + quantity } : item);
  }
  if (items.length >= MAX_CART_LINES) throw new Error('El carrito admite hasta 200 líneas. Conserva tus selecciones y prepara otra solicitud.');
  return [...items, candidate];
}

export function resolveWebsiteCart(items, products) {
  const known = new Map(products.map(product => [product.id, product]));
  return validateWebsiteCart(items).map(item => {
    const product = known.get(item.id);
    const unit = product?.saleUnits?.find(row => row.unitId === item.unitId) || (product?.unitId === item.unitId ? product : null);
    return {
      ...(product || { id: item.id, name: 'Producto pendiente de verificar', sku: '', image: 'package', currency: '' }),
      ...item, cartLineId: cartLineId(item),
      unit: unit?.unit || 'Unidad pendiente de verificar',
      price: unit?.price ?? null, originalPrice: null,
      availability: unit?.availability || 'unknown', requiresReview: !unit,
    };
  });
}

export function cartQuoteItems(items) {
  return validateWebsiteCart(items).map(({ id, unitId, quantity }) => ({ productId: id, unitId, quantity }));
}
