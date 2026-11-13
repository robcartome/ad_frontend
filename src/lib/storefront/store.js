import 'server-only';
import { demoCategories, demoProducts } from '@/data/demo/storefront';
import { normalizeCategory, normalizeProduct } from '@/lib/commerce/catalog.mjs';
const products = demoProducts.map(normalizeProduct);
const categories = demoCategories.map(normalizeCategory);
const demoStore = {
    id: 'tolentino-soledad-demo', name: 'Ferretería Tolentino', shortName: 'TOLENTINO',
    location: 'La Soledad', template: 'ecommerce', mode: 'demo',
    whatsapp: null, phone: null, secondaryPhone: null, email: null, address: null, hours: null, socials: {},
    colors: { primary: '#FF8000', background: '#f5f5f6', muted: '#F2F2F2' },
    description: 'Herramientas, materiales y asesoría para construir tus proyectos.',
};
// Resolución explícita para desarrollo. No habilitar dominios ni API hasta tener contrato seguro.
export function getStore() { return demoStore; }
export function getStorefrontCategories() { return categories; }
export function getStorefrontProducts() { return products; }
export function getStorefrontProduct(id) { return products.find(product => product.id === id) ?? null; }
