/**
 * Get the full image URL for a product
 * Handles external URLs (Unsplash), local backend uploads, and GoDaddy FTP uploads
 * Automatically optimizes to WebP format when supported
 */
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) {
    // Default fallback image with optimization
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&h=400&q=80';
  }
  
  // If it's an external URL (starts with http:// or https://), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
  const isLocalhost = backendUrl.includes('localhost') || backendUrl.includes('127.0.0.1');
  
  // If it's the /api/uploads path (local uploads or fallback)
  if (imageUrl.startsWith('/api/uploads/')) {
    // Use the backend URL directly for API uploads
    return `${backendUrl}${imageUrl}`;
  }
  
  // If it's a relative path (starts with /), prepend backend URL
  if (imageUrl.startsWith('/')) {
    return `${backendUrl}${imageUrl}`;
  }
  
  // Otherwise, assume it's a relative path without leading slash
  return `${backendUrl}/${imageUrl}`;
};

/**
 * Get optimized image URL with WebP format support and compression
 * Automatically serves WebP to supported browsers, PNG/JPEG as fallback
 * Includes quality optimization and responsive sizing
 * 
 * @param {string} imageUrl - Original image URL
 * @param {object} options - Optimization options
 * @param {number} options.width - Desired width in pixels
 * @param {number} options.height - Desired height in pixels
 * @param {number} options.quality - Quality 1-100 (default: 80)
 * @param {string} options.size - Preset size: 'thumbnail', 'small', 'medium', 'large', 'full'
 * @returns {object} Object with webp and fallback URLs
 */
export const getOptimizedImageUrl = (imageUrl, options = {}) => {
  const { quality, size = 'medium' } = options;
  let { width, height } = options;
  
  // Apply preset sizes if provided
  const sizePresets = {
    thumbnail: { width: 80, height: 80, quality: 70 },
    small: { width: 200, height: 200, quality: 75 },
    medium: { width: 400, height: 400, quality: 80 },
    large: { width: 600, height: 600, quality: 85 },
    full: { width: 1200, height: 800, quality: 90 }
  };
  
  if (sizePresets[size]) {
    const preset = sizePresets[size];
    if (!width) width = preset.width;
    if (!height) height = preset.height;
    if (quality === undefined) {
      // Use preset quality but continue to build the full object
    }
  }
  
  const baseUrl = getImageUrl(imageUrl);
  
  // For external URLs (Unsplash, etc.), leverage their optimization
  if (baseUrl.includes('unsplash.com')) {
    return {
      webp: baseUrl,
      fallback: baseUrl,
      srcSet: `${baseUrl} 1x, ${baseUrl} 2x`
    };
  }
  
  // For local/backend URLs, add compression parameters if supported by backend
  const finalQuality = quality !== undefined ? quality : (sizePresets[size]?.quality || 80);
  const params = [];
  if (finalQuality) params.push(`q=${finalQuality}`);
  if (width) params.push(`w=${width}`);
  if (height) params.push(`h=${height}`);
  
  const queryString = params.length ? `?${params.join('&')}` : '';
  const webpUrl = baseUrl.includes('?') 
    ? `${baseUrl}&fmt=webp&q=${finalQuality}`
    : `${baseUrl}?fmt=webp&q=${finalQuality}`;
  
  return {
    webp: webpUrl,
    fallback: baseUrl + queryString,
    srcSet: `${baseUrl} 1x, ${baseUrl}?dpr=2 2x`
  };
};

/**
 * Helper function to get size-appropriate quality based on context
 * Products grid uses smaller, lower quality images
 * Product detail page uses full resolution
 * @param {string} context - 'grid' | 'card' | 'detail' | 'thumbnail'
 * @returns {string} Size preset name
 */
export const getSizeForContext = (context = 'card') => {
  const contextMap = {
    thumbnail: 'thumbnail',  // Admin tables, small previews (80x80, q:70)
    grid: 'small',            // Product grid display (200x200, q:75)
    card: 'small',            // Category cards (200x200, q:75)
    detail: 'full',           // Product detail page (1200x800, q:90)
    cart: 'small',            // Cart items (200x200, q:75)
    home: 'medium'            // Home page featured (400x400, q:80)
  };
  return contextMap[context] || 'medium';
};
export const supportsWebP = () => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return canvas.toDataURL('image/webp').includes('webp');
};

/**
 * Get responsive image srcset with multiple sizes
 * Useful for responsive images on different screen sizes
 * 
 * @param {string} imageUrl - Original image URL
 * @param {array} sizes - Array of widths e.g. [400, 600, 800]
 * @returns {string} srcset string
 */
export const getResponsiveImageSrcSet = (imageUrl, sizes = [400, 600, 800, 1024]) => {
  const baseUrl = getImageUrl(imageUrl);
  
  // For Unsplash URLs, use their srcset parameter
  if (baseUrl.includes('unsplash.com')) {
    return sizes.map(size => `${baseUrl.includes('?') ? baseUrl + '&w=' : baseUrl + '?w='}${size} ${size}w`).join(', ');
  }
  
  // For local URLs, generate srcset with size parameters
  return sizes.map(size => {
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}w=${size} ${size}w`;
  }).join(', ');
};

/**
 * Preload image to ensure it's cached
 * @param {string} imageUrl - Image URL to preload
 */
export const preloadImage = (imageUrl) => {
  if (typeof window === 'undefined') return;
  
  const img = new Image();
  img.src = getImageUrl(imageUrl);
};

/**
 * Batch preload multiple images
 * @param {array} imageUrls - Array of image URLs
 */
export const preloadImages = (imageUrls) => {
  imageUrls.forEach(url => preloadImage(url));
};
