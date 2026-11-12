import 'server-only';
import { demoCategories, demoProducts } from '@/data/demo/storefront';
const demoStore = {
    id: 'tolentino-soledad-demo', name: 'Ferretería Tolentino', shortName: 'TOLENTINO',
    location: 'La Soledad', template: 'ecommerce', mode: 'demo',
    whatsapp: null, phone: null, address: null, hours: null,
    colors: { primary: '#FF8000', background: '#f5f5f6', muted: '#F2F2F2' },
    description: 'Herramientas, materiales y asesoría para construir tus proyectos.',
};
// Resolución explícita para desarrollo. No habilitar dominios ni API hasta tener contrato seguro.
export function getStore() { return demoStore; }
export function getStorefrontCategories() { return demoCategories; }
export function getStorefrontProducts() { return demoProducts; }
export function getStorefrontProduct(id) { return demoProducts.find(product => product.id === id) ?? null; }
