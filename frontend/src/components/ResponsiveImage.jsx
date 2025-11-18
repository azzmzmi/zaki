import { getOptimizedImageUrl, getImageUrl, supportsWebP } from '@/lib/imageUtils';

/**
 * ResponsiveImage Component
 * Uses <picture> element for maximum browser compatibility
 * Serves WebP to modern browsers, PNG/JPEG to older ones
 * 
 * Usage:
 * <ResponsiveImage 
 *   src="image-url"
 *   alt="description"
 *   sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
 *   className="w-full h-auto"
 * />
 */
export default function ResponsiveImage({
  src,
  alt,
  sizes = '100vw',
  className = '',
  width,
  height,
  quality = 80,
  ...props
}) {
  if (!src) {
    src = '';
  }

  const optimized = getOptimizedImageUrl(src, { width, height, quality });
  const baseUrl = getImageUrl(src);
  const webpSupported = supportsWebP();

  return (
    <picture>
      {/* WebP format for modern browsers */}
      {webpSupported && (
        <source
          srcSet={optimized.webp}
          type="image/webp"
        />
      )}
      {/* Fallback for older browsers */}
      <img
        src={optimized.fallback}
        alt={alt}
        sizes={sizes}
        srcSet={optimized.srcSet}
        className={className}
        loading="lazy"
        width={width}
        height={height}
        {...props}
      />
    </picture>
  );
}
