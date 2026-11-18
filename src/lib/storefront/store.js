import 'server-only';
import { cache } from 'react';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { API_URL } from '@/lib/apiConfig';
import { previewStore } from '@/lib/website/content.mjs';
import { fetchPublicWebsite, resolveRequestHostname } from './public-website.mjs';
import { createStorefrontProductsService } from '@/services/storefrontProductsService.mjs';
import { createStorefrontCategoriesService } from '@/services/storefrontCategoriesService.mjs';

// React cache deduplicates only within this server request, never between hosts.
export const getPublicWebsite = cache(async () => {
  const hostname = resolveRequestHostname((await headers()).get('host'), {
    nodeEnv: process.env.NODE_ENV,
    devHostname: process.env.WEBSITE_DEV_HOSTNAME,
  });
  try { return await fetchPublicWebsite(process.env.WEBSITE_API_V1_URL || API_URL, hostname); }
  catch (error) { if (error.status === 404) notFound(); throw error; }
});
export const getStore = cache(async () => {
  const site = await getPublicWebsite();
  return { ...previewStore({ id: site.websiteId, colors: { background: '#F5F5F6', muted: '#F2F2F2' } }, site.content), mode: 'catalog', currency: site.currency, commerceEnabled: site.commerceEnabled };
});
const getCatalog = cache(async () => {
  const site = await getPublicWebsite();
  const configuration = { baseUrl: process.env.WEBSITE_API_V1_URL || API_URL, hostname: site.hostname, websiteId: site.websiteId };
  return { products: createStorefrontProductsService(configuration), categories: createStorefrontCategoriesService(configuration) };
});
const productPage = cache(async serialized => (await getCatalog()).products.list(JSON.parse(serialized)));
export function getStorefrontProducts(options = {}) { return productPage(JSON.stringify(options)); }
export const getStorefrontProduct = cache(async id => {
  try { return await (await getCatalog()).products.detail(id); }
  catch (error) { if (error.status === 404) return null; throw error; }
});
async function taxonomy(kind) {
  const client = (await getCatalog()).categories;
  const rows = new Map();
  for (let offset = 0; offset < 10000; offset += 100) {
    const page = await client[kind]({ offset, limit: 100 });
    page.results.forEach(row => rows.set(row.id, row));
    if (offset + page.results.length >= page.count) return [...rows.values()];
    if (!page.results.length) throw new Error('No pudimos completar las categorías del catálogo.');
  }
  throw new Error('El catálogo requiere una consulta más específica.');
}
export const getStorefrontCategories = cache(() => taxonomy('list'));
export const getStorefrontBrands = cache(() => taxonomy('brands'));
