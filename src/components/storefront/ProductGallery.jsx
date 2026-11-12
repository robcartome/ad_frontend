"use client";

import { useState } from "react";
import ProductImage from "@/components/storefront/ProductImage";

export default function ProductGallery({ product }) {
  const images = product.images?.length ? product.images : [product.image].filter(Boolean);
  const [selected, setSelected] = useState(images[0] || "");

  return (
    <div className="space-y-3">
      <ProductImage
        src={selected}
        alt={product.name}
        className="aspect-square w-full rounded-[var(--site-radius)] border bg-white object-contain p-6"
      />
      {images.length > 1 ? (
        <div className="grid grid-cols-4 gap-2" aria-label="Galería del producto">
          {images.map((image, index) => (
            <button
              type="button"
              key={image}
              onClick={() => setSelected(image)}
              className={`rounded-lg border p-1 ${selected === image ? "border-[var(--site-primary)] ring-1 ring-[var(--site-primary)]" : "border-slate-200"}`}
              aria-label={`Ver imagen ${index + 1}`}
            >
              <ProductImage src={image} alt="" className="aspect-square w-full object-contain" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
