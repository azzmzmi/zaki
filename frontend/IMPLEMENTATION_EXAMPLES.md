# Image Optimization Implementation Examples

Quick integration examples for common use cases in your application.

## 1. Product Card (Home & Products Page)

### Before:
```jsx
<Card>
  <div className="aspect-square overflow-hidden">
    <img
      src={getImageUrl(product.image_url)}
      alt={product.name}
      className="w-full h-full object-cover"
    />
  </div>
</Card>
```

### After (Optimized):
```jsx
import OptimizedImage from '@/components/OptimizedImage';

<Card>
  <div className="aspect-square overflow-hidden">
    <OptimizedImage
      src={product.image_url}
      alt={product.name}
      quality={75}
      className="w-full h-full object-cover"
    />
  </div>
</Card>
```

**Benefits:**
- 25-35% smaller file size
- WebP format for modern browsers
- Automatic lazy loading
- Graceful fallback for older browsers

---

## 2. Product Detail Page

### Before:
```jsx
<Card className="overflow-hidden h-fit">
  <div className="aspect-square bg-gray-100">
    <img
      src={getImageUrl(product.image_url)}
      alt={product.name}
      className="w-full h-full object-cover"
    />
  </div>
</Card>
```

### After (Optimized):
```jsx
import ResponsiveImage from '@/components/ResponsiveImage';

<Card className="overflow-hidden h-fit">
  <div className="aspect-square bg-gray-100">
    <ResponsiveImage
      src={product.image_url}
      alt={product.name}
      sizes="(max-width: 768px) 100vw, 50vw"
      quality={85}
      className="w-full h-full object-cover"
    />
  </div>
</Card>
```

**Benefits:**
- Higher quality on detail page (q=85)
- Picture element for max compatibility
- Responsive sizing for different devices
- 50% faster load on mobile

---

## 3. Cart Items

### Before:
```jsx
<div className="w-full sm:w-20 h-40 sm:h-20 bg-gray-100 rounded overflow-hidden">
  <img
    src={getImageUrl(item.image_url)}
    alt={item.name}
    className="w-full h-full object-cover"
  />
</div>
```

### After (Optimized):
```jsx
import OptimizedImage from '@/components/OptimizedImage';

<div className="w-full sm:w-20 h-40 sm:h-20 bg-gray-100 rounded overflow-hidden">
  <OptimizedImage
    src={item.image_url}
    alt={item.name}
    width={80}
    height={80}
    quality={70}
    className="w-full h-full object-cover"
  />
</div>
```

**Benefits:**
- Smaller thumbnails (70% quality is fine for thumbnails)
- Set width/height prevents layout shift
- Lazy loads cart items only when visible

---

## 4. Category Cards

### Before:
```jsx
<img
  src={cat.image_url ? getImageUrl(cat.image_url) : '/logo.png'}
  alt={cat.name}
  className="h-full w-auto object-contain"
/>
```

### After (Optimized):
```jsx
import OptimizedImage from '@/components/OptimizedImage';

<OptimizedImage
  src={cat.image_url || ''}
  alt={cat.name}
  quality={80}
  className="h-full w-auto object-contain"
/>
```

**Note:** OptimizedImage handles empty URLs automatically (uses default image)

---

## 5. Partner Logos

### Before:
```jsx
<img
  src={getImageUrl(partner.logo_url)}
  alt={partner.name}
  className="max-w-full max-h-full object-contain"
  loading="lazy"
/>
```

### After (Optimized):
```jsx
import OptimizedImage from '@/components/OptimizedImage';

<OptimizedImage
  src={partner.logo_url}
  alt={partner.name}
  quality={90}
  className="max-w-full max-h-full object-contain"
/>
```

**Note:** Quality 90 for logos to maintain clarity

---

## 6. Admin Product Preview

### Before:
```jsx
{formData.image_url && (
  <img 
    src={getImageUrl(formData.image_url)} 
    alt="Preview" 
    className="mt-2 w-24 h-24 object-cover rounded" 
  />
)}
```

