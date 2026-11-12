import Link from "next/link";

import ProductImage from "@/components/storefront/ProductImage";
import { AddToCartButton } from "@/components/storefront/CartControls";

function money(value, currency) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: currency || "PEN",
  }).format(Number(value || 0));
}

export default function StorefrontProductCard({ product }) {
  const availability = {
    AVAILABLE: "Disponible",
    OUT_OF_STOCK: "Agotado",
    UNKNOWN: "Consultar disponibilidad",
  }[product.availability];

  return (
    <article className="group overflow-hidden rounded-[var(--site-radius)] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/productos/${product.slug}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--site-primary)]">
        <ProductImage
          src={product.thumbnail || product.image}
          alt={product.name}
          className="aspect-square w-full object-contain p-4"
        />
        <div className="space-y-2 px-4 pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {product.category?.name || "Producto"}
          </p>
          <h2 className="line-clamp-2 min-h-12 font-semibold text-slate-900 group-hover:text-[var(--site-primary)]">
            {product.name}
          </h2>
          <p className="text-sm text-slate-500">SKU {product.sku}</p>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <strong className="text-lg text-[var(--site-primary)]">
              {money(product.price, product.currency)}
            </strong>
            <span className={`text-xs font-medium ${product.availability === "OUT_OF_STOCK" ? "text-rose-600" : "text-emerald-700"}`}>
              {availability}
            </span>
          </div>
        </div>
      </Link>
      <div className="p-4"><AddToCartButton product={product} /></div>
    </article>
  );
}
