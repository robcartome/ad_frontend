import "server-only";

import { ServerApiError, serverApiFetch } from "@/lib/api/serverClient";
import { normalizeHost } from "@/lib/tenant/normalizeHost";

function sitePath(hostname, suffix) {
  const host = normalizeHost(hostname);
  if (!host) return null;
  return `/storefront/sites/${encodeURIComponent(host)}${suffix}`;
}

function catalogOptions(websiteId) {
  return {
    next: {
      revalidate: 300,
      tags: [`catalog:${websiteId}`, `site:${websiteId}`],
    },
  };
}

export async function getStorefrontProducts(hostname, websiteId, filters = {}) {
  const endpoint = sitePath(hostname, "/products/");
  if (!endpoint) return null;
  const params = new URLSearchParams();
  for (const key of ["search", "category", "brand", "ordering", "limit", "offset"]) {
    if (filters[key] !== undefined && filters[key] !== "") {
      params.set(key, String(filters[key]));
    }
  }
  return serverApiFetch(`${endpoint}?${params}`, catalogOptions(websiteId));
}

export async function getStorefrontProduct(hostname, websiteId, identifier) {
  const endpoint = sitePath(
    hostname,
    `/products/${encodeURIComponent(identifier)}/`,
  );
  if (!endpoint) return null;
  try {
    return await serverApiFetch(endpoint, catalogOptions(websiteId));
  } catch (error) {
    if (error instanceof ServerApiError && error.status === 404) return null;
    throw error;
  }
}

export async function getStorefrontTaxonomies(hostname, websiteId) {
  const categoriesEndpoint = sitePath(hostname, "/categories/");
  const brandsEndpoint = sitePath(hostname, "/brands/");
  if (!categoriesEndpoint || !brandsEndpoint) {
    return { categories: [], brands: [] };
  }
  const options = catalogOptions(websiteId);
  const [categories, brands] = await Promise.all([
    serverApiFetch(categoriesEndpoint, options),
    serverApiFetch(brandsEndpoint, options),
  ]);
  return { categories, brands };
}

export async function quoteStorefrontCart(hostname, lines, forwardedFor = "") {
  const endpoint = sitePath(hostname, "/cart/quote/");
  if (!endpoint) return null;
  return serverApiFetch(endpoint, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(forwardedFor ? { "X-Forwarded-For": forwardedFor } : {}),
    },
    body: JSON.stringify({ lines }),
  });
}
