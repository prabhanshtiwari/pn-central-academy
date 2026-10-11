import { useEffect, useState } from 'react';
import { getMediaUrl } from '../lib/api';

export default function AssetImage({ src, fallback, alt, className = '', loading = 'lazy' }) {
  const [currentSrc, setCurrentSrc] = useState(getMediaUrl(src));
  const [triedFallback, setTriedFallback] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCurrentSrc(getMediaUrl(src));
    setTriedFallback(false);
    setFailed(false);
  }, [src]);

  function handleError() {
    if (!triedFallback && fallback && currentSrc !== fallback) {
      setTriedFallback(true);
      setCurrentSrc(fallback);
      return;
    }
    setFailed(true);
  }

  if (failed) return <div className={`image-placeholder ${className}`} role="img" aria-label={alt}><span>PN</span></div>;
  return <img className={className} src={currentSrc} alt={alt} loading={loading} onError={handleError} />;
}
