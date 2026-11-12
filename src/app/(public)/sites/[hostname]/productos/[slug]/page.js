import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import ProductGallery from "@/components/storefront/ProductGallery";
import { AddToCartButton } from "@/components/storefront/CartControls";
import { resolveWebsite } from "@/lib/tenant/resolveWebsite";
import { getStorefrontProduct } from "@/services/storefrontService";

function money(value, currency) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency }).format(Number(value || 0));
}

async function productContext(paramsPromise) {
  const { hostname, slug } = await paramsPromise;
  const website = await resolveWebsite(hostname);
  if (!website) return { website: null, product: null, hostname, slug };
  const product = await getStorefrontProduct(hostname, website.website_id, slug);
  return { website, product, hostname, slug };
}

export async function generateMetadata({ params }) {
  const { website, product } = await productContext(params);
  if (!website || !product) return {};
  const title = product.seo_title || `${product.name} | ${website.name}`;
  const description = product.seo_description || product.description || `Consulta precio y disponibilidad de ${product.name}.`;
  const url = `${website.canonical_url}/productos/${product.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: website.seo.noindex ? { index: false, follow: true } : undefined,
    openGraph: { title, description, url, type: "website", images: product.image ? [{ url: product.image, alt: product.name }] : undefined },
  };
}

export default async function StorefrontProductPage({ params }) {
  const { website, product } = await productContext(params);
  if (!website || !product) notFound();
  if (!website.is_primary) permanentRedirect(`${website.canonical_url}/productos/${product.slug}`);

  const availability = {
    AVAILABLE: "Disponible",
    OUT_OF_STOCK: "Agotado",
    UNKNOWN: "Consultar disponibilidad",
  }[product.availability];
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    description: product.description || undefined,
    image: product.images,
    brand: product.brand ? { "@type": "Brand", name: product.brand.name } : undefined,
    offers: {
      "@type": "Offer",
      url: `${website.canonical_url}/productos/${product.slug}`,
      priceCurrency: product.currency,
      price: product.price,
      availability: product.availability === "AVAILABLE" ? "https://schema.org/InStock" : product.availability === "OUT_OF_STOCK" ? "https://schema.org/OutOfStock" : "https://schema.org/LimitedAvailability",
    },
  };
  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: website.canonical_url },
      { "@type": "ListItem", position: 2, name: "Catálogo", item: `${website.canonical_url}/catalog` },
      { "@type": "ListItem", position: 3, name: product.name },
    ],
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Migas de pan" className="mb-6 flex flex-wrap gap-2 text-sm text-slate-500">
        <Link href="/">Inicio</Link><span aria-hidden="true">/</span>
        <Link href="/catalog">Catálogo</Link><span aria-hidden="true">/</span>
        <span aria-current="page">{product.name}</span>
      </nav>
      <div className="grid gap-8 lg:grid-cols-2">
        <ProductGallery product={product} />
        <section className="space-y-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--site-accent)]">{product.category?.name || "Producto"}</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">{product.name}</h1>
            <p className="mt-2 text-sm text-slate-500">SKU {product.sku}{product.brand ? ` · ${product.brand.name}` : ""}</p>
          </div>
          <p className="text-3xl font-bold text-[var(--site-primary)]">{money(product.price, product.currency)}</p>
          <p className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${product.availability === "OUT_OF_STOCK" ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>{availability}</p>
          <AddToCartButton product={product} withQuantity />
          {product.description ? <p className="whitespace-pre-line leading-7 text-slate-700">{product.description}</p> : null}
          <div className="rounded-[var(--site-radius)] border bg-slate-50 p-4 text-sm text-slate-600">
            El precio y la disponibilidad se consultan directamente en nuestro sistema. Para confirmar cantidades, contáctanos.
          </div>
        </section>
      </div>
    </main>
  );
}
