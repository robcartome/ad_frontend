"use client";

import { useState } from "react";

export default function ProductImage({ src, alt, className = "" }) {
  const [failed, setFailed] = useState(!src);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-100 text-center text-sm text-slate-500 ${className}`}
        role="img"
        aria-label={`Sin imagen: ${alt}`}
      >
        Imagen no disponible
      </div>
    );
  }

  // Product media is already resized by the backend and can use a tenant R2 host.
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
