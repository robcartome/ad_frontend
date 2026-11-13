'use client';
import Image from 'next/image';
import { useState } from 'react';
import ProductArt from './ProductArt';
export default function CatalogImage({ src, alt, type }) {
  const [failedSrc, setFailedSrc] = useState(null);
  return src && failedSrc !== src
    ? <Image unoptimized src={src} alt={alt} width={360} height={270} onError={() => setFailedSrc(src)} className="sf-catalog-photo"/>
    : <ProductArt type={type}/>;
}
