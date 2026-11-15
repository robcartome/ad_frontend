'use client';
import Image from 'next/image';
import { useState } from 'react';
import LoadingIndicator from './LoadingIndicator';

export default function LoadingImage({ onLoad, onError, ...props }) {
  const [settled, setSettled] = useState(null);
  return <><Image {...props} onLoad={event => { setSettled(props.src); onLoad?.(event); }} onError={event => { setSettled(props.src); onError?.(event); }}/>{settled !== props.src && <span className="ad-image-loading"><LoadingIndicator compact label="Cargando imagen…"/></span>}</>;
}
