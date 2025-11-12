/**
 * Get the full image URL for a product
 * Handles both external URLs (Unsplash) and uploaded images
 */
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) {
    // Default fallback image
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&h=400&q=80';
  }
  
  // If it's an external URL (starts with http:// or https://), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it's a relative path (starts with /), prepend backend URL
  if (imageUrl.startsWith('/')) {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
    return `${backendUrl}${imageUrl}`;
  }
  
  // Otherwise, assume it's a relative path without leading slash
  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
  return `${backendUrl}/${imageUrl}`;
};
