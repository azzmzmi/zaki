# Image Optimization Guide

This project now includes comprehensive image optimization with WebP format support, automatic compression, and responsive image handling.

## Features

✅ **WebP Support** - Automatically serves WebP to modern browsers
✅ **PNG/JPEG Fallback** - Graceful degradation for older browsers  
✅ **Auto Compression** - Reduces file size by 25-35% vs JPEG
✅ **Responsive Images** - Automatic srcset generation for different screen sizes
✅ **Lazy Loading** - Images load only when needed
✅ **Error Handling** - Automatic fallback on load failures
✅ **Performance** - Image preloading and caching strategies

---

## Quick Start

### 1. Using the getImageUrl() Function (Existing)

```jsx
import { getImageUrl } from '@/lib/imageUtils';

function Product({ product }) {
  return (
    <img 
      src={getImageUrl(product.image_url)} 
      alt={product.name}
    />
  );
}
```

### 2. Using OptimizedImage Component (NEW)

Simplest way to use optimized images with WebP support:

```jsx
import OptimizedImage from '@/components/OptimizedImage';

function Product({ product }) {
  return (
    <OptimizedImage 
      src={product.image_url}
      alt={product.name}
      width={400}
      height={400}
      quality={80}
      className="w-full h-auto rounded"
    />
  );
}
```

### 3. Using ResponsiveImage Component (NEW)

For maximum browser compatibility with picture element:

```jsx
import ResponsiveImage from '@/components/ResponsiveImage';

function ProductCard({ product }) {
  return (
    <ResponsiveImage 
      src={product.image_url}
      alt={product.name}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      className="w-full h-auto object-cover"
    />
  );
}
```

---

## API Reference

### getImageUrl(imageUrl)

Handles all URL transformations for local and external images.

```jsx
const url = getImageUrl('/api/uploads/product.jpg');
// Returns: 'http://localhost:8001/api/uploads/product.jpg' (or production URL)
```

### getOptimizedImageUrl(imageUrl, options)

Returns optimized URLs with WebP support.

```jsx
const optimized = getOptimizedImageUrl('/api/uploads/product.jpg', {
  width: 400,
  height: 400,
  quality: 80
});

// Returns:
{
  webp: 'http://localhost:8001/api/uploads/product.jpg?fmt=webp&q=80&w=400&h=400',
  fallback: 'http://localhost:8001/api/uploads/product.jpg?q=80&w=400&h=400',
  srcSet: '...'
}
```

### supportsWebP()

Detects WebP support in the browser.

```jsx
import { supportsWebP } from '@/lib/imageUtils';

if (supportsWebP()) {
  console.log('Browser supports WebP!');
}
```

### getResponsiveImageSrcSet(imageUrl, sizes)

Generates responsive srcset for different screen sizes.

```jsx
import { getResponsiveImageSrcSet } from '@/lib/imageUtils';

const srcset = getResponsiveImageSrcSet('/api/uploads/product.jpg', 
  [400, 600, 800, 1024]
);
// Returns: 'url?w=400 400w, url?w=600 600w, url?w=800 800w, url?w=1024 1024w'
```

### preloadImage(imageUrl) / preloadImages(imageUrls)

Preload images to ensure they're cached before display.

```jsx
import { preloadImages } from '@/lib/imageUtils';

useEffect(() => {
  const imageUrls = products.map(p => p.image_url);
  preloadImages(imageUrls);
}, [products]);
```

---

## Component Props

### OptimizedImage Props

```jsx
<OptimizedImage
  src={string}              // Image URL (required)
  alt={string}              // Alt text (required)
  width={number}            // Image width in pixels
  height={number}           // Image height in pixels
  quality={number}          // Quality 1-100 (default: 80)
  className={string}        // CSS classes
  onLoad={function}         // Load callback
  onError={function}        // Error callback
  {...props}               // Any <img> attributes
/>
```

### ResponsiveImage Props

