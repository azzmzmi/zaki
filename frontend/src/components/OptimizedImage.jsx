import { useState, useEffect } from 'react';
import { getOptimizedImageUrl, supportsWebP, getImageUrl } from '@/lib/imageUtils';

/**
 * OptimizedImage Component
 * Automatically serves WebP to supported browsers with PNG/JPEG fallback
 * Includes lazy loading, error handling, and responsive sizing
 * 
 * Usage:
 * <OptimizedImage 
 *   src="image-url" 
 *   alt="description"
 *   width={400}
 *   height={400}
 *   quality={80}
 * />
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  quality = 80,
  className = '',
  onLoad,
  onError,
  ...props
}) {
  const [imageSrc, setImageSrc] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [webpSupported] = useState(() => supportsWebP());

  useEffect(() => {
    if (!src) {
      setImageSrc(getImageUrl(''));
      setIsLoading(false);
      return;
    }

    try {
      const optimized = getOptimizedImageUrl(src, { width, height, quality });
      // Use WebP if supported, otherwise use fallback
      const urlToUse = webpSupported ? optimized.webp : optimized.fallback;
      setImageSrc(urlToUse);
    } catch (error) {
      console.error('Error optimizing image:', error);
      setImageSrc(getImageUrl(src));
    }
  }, [src, width, height, quality, webpSupported]);

  const handleLoad = (e) => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.(e);
  };

  const handleError = (e) => {
    setIsLoading(false);
    setHasError(true);
    
    // Try fallback if WebP failed
    if (webpSupported && imageSrc.includes('fmt=webp')) {
      try {
        const optimized = getOptimizedImageUrl(src, { width, height, quality });
        setImageSrc(optimized.fallback);
      } catch {
        setImageSrc(getImageUrl(src));
      }
    } else {
      onError?.(e);
    }
  };

  return (
    <div className="relative">
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${isLoading ? 'animate-pulse' : ''}`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        {...props}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 animate-pulse rounded" />
      )}
    </div>
  );
}