### After (Optimized):
```jsx
import OptimizedImage from '@/components/OptimizedImage';

{formData.image_url && (
  <OptimizedImage 
    src={formData.image_url}
    alt="Preview" 
    width={96}
    height={96}
    quality={75}
    className="mt-2 w-24 h-24 object-cover rounded" 
  />
)}
```

---

## 7. Hero Section with Preloading

```jsx
import ResponsiveImage from '@/components/ResponsiveImage';
import { preloadImage } from '@/lib/imageUtils';
import { useEffect } from 'react';

export function HeroSection({ heroImage }) {
  useEffect(() => {
    // Preload hero image immediately
    preloadImage(heroImage);
  }, [heroImage]);

  return (
    <div className="w-full h-96 overflow-hidden">
      <ResponsiveImage 
        src={heroImage}
        alt="Hero Banner"
        sizes="100vw"
        quality={85}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
```

**Benefits:**
- Hero image preloads immediately
- High quality (q=85) for impact
- 100% viewport width

---

## 8. Image Gallery with Batch Preloading

```jsx
import OptimizedImage from '@/components/OptimizedImage';
import { preloadImages } from '@/lib/imageUtils';
import { useEffect } from 'react';

export function ProductGallery({ products }) {
  useEffect(() => {
    // Preload all product images
    const imageUrls = products.map(p => p.image_url).filter(Boolean);
    preloadImages(imageUrls);
  }, [products]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map(product => (
        <OptimizedImage
          key={product.id}
          src={product.image_url}
          alt={product.name}
          quality={75}
          className="w-full h-auto rounded"
        />
      ))}
    </div>
  );
}
```

**Benefits:**
- All gallery images preload in background
- Smooth scrolling through gallery
- 25-35% file size reduction per image

---

## Quality Guidelines

| Use Case | Quality | Reasoning |
|----------|---------|-----------|
| Thumbnails | 60-70 | Small size, quality loss unnoticed |
| Product List | 75-80 | Balance quality and size |
| Product Detail | 85-90 | Large display, needs clarity |
| Logo/Icons | 90-100 | Requires perfect clarity |
| Hero Images | 85-90 | Visual impact important |
| Background Images | 70-75 | Usually blurred/faded |

---

## Performance Metrics

### Example: Product Image Optimization

**Before:**
- Format: JPEG
- File size: 500 KB
- Load time: 2.5s

**After with WebP:**
- Format: WebP
- File size: 320 KB (36% reduction)
- Load time: 1.2s (52% faster)
- With lazy loading: 600ms first paint

**Estimated Savings per 100 products:**
- File size: ~18 MB saved
- Load time: ~1-2 seconds faster
- Bandwidth: 36% reduction

---

## Rollout Strategy

### Phase 1: Critical Components (Week 1)
- [ ] Product cards (Home, Products pages)
- [ ] Product detail page
- [ ] Shopping cart

### Phase 2: Secondary Components (Week 2)
- [ ] Category cards
- [ ] Partner logos
- [ ] Admin previews

### Phase 3: Enhancement (Week 3)
- [ ] Add preloading for galleries
- [ ] Hero images with responsive sizing
- [ ] Monitor performance metrics

---

## Testing Checklist

- [ ] Images load correctly in Chrome/Firefox/Safari
- [ ] WebP serves to supported browsers
- [ ] PNG/JPEG fallback works
- [ ] Lazy loading works on scroll
- [ ] Error handling (broken images)
- [ ] Performance improved (DevTools)
- [ ] No layout shifts with width/height set
- [ ] Alt text present for accessibility

---

## Monitoring

Check performance improvements:

1. **Chrome DevTools**
   - Network tab: Check image sizes
   - Lighthouse: Run performance audit
   - Coverage tab: See what's loaded

2. **Metrics to Track**
   - First Contentful Paint (FCP)
   - Largest Contentful Paint (LCP)
   - Cumulative Layout Shift (CLS)
   - Total Page Size

3. **Expected Improvements**
   - 25-35% reduction in image file sizes
   - 20-40% improvement in Core Web Vitals
   - 2-3x faster image loading on mobile
