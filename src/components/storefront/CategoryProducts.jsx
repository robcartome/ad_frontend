"use client";

import Link from "@/components/feedback/LoadingLink";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Grid2X2, ShoppingBag } from "lucide-react";
import { categoryProducts } from "@/lib/commerce/catalog.mjs";
import ProductCard from "@/components/commerce/ProductCard";
import CategoryIcon from "./CategoryIcon";
import HorizontalRail from "./HorizontalRail";
import { API_URL } from '@/lib/apiConfig';
import { createStorefrontProductsService } from '@/services/storefrontProductsService.mjs';
import LoadingIndicator from '@/components/feedback/LoadingIndicator';

export default function CategoryProducts({
  title,
  categories,
  products,
  demo = false,
  serverSelection = false,
  hostname,
  websiteId,
  cta,
}) {
  const [categoryId, setCategoryId] = useState(null);
  const [selection, setSelection] = useState(null);
  const [retry, setRetry] = useState(0);
  const client = useMemo(() => serverSelection ? createStorefrontProductsService({ baseUrl: API_URL, hostname, websiteId }) : null, [serverSelection, hostname, websiteId]);
  useEffect(() => {
    if (!client || categoryId === null) return;
    const controller = new AbortController();
    setSelection({ categoryId, loading: true, products: [] });
    client.list({ category: [categoryId], featured: true, ordering: 'featured', limit: 12, signal: controller.signal }).then(page => {
      if (!controller.signal.aborted) setSelection({ categoryId, products: page.results });
    }).catch(() => {
      if (!controller.signal.aborted) setSelection({ categoryId, products: [], error: true });
    });
    return () => controller.abort();
  }, [client, categoryId, retry]);
  const selected = categories.find((category) => category.id === categoryId);
  const current = selection?.categoryId === categoryId ? selection : null;
  const loading = serverSelection && categoryId !== null && (!current || current.loading);
  const visible = serverSelection ? categoryId === null ? products : current?.products || [] : categoryProducts(products, categoryId);

  return (
    <section
      className="sf-container sf-section sf-category-products"
      aria-label={title}
    >
      <div className="sf-section-heading">
        <div>
          <span className="sf-eyebrow">ENCUENTRA TU PRÓXIMO PROYECTO</span>
          <h2>{title}</h2>
          <p>
            {demo
              ? "Selección y ofertas de demostración. Explora por categoría."
              : "Descubre ofertas disponibles y productos para cada especialidad."}
          </p>
        </div>
        <div className="sf-showcase-cta">
          <Link
            className="sf-button sf-button-orange"
            href={cta?.href || "/shop"}
          >
            {cta?.ctaLabel || "Ver más productos"}
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
      <div
        className="sf-category-tabs sf-horizontal-scroll"
        role="group"
        aria-label="Filtrar productos por categoría"
      >
        <button
          type="button"
          aria-pressed={categoryId === null}
          onClick={() => setCategoryId(null)}
        >
          <Grid2X2 size={18} /> Todos
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            aria-pressed={categoryId === category.id}
            onClick={() => setCategoryId(category.id)}
          >
            <CategoryIcon type={category.icon} size={18} />
            {category.name}
          </button>
        ))}
      </div>
      <p className="sf-sr-only" role="status" aria-live="polite">
        {loading ? 'Cargando productos destacados' : `${visible.length} productos en ${selected?.name || 'todas las categorías'}`}
      </p>
      {loading ? <LoadingIndicator label="Cargando productos destacados…"/> : current?.error && serverSelection && categoryId !== null ? <div className="sf-category-empty"><p role="alert">No pudimos cargar los productos de esta categoría.</p><button type="button" className="sf-button sf-button-orange" onClick={() => setRetry(value => value + 1)}>Reintentar</button></div> : visible.length ? (
        <HorizontalRail
          key={categoryId ?? "all"}
          label={`Productos de ${selected?.name || "todas las categorías"}`}
          className="sf-product-rail"
        >
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </HorizontalRail>
      ) : (
        <div className="sf-category-empty">
          <ShoppingBag size={28} />
          <p>No hay productos para esta categoría por el momento.</p>
          <Link href="/shop">
            Explorar la tienda <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </section>
  );
}
