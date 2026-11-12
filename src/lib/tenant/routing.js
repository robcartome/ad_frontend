import { normalizeHost } from "./normalizeHost.js";

export const INTERNAL_STOREFRONT_PREFIX = "/sites";

export function decideTenantRoute({ hostname, pathname, controlHosts }) {
  if (
    pathname === INTERNAL_STOREFRONT_PREFIX ||
    pathname.startsWith(`${INTERNAL_STOREFRONT_PREFIX}/`)
  ) {
    return { action: "not-found" };
  }

  const normalizedHost = normalizeHost(hostname);
  if (!normalizedHost) return { action: "not-found" };
  if (controlHosts.has(normalizedHost)) return { action: "next" };

  if (
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/")
  ) {
    return { action: "redirect-admin" };
  }

  const suffix = pathname === "/" ? "" : pathname;
  return {
    action: "rewrite",
    hostname: normalizedHost,
    pathname: `${INTERNAL_STOREFRONT_PREFIX}/${normalizedHost}${suffix}`,
  };
}
