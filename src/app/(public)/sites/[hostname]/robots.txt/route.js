import { getStorefrontManifest } from "@/lib/tenant/getStorefrontManifest";

export async function GET(request, { params }) {
  const { hostname } = await params;
  const manifest = await getStorefrontManifest(hostname);
  if (!manifest) return new Response("Not found", { status: 404 });
  const rules = manifest.default_noindex ? "User-agent: *\nDisallow: /" : `User-agent: *\nAllow: /\nSitemap: ${manifest.canonical_url}/sitemap.xml`;
  return new Response(`${rules}\n`, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=300" } });
}
