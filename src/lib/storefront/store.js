import 'server-only';
import { cache } from 'react';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { API_URL } from '@/lib/apiConfig';
import { previewStore } from '@/lib/website/content.mjs';
import { fetchPublicWebsite, resolveRequestHostname } from './public-website.mjs';

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
  return { ...previewStore({ id: site.websiteId, colors: { background: '#F5F5F6', muted: '#F2F2F2' } }, site.content), mode: 'informational', commerceEnabled: false, whatsapp: null };
});
// B4 has not been enabled. No demo products, prices or simulated identifiers.
export function getStorefrontCategories() { return []; }
export function getStorefrontProducts() { return []; }
export function getStorefrontProduct() { return null; }
