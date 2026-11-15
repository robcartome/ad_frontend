"use client";
import Image from "next/image";
import { useState } from "react";
import LoadingIndicator from "@/components/feedback/LoadingIndicator";
import ProductArt from "./ProductArt";
export default function CatalogImage({ src, alt, type }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const [loadedSrc, setLoadedSrc] = useState(null);
  return src && failedSrc !== src ? (
    <>
      <Image
        unoptimized
        src={src}
        alt={alt}
        width={360}
        height={270}
        onLoad={() => setLoadedSrc(src)}
        onError={() => setFailedSrc(src)}
        className="sf-catalog-photo"
      />
      {loadedSrc !== src && (
        <span className="ad-image-loading">
          <LoadingIndicator compact label="Cargando imagen…" />
        </span>
      )}
    </>
  ) : (
    <ProductArt type={type} />
  );
}
