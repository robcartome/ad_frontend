import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import CatalogPagination from "@/components/storefront/CatalogPagination";
import StorefrontProductCard from "@/components/storefront/StorefrontProductCard";
import { resolveWebsite } from "@/lib/tenant/resolveWebsite";
import {
  getStorefrontProducts,
  getStorefrontTaxonomies,
} from "@/services/storefrontService";

function single(value) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function safePage(value) {
  const parsed = Number.parseInt(single(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function queryString(filters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  return params.toString();
}

export async function generateMetadata({ params, searchParams }) {
  const { hostname } = await params;
  const website = await resolveWebsite(hostname);
  if (!website) return {};
  const query = await searchParams;
  const filtered = Boolean(
    single(query.search) || single(query.category) || single(query.brand) || safePage(query.page) > 1,
  );
  const title = `Catálogo | ${website.name}`;
  const description = `Consulta productos, precios y disponibilidad de ${website.name}.`;
  return {
    title,
    description,
    alternates: { canonical: `${website.canonical_url}/catalog` },
    robots: filtered || website.seo.noindex ? { index: false, follow: true } : undefined,
    openGraph: { title, description, url: `${website.canonical_url}/catalog`, type: "website" },
  };
}

export default async function StorefrontCatalogPage({ params, searchParams }) {
  const { hostname } = await params;
  const query = await searchParams;
  const website = await resolveWebsite(hostname);
  if (!website) notFound();

  const filters = {
    search: single(query.search).slice(0, 100),
    category: single(query.category),
    brand: single(query.brand),
    ordering: single(query.ordering),
  };
  const page = safePage(query.page);
  const configuredLimit = Number(website.catalog?.products_per_page || 24);
  const limit = Math.min(60, Math.max(1, configuredLimit));

  if (!website.is_primary) {
    const suffix = queryString({ ...filters, page: page > 1 ? String(page) : "" });
    permanentRedirect(`${website.canonical_url}/catalog${suffix ? `?${suffix}` : ""}`);
  }

  const [catalog, taxonomies] = await Promise.all([
    getStorefrontProducts(hostname, website.website_id, {
      ...filters,
      limit,
      offset: (page - 1) * limit,
    }),
    getStorefrontTaxonomies(hostname, website.website_id),
  ]);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-widest text-[var(--site-accent)]">Productos</p>
        <h1 className="text-3xl font-bold text-slate-950 sm:text-4xl">Catálogo</h1>
        <p className="max-w-2xl text-slate-600">
          Precios y disponibilidad actualizados desde nuestro sistema comercial.
        </p>
      </header>

      <form action="/catalog" method="get" className="grid gap-3 rounded-[var(--site-radius)] border bg-slate-50 p-4 md:grid-cols-[2fr_1fr_1fr_1fr_auto]" role="search">
        <label className="space-y-1 text-sm font-medium">
          <span>Buscar</span>
          <input name="search" defaultValue={filters.search} maxLength={100} placeholder="Nombre o SKU" className="h-10 w-full rounded-lg border bg-white px-3" />
        </label>
        <label className="space-y-1 text-sm font-medium">
          <span>Categoría</span>
          <select name="category" defaultValue={filters.category} className="h-10 w-full rounded-lg border bg-white px-3">
            <option value="">Todas</option>
            {taxonomies.categories.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.product_count})</option>)}
          </select>
        </label>
        <label className="space-y-1 text-sm font-medium">
          <span>Marca</span>
          <select name="brand" defaultValue={filters.brand} className="h-10 w-full rounded-lg border bg-white px-3">
            <option value="">Todas</option>
            {taxonomies.brands.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.product_count})</option>)}
          </select>
        </label>
        <label className="space-y-1 text-sm font-medium">
          <span>Orden</span>
          <select name="ordering" defaultValue={filters.ordering} className="h-10 w-full rounded-lg border bg-white px-3">
            <option value="">Relevancia</option>
            <option value="name">Nombre A–Z</option>
            <option value="-name">Nombre Z–A</option>
            <option value="price">Menor precio</option>
            <option value="-price">Mayor precio</option>
          </select>
        </label>
        <div className="flex items-end gap-2">
          <button type="submit" className="h-10 rounded-lg bg-[var(--site-primary)] px-5 font-semibold text-white">Filtrar</button>
          <Link href="/catalog" className="flex h-10 items-center rounded-lg border bg-white px-3 text-sm">Limpiar</Link>
        </div>
      </form>

      <p className="text-sm text-slate-600" aria-live="polite">
        {catalog.total} {catalog.total === 1 ? "producto" : "productos"}
      </p>

      {catalog.results.length ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {catalog.results.map((product) => <StorefrontProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <div className="rounded-[var(--site-radius)] border border-dashed p-10 text-center text-slate-600">
          No encontramos productos con esos filtros.
        </div>
      )}

      <CatalogPagination total={catalog.total} page={page} limit={limit} filters={filters} />
    </main>
  );
}
