import "server-only";
import { ServerApiError, serverApiFetch } from "@/lib/api/serverClient";
import { normalizeHost } from "@/lib/tenant/normalizeHost";

export async function getStorefrontPage(hostname, slug, previewToken = "") {
  const host = normalizeHost(hostname);
  if (!host) return null;
  const suffix = previewToken ? `?preview_token=${encodeURIComponent(previewToken)}` : "";
  try {
    return await serverApiFetch(`/storefront/sites/${encodeURIComponent(host)}/pages/${encodeURIComponent(slug)}/${suffix}`, previewToken
      ? { cache: "no-store" }
      : { next: { revalidate: 3600, tags: [`host:${host}`, `page-host:${host}:${slug}`] } });
  } catch (error) {
    if (error instanceof ServerApiError && error.status === 404) return null;
    throw error;
  }
}
