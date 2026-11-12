import "server-only";

import { ServerApiError, serverApiFetch } from "@/lib/api/serverClient";
import { normalizeHost } from "@/lib/tenant/normalizeHost";

export async function resolveWebsite(hostname) {
  const normalizedHost = normalizeHost(hostname);
  if (!normalizedHost) return null;

  try {
    return await serverApiFetch(
      `/storefront/resolve/?hostname=${encodeURIComponent(normalizedHost)}`,
      { next: { revalidate: 3600, tags: [`host:${normalizedHost}`] } },
    );
  } catch (error) {
    if (error instanceof ServerApiError && error.status === 404) return null;
    throw error;
  }
}