```jsx
<ResponsiveImage
  src={string}              // Image URL (required)
  alt={string}              // Alt text (required)
  sizes={string}            // CSS media queries (default: '100vw')
  width={number}            // Image width in pixels
  height={number}           // Image height in pixels
  quality={number}          // Quality 1-100 (default: 80)
  className={string}        // CSS classes
  {...props}               // Any <img> attributes
/>
```

---

## Performance Benefits

### File Size Reduction
- WebP: **25-35% smaller** than JPEG
- PNG: Lossless compression available
- JPEG: 20-25% file size reduction at quality 80

### Loading Time Improvements
- **Lazy loading** by default (loads only when needed)
- **Preloading** for hero images and product galleries
- **Srcset** for responsive sizing (serves correct size per device)

### Example: Product Gallery
- Original image: 500 KB (JPEG)
- Optimized WebP: 320 KB (36% reduction)
- With lazy load + preload: 50% faster initial load

---

## Browser Compatibility

| Browser | WebP Support | Fallback |
|---------|-------------|----------|
| Chrome 23+ | ✅ | PNG/JPEG |
| Firefox 65+ | ✅ | PNG/JPEG |
| Edge 18+ | ✅ | PNG/JPEG |
| Safari 14.1+ | ✅ | PNG/JPEG |
| Safari <14.1 | ❌ | PNG/JPEG |
| IE 11 | ❌ | PNG/JPEG |

---

## Migration Guide

### Before (Old Way)
```jsx
<img 
  src={getImageUrl(product.image_url)} 
  alt={product.name}
/>
```

### After (Optimized Way)
```jsx
<OptimizedImage 
  src={product.image_url}
  alt={product.name}
  quality={80}
/>
```

---

## Best Practices

1. **Always set alt text** for accessibility
2. **Use quality 70-80** for photos, 90+ for graphics
3. **Preload hero images** using `preloadImage()`
4. **Use ResponsiveImage** for hero sections and galleries
5. **Set width/height** to prevent layout shift
6. **Use appropriate sizes** attribute for responsive behavior

---

## Troubleshooting

### Images Not Loading
1. Check browser console for errors
2. Verify image URL is correct with `getImageUrl()`
3. Check CORS headers for external URLs
4. Fallback to regular img tag for debugging

### WebP Not Serving
1. Check browser support with `supportsWebP()`
2. Verify backend supports `?fmt=webp` parameter
3. Check image format is supported (not SVG, etc.)
4. Fallback URL should work if WebP fails

### Performance Still Slow
1. Use preloading for critical images
2. Reduce quality parameter (70-75 acceptable)
3. Consider CDN for image hosting
4. Check network tab for large images

---

## Advanced Examples

### Product Gallery with Preloading
```jsx
import OptimizedImage from '@/components/OptimizedImage';
import { preloadImages } from '@/lib/imageUtils';
import { useEffect } from 'react';

export function ProductGallery({ products }) {
  useEffect(() => {
    const imageUrls = products.map(p => p.image_url);
    preloadImages(imageUrls);
  }, [products]);

  return (
    <div className="grid gap-4">
      {products.map(product => (
        <OptimizedImage 
          key={product.id}
          src={product.image_url}
          alt={product.name}
          quality={75}
        />
      ))}
    </div>
  );
}
```

### Hero Image with Responsive Sizes
```jsx
import ResponsiveImage from '@/components/ResponsiveImage';

export function HeroSection({ heroImage }) {
  return (
    <div className="w-full h-96 overflow-hidden">
      <ResponsiveImage 
        src={heroImage}
        alt="Hero"
        sizes="100vw"
        className="w-full h-full object-cover"
        quality={85}
      />
    </div>
  );
}
```

### Image with Error Handling
```jsx
import OptimizedImage from '@/components/OptimizedImage';
import { useState } from 'react';

export function SafeImage({ src, alt }) {
  const [hasError, setHasError] = useState(false);

  return (
    <OptimizedImage 
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className={hasError ? 'opacity-50' : ''}
    />
  );
}
```

---

## Questions?

For more information on image optimization:
- [WebP Format Guide](https://developers.google.com/speed/webp)
- [Responsive Images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)
- [Web Performance](https://web.dev/performance/)
