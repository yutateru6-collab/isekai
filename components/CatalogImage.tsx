import React, { useEffect, useRef, useState } from 'react';
import { ImageOff } from 'lucide-react';
export default function CatalogImage({ src, alt, eager = false }: { src: string; alt: string; eager?: boolean }) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const image = useRef<HTMLImageElement>(null);
  useEffect(() => { setState(image.current?.complete && image.current.naturalWidth ? 'ready' : 'loading'); }, [src]);
  return <span className={`catalog-image catalog-image-${state}`}>
    {state === 'error' ? <span className="catalog-image-error"><ImageOff size={24} /><span>画像を読み込めませんでした</span></span> : <img ref={image} src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" onLoad={() => setState('ready')} onError={() => setState('error')} />}
  </span>;
}
