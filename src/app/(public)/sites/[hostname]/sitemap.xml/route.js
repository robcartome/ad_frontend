import { getStorefrontManifest } from "@/lib/tenant/getStorefrontManifest";

function escapeXml(value) {
  return String(value).replace(
    /[<>&'"]/g,
    (character) =>
      ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[
        character
      ],
  );
}

function urlEntry(location, updatedAt) {
  const lastModified = updatedAt
    ? `<lastmod>${escapeXml(updatedAt)}</lastmod>`
    : "";
  return `<url><loc>${escapeXml(location)}</loc>${lastModified}</url>`;
}

export async function GET(request, { params }) {
  const { hostname } = await params;
  const manifest = await getStorefrontManifest(hostname);
  if (!manifest) return new Response("Not found", { status: 404 });

  const entries = manifest.default_noindex
    ? []
    : [
        ...manifest.pages
          .filter((page) => !page.noindex)
          .map((page) =>
            urlEntry(
              `${manifest.canonical_url}${page.slug === "home" ? "/" : `/${page.slug}`}`,
              page.updated_at,
            ),
          ),
        urlEntry(`${manifest.canonical_url}/catalog`),
        ...(manifest.products || []).map((product) =>
          urlEntry(
            `${manifest.canonical_url}/productos/${product.slug}`,
            product.updated_at,
          ),
        ),
      ];

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join("")}</urlset>`,
    {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    },
  );
}
