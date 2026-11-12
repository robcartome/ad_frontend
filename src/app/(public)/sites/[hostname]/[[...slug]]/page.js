import { notFound, permanentRedirect } from "next/navigation";
import { getStorefrontPage } from "@/lib/tenant/getStorefrontPage";
import { resolveWebsite } from "@/lib/tenant/resolveWebsite";
import { loadTemplate } from "@/templates/registry";

function pagePath(slug) { return slug.length ? `/${slug[0]}` : "/"; }

export async function generateMetadata({ params, searchParams }) {
  const { hostname, slug = [] } = await params;
  if (slug.length > 1) return {};
  const query = await searchParams;
  const pageSlug = slug[0] || "home";
  const [website, page] = await Promise.all([resolveWebsite(hostname), getStorefrontPage(hostname, pageSlug, query?.preview_token || "")]);
  if (!website || !page) return {};
  const canonical = `${website.canonical_url}${pagePath(slug)}`;
  const title = page.page.seo_title || (pageSlug === "home" ? website.seo.title : `${page.page.title} | ${website.name}`);
  const description = page.page.seo_description || website.seo.description;
  const noindex = Boolean(query?.preview_token || website.seo.noindex || page.page.noindex);
  return { title, description, alternates: { canonical }, robots: { index: !noindex, follow: !noindex }, icons: website.theme.favicon_url ? { icon: website.theme.favicon_url } : undefined, openGraph: { title, description, url: canonical, siteName: website.name, locale: website.locale.replace("-", "_"), type: "website", images: page.page.og_image_url ? [{ url: page.page.og_image_url }] : undefined } };
}

export default async function StorefrontPage({ params, searchParams }) {
  const { hostname, slug = [] } = await params;
  if (slug.length > 1) notFound();
  const query = await searchParams;
  const previewToken = query?.preview_token || "";
  const pageSlug = slug[0] || "home";
  const [website, page] = await Promise.all([resolveWebsite(hostname), getStorefrontPage(hostname, pageSlug, previewToken)]);
  if (!website || !page) notFound();
  if (!website.is_primary && !previewToken) {
    const destination = new URL(pagePath(slug), website.canonical_url);
    Object.entries(query || {}).forEach(([key, value]) => { if (typeof value === "string") destination.searchParams.set(key, value); });
    permanentRedirect(destination.toString());
  }
  const webPage = { "@context": "https://schema.org", "@type": "WebPage", name: page.page.seo_title || page.page.title, url: `${website.canonical_url}${pagePath(slug)}`, description: page.page.seo_description || website.seo.description, isPartOf: { "@type": "WebSite", name: website.name, url: website.canonical_url } };
  const { Page } = await loadTemplate(website);
  return <Page page={page} website={website} structuredData={webPage} />;
}
