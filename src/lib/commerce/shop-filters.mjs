import { productOffer } from './catalog.mjs';

export const SHOP_SORT_OPTIONS = [
  { value: 'name', label: 'Nombre A–Z' },
  { value: 'name-desc', label: 'Nombre Z–A' },
  { value: 'price-asc', label: 'Precio más bajo' },
  { value: 'price-desc', label: 'Precio más alto' },
  { value: 'discount', label: 'Mayor descuento' },
];
const price = value => typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value)) && Number(value) >= 0 ? String(Number(value)) : '';
export function normalizeShopQuery(params = {}) {
  const text = key => typeof params[key] === 'string' ? params[key].trim().slice(0, 120) : '';
  let min = price(params.min), max = price(params.max);
  if (min && max && Number(min) > Number(max)) [min, max] = [max, min];
  const brand = [...new Set((Array.isArray(params.brand) ? params.brand : [params.brand]).filter(value => typeof value === 'string' && value.trim()).map(value => value.trim().slice(0, 120)))];
  return { q: text('q'), category: text('category'), brand, min, max, sort: SHOP_SORT_OPTIONS.some(option => option.value === params.sort) ? params.sort : 'name', page: Math.max(1, Number.parseInt(params.page, 10) || 1) };
}
export function shopUrl(query, patch = {}) {
  const next = { ...query, page: 1, ...patch };
  const params = new URLSearchParams();
  for (const key of ['q', 'category', 'min', 'max', 'sort']) if (next[key] !== '' && next[key] != null) params.set(key, next[key]);
  for (const brand of next.brand || []) params.append('brand', brand);
  if (next.page > 1) params.set('page', next.page);
  return `/shop${params.size ? `?${params}` : ''}`;
}
export function filterShopProducts(products, query) {
  const needle = query.q.toLocaleLowerCase('es');
  const filtered = products.filter(product =>
    (!query.category || product.category === query.category) &&
    (!query.brand.length || query.brand.includes(product.brand)) &&
    `${product.name} ${product.sku}`.toLocaleLowerCase('es').includes(needle) &&
    ((query.min === '' && query.max === '') || (product.price !== null && Number.isFinite(product.price) &&
      (query.min === '' || product.price >= Number(query.min)) && (query.max === '' || product.price <= Number(query.max)))));
  return filtered.sort((a, b) => {
    if (query.sort === 'price-asc' || query.sort === 'price-desc') {
      if (a.price === null) return b.price === null ? a.name.localeCompare(b.name, 'es') : 1;
      if (b.price === null) return -1;
      return (query.sort === 'price-asc' ? a.price - b.price : b.price - a.price) || a.name.localeCompare(b.name, 'es');
    }
    if (query.sort === 'discount') return (productOffer(b)?.percent ?? 0) - (productOffer(a)?.percent ?? 0) || a.name.localeCompare(b.name, 'es');
    return query.sort === 'name-desc' ? b.name.localeCompare(a.name, 'es') : a.name.localeCompare(b.name, 'es');
  });
}
