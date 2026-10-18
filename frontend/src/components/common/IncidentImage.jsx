import React, { useState, useEffect } from 'react';
import { getDisasterImage } from '../../utils/disasterAssets';

/**
 * Robust Incident Image Component
 * - Catches image load errors (network failures, 404, CORS) and falls back to theme-matched vector SVGs
 * - Detects Unsplash URLs and provides fallback without showing broken image icons
 * - Supports citizen-uploaded base64 and valid photo URLs
 */
export default function IncidentImage({
  src,
  alt = 'Incident proof',
  disasterType = 'Emergency',
  className = '',
  onClick,
}) {
  const fallback = getDisasterImage(disasterType);

  // If no source is provided or it's an external unsplash link that may fail,
  // we start with the high-reliability vector SVG.
  const initialSrc = !src || typeof src !== 'string' || src.includes('unsplash.com') ? fallback : src;
  const [imgSrc, setImgSrc] = useState(initialSrc);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!src || typeof src !== 'string' || src.includes('unsplash.com')) {
      setImgSrc(fallback);
      setHasError(false);
    } else {
      setImgSrc(src);
      setHasError(false);
    }
  }, [src, disasterType, fallback]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallback);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onClick={onClick}
      loading="lazy"
      onError={handleError}
    />
  );
}
