import BlockRenderer from "@/components/storefront/blocks/BlockRenderer";
import { getStorefrontProducts, getStorefrontTaxonomies } from "@/services/storefrontService";
import StorefrontProductCard from "@/components/storefront/StorefrontProductCard";
import Link from "next/link";

async function EcommerceSection({ section, website }) {
  if (!section.enabled) return null;
  const { config } = section;
  if (section.section_type === "whatsapp_cta.v1") {
    const phone = (website.contact.whatsapp || "").replace(/\D/g, "");
    if (!phone) return null;
    return <section className="bg-emerald-50 px-6 py-14 text-center"><h2 className="text-3xl font-bold">{config.title}</h2><p className="mx-auto mt-3 max-w-xl">{config.body}</p><a className="mt-6 inline-block rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white" href={`https://wa.me/${phone}`} target="_blank" rel="noopener noreferrer">{config.button_label || "Escríbenos"}</a></section>;
  }
  if (section.section_type === "categories.v1" || section.section_type === "brands.v1") {
    const data = await getStorefrontTaxonomies(website.hostname, website.website_id);
    const items = section.section_type === "categories.v1" ? data.categories : data.brands;
    return <section className="mx-auto max-w-7xl px-6 py-14"><h2 className="mb-6 text-3xl font-bold">{config.title}</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{items.slice(0, config.limit || 8).map((item) => <Link key={item.id} href={`/catalog?${section.section_type === "categories.v1" ? "category" : "brand"}=${encodeURIComponent(item.id)}`} className="rounded-xl border bg-white p-5 font-semibold hover:border-[var(--site-primary)]">{item.name}</Link>)}</div></section>;
  }
  if (section.section_type === "featured_products.v1") {
    const catalog = await getStorefrontProducts(website.hostname, website.website_id, { limit: config.limit || 8, offset: 0 });
    return <section className="mx-auto max-w-7xl px-6 py-14"><h2 className="mb-6 text-3xl font-bold">{config.title}</h2><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{(catalog?.results || []).map((product) => <StorefrontProductCard key={product.id} product={product} />)}</div></section>;
  }
  return <BlockRenderer section={section} website={website} />;
}

export default function EcommercePage({ page, website, structuredData }) {
  return (
    <main className="min-h-screen" style={{ backgroundColor: website.theme.background_color, color: website.theme.text_color }}>
      {structuredData ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} /> : null}
      {page.sections.map((section) => <EcommerceSection key={section.id} section={section} website={website} />)}
    </main>
  );
}
