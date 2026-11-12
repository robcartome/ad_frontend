import { NextResponse } from "next/server";

import { parseHostList } from "./lib/tenant/normalizeHost.js";
import { decideTenantRoute } from "./lib/tenant/routing.js";

const controlHosts = parseHostList(process.env.APUDIG_CONTROL_HOSTS, [
  "localhost",
  "apudig.vercel.app",
  "web.apudig.com",
]);

function adminOrigin(request) {
  const configured = process.env.APUDIG_ADMIN_ORIGIN;
  if (configured) {
    try {
      return new URL(configured);
    } catch {
      // A malformed deployment value must not become an open redirect.
    }
  }
  if (request.nextUrl.hostname.endsWith(".localhost")) {
    const local = new URL(request.url);
    local.hostname = "localhost";
    return local;
  }
  return new URL("https://web.apudig.com");
}

export function proxy(request) {
  const decision = decideTenantRoute({
    hostname: request.nextUrl.hostname,
    pathname: request.nextUrl.pathname,
    controlHosts,
  });

  if (decision.action === "not-found") {
    return new Response("Sitio no encontrado", { status: 404 });
  }
  if (decision.action === "next") return NextResponse.next();

  if (decision.action === "redirect-admin") {
    const destination = adminOrigin(request);
    destination.pathname = request.nextUrl.pathname;
    destination.search = request.nextUrl.search;
    return NextResponse.redirect(destination, 307);
  }

  const destination = request.nextUrl.clone();
  destination.pathname = decision.pathname;
  return NextResponse.rewrite(destination);
}

export const config = {
  matcher: [
    "/sites/:path*",
    "/sitemap.xml",
    "/robots.txt",
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.[^/]+$).*)",
  ],
};
