export const CART_STORAGE_VERSION = 1;
export const CART_MAX_LINES = 50;
export const CART_MAX_QUANTITY = 999;

export function cartStorageKey(websiteId) {
  return `apudig:storefront-cart:v${CART_STORAGE_VERSION}:${websiteId}`;
}

export function normalizeQuantity(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return 1;
  return Math.min(CART_MAX_QUANTITY, Math.max(1, parsed));
}

function sanitizeProduct(product) {
  if (!product || typeof product.id !== "string" || !product.id) return null;
  return {
    id: product.id,
    slug: String(product.slug || ""),
    sku: String(product.sku || ""),
    name: String(product.name || "Producto").slice(0, 180),
    price: String(product.price || "0.00"),
    currency: String(product.currency || "PEN").slice(0, 3),
    image: String(product.thumbnail || product.image || ""),
    availability: String(product.availability || "UNKNOWN"),
  };
}

export function sanitizeStoredCart(raw, websiteId) {
  if (!raw || raw.version !== CART_STORAGE_VERSION || raw.website_id !== websiteId) {
    return [];
  }
  if (!Array.isArray(raw.items)) return [];
  const seen = new Set();
  const items = [];
  for (const candidate of raw.items.slice(0, CART_MAX_LINES)) {
    const product = sanitizeProduct(candidate?.product);
    if (!product || seen.has(product.id)) continue;
    seen.add(product.id);
    items.push({ product, quantity: normalizeQuantity(candidate.quantity) });
  }
  return items;
}

export function addCartItem(items, product, quantity = 1) {
  const sanitized = sanitizeProduct(product);
  if (!sanitized) return items;
  const existing = items.find((item) => item.product.id === sanitized.id);
  if (existing) {
    return items.map((item) => item.product.id === sanitized.id
      ? { product: { ...item.product, ...sanitized }, quantity: normalizeQuantity(item.quantity + quantity) }
      : item);
  }
  if (items.length >= CART_MAX_LINES) return items;
  return [...items, { product: sanitized, quantity: normalizeQuantity(quantity) }];
}

export function cartFingerprint(items) {
  return items
    .map((item) => `${item.product.id}:${normalizeQuantity(item.quantity)}`)
    .sort()
    .join("|");
}

export function normalizeWhatsAppNumber(value) {
  return String(value || "").replace(/\D/g, "");
}

export function buildWhatsAppMessage({ websiteName, quote }) {
  const lines = [
    `Solicitud de cotización — ${websiteName}`,
    `Referencia: ${String(quote.quote_id).slice(0, 8).toUpperCase()}`,
    "",
  ];
  quote.lines.forEach((line) => {
    if (line.status !== "ACTIVE") return;
    lines.push(`${line.quantity} × ${line.sku} — ${line.name}`);
    lines.push(`  ${line.currency || quote.currency} ${line.price} c/u · Subtotal ${quote.currency} ${line.subtotal}`);
  });
  lines.push("", `Total cotizado: ${quote.currency} ${quote.total}`);
  lines.push("", "Esta es una solicitud de cotización, no un pedido confirmado.");
  return lines.join("\n");
}

export function buildWhatsAppUrl({ phone, websiteName, quote }) {
  const number = normalizeWhatsAppNumber(phone);
  if (!number) return "";
  const message = buildWhatsAppMessage({ websiteName, quote });
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
