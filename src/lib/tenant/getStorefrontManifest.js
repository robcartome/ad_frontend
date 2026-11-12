import "server-only";
import { ServerApiError, serverApiFetch } from "@/lib/api/serverClient";
import { normalizeHost } from "@/lib/tenant/normalizeHost";

export async function getStorefrontManifest(hostname) {
  const host = normalizeHost(hostname);
  if (!host) return null;
  try {
    return await serverApiFetch(`/storefront/sites/${encodeURIComponent(host)}/manifest/`, {
      next: { revalidate: 3600, tags: [`host:${host}`] },
    });
  } catch (error) {
    if (error instanceof ServerApiError && error.status === 404) return null;
    throw error;
  }
}
