// Public commerce DTOs. Never pass an administrative response through to React.
const text = (value) => (typeof value === "string" ? value : "");
const amount = (value) =>
  (typeof value === "number" || (typeof value === "string" && value.trim())) &&
  Number.isFinite(Number(value)) &&
  Number(value) >= 0
    ? Number(value)
    : null;
export function imageUrl(value) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}
export function normalizeProduct(raw) {
  if (!raw || raw.id == null || !text(raw.name).trim())
    throw new Error("Producto público inválido");
  const price = amount(raw.price);
  const previous = amount(raw.originalPrice ?? raw.original_price);
  return {
    id: String(raw.id),
    name: raw.name,
    brand: text(raw.brand?.name ?? raw.brand),
    brandId: raw.brand?.id == null ? '' : String(raw.brand.id),
    category: String(raw.category?.id ?? raw.category ?? ""),
    categoryName: text(raw.category?.name),
    sku: text(raw.sku),
    price,
    originalPrice: price !== null && previous > price ? previous : null,
    unit: text(raw.unit?.name ?? raw.unit) || "unidad",
    unitId: raw.unitId == null ? '' : String(raw.unitId),
    currency: /^[A-Z]{3}$/.test(raw.currency) ? raw.currency : 'PEN',
    description: text(raw.description),
    image: text(raw.image) || "package",
    imageUrl: imageUrl(raw.imageUrl ?? raw.image_url),
    imageAlt: text(raw.imageAlt ?? raw.image_alt) || raw.name,
    images: Array.isArray(raw.images) ? raw.images.map(imageUrl).filter(Boolean) : [],
    saleUnits: Array.isArray(raw.saleUnits) ? raw.saleUnits.map(unit => ({ unitId: String(unit.unitId), unit: text(unit.unit), price: amount(unit.price), availability: ['available', 'unavailable'].includes(unit.availability) ? unit.availability : 'unknown' })) : [],
    seoTitle: text(raw.seoTitle),
    seoDescription: text(raw.seoDescription),
    badge: text(raw.badge),
    availability: ["available", "unavailable"].includes(raw.availability)
      ? raw.availability
      : "unknown",
  };
}
export function normalizeCategory(raw) {
  if (!raw || raw.id == null || !text(raw.name).trim())
    throw new Error("Categoría pública inválida");
  return {
    id: String(raw.id),
    name: raw.name,
    description: text(raw.description),
    icon: text(raw.icon) || "drill",
    imageUrl: imageUrl(raw.imageUrl ?? raw.image_url),
    parentId: raw.parent_id == null ? null : String(raw.parent_id),
    productCount: Number.isInteger(raw.productCount) && raw.productCount >= 0 ? raw.productCount : 0,
  };
}
export function normalizeBrand(raw) {
  if (!raw || raw.id == null || !text(raw.name).trim()) throw new Error('Marca pública inválida');
  return { id: String(raw.id), name: raw.name, productCount: Number.isInteger(raw.productCount) && raw.productCount >= 0 ? raw.productCount : 0 };
}
export function formatPublicMoney(value, currency = 'PEN') {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency }).format(value);
}
export function productOffer(product) {
  const price = amount(product.price),
    previous = amount(product.originalPrice);
  if (price === null || previous === null || previous <= price) return null;
  return {
    percent: Math.floor(((previous - price) / previous) * 100),
    savings: Math.round((previous - price) * 100) / 100,
  };
}

// A curated frontend selection, not a sales ranking. Existing valid offers lead
// each category; products without a previous price remain ordinary products.
export function categoryProducts(products, categoryId = null) {
  const selected =
    categoryId === null
      ? [...products]
      : products.filter((product) => product.category === categoryId);
  return selected.sort(
    (left, right) =>
      Number(Boolean(productOffer(right))) -
      Number(Boolean(productOffer(left))),
  );
}
