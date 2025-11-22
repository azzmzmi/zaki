import { useState, useEffect } from 'react';
import { getOptimizedImageUrl, supportsWebP, getImageUrl, getSizeForContext } from '@/lib/imageUtils';
import { cacheImage } from '@/lib/imageCache';

/**
 * OptimizedImage Component
 * Automatically serves WebP to supported browsers with PNG/JPEG fallback
 * Includes lazy loading, error handling, and responsive sizing
 * Supports both explicit dimensions and preset sizes
 * 
 * Usage:
 * <OptimizedImage 
 *   src="image-url" 
 *   alt="description"
 *   size="grid" // Uses preset: 200x200, quality: 75
 * />
 * OR
 * <OptimizedImage 
 *   src="image-url" 
 *   alt="description"
 *   width={400}
 *   height={400}
 *   quality={80}
 * />
 * 
 * Size presets:
 * - 'thumbnail': 80x80, q:70 (admin tables)
 * - 'small': 200x200, q:75 (grids, cards)
 * - 'medium': 400x400, q:80 (home page)
 * - 'large': 600x600, q:85 (detail preview)
 * - 'full': 1200x800, q:90 (product detail page)
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  quality,
  size,
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

    // Check cache first
    const cacheStatus = cacheImage.getStatus(src);
    
    if (cacheStatus === 'loaded') {
      // Already cached and loaded successfully
      try {
        let options = {};
        if (size) {
          options.size = size;
        } else if (width || height || quality !== undefined) {
          if (width) options.width = width;
          if (height) options.height = height;
          if (quality !== undefined) options.quality = quality;
        } else {
          options.size = 'medium';
        }
        const optimized = getOptimizedImageUrl(src, options);
        const urlToUse = webpSupported ? optimized.webp : optimized.fallback;
        setImageSrc(urlToUse);
        setIsLoading(false);
      } catch (error) {
        console.error('Error optimizing cached image:', error);
        setImageSrc(getImageUrl(src));
        setIsLoading(false);
      }
      return;
    }

    try {
      // Mark as loading
      cacheImage.markLoading(src);

      // Determine optimization options
      let options = {};
      
      if (size) {
        // Use preset size
        options.size = size;
      } else if (width || height || quality !== undefined) {
        // Use explicit dimensions
        if (width) options.width = width;
        if (height) options.height = height;
        if (quality !== undefined) options.quality = quality;
      } else {
        // Default to medium size
        options.size = 'medium';
      }
      
      const optimized = getOptimizedImageUrl(src, options);
      // Use WebP if supported, otherwise use fallback
      const urlToUse = webpSupported ? optimized.webp : optimized.fallback;
      setImageSrc(urlToUse);
      setIsLoading(true);
    } catch (error) {
      console.error('Error optimizing image:', error);
      setImageSrc(getImageUrl(src));
      setIsLoading(true);
    }
  }, [src, width, height, quality, size, webpSupported]);

  const handleLoad = (e) => {
    // Mark as successfully loaded in cache
    if (src) {
      cacheImage.markLoaded(src);
    }
    setIsLoading(false);
    setHasError(false);
    onLoad?.(e);
  };

  const handleError = (e) => {
    setIsLoading(false);
    setHasError(true);
    
    // Check if we should retry
    const canRetry = src ? cacheImage.markError(src, e.message) : false;
    
    // Try fallback if WebP failed
    if (webpSupported && imageSrc && imageSrc.includes('fmt=webp')) {
      try {
        let options = {};
        if (size) {
          options.size = size;
        } else if (width || height || quality !== undefined) {
          if (width) options.width = width;
          if (height) options.height = height;
          if (quality !== undefined) options.quality = quality;
        } else {
          options.size = 'medium';
        }
        const optimized = getOptimizedImageUrl(src, options);
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
