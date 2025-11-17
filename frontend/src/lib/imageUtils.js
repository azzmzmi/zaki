/**
 * Get the full image URL for a product
 * Handles both external URLs (Unsplash), local backend uploads, and Render production uploads
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
  
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
  const isLocalhost = backendUrl.includes('localhost') || backendUrl.includes('127.0.0.1');
  
  // If it's the /api/uploads path
  if (imageUrl.startsWith('/api/uploads/')) {
    if (isLocalhost) {
      // Local development: use Render's URL for uploaded images
      const filename = imageUrl.split('/').pop();
      return `https://sandvally.onrender.com/api/uploads/${filename}`;
    }
    // Production: use the backend URL directly
    return `${backendUrl}${imageUrl}`;
  }
  
  // If it's a relative path (starts with /), prepend backend URL
  if (imageUrl.startsWith('/')) {
    return `${backendUrl}${imageUrl}`;
  }
  
  // Otherwise, assume it's a relative path without leading slash
  return `${backendUrl}/${imageUrl}`;
};
