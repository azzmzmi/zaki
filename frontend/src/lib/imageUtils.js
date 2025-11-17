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
  const renderUploadsUrl = 'https://sandvally.onrender.com/api/uploads';
  
  // If it's the /api/uploads path, use Render for localhost development
  if (imageUrl.startsWith('/api/uploads/')) {
    if (isLocalhost) {
      // Local development: extract filename and use Render's URL
      const filename = imageUrl.split('/').pop();
      return `${renderUploadsUrl}/${filename}`;
    }
    // Production: use local backend
    return `${backendUrl}${imageUrl}`;
  }
  
  // If it's a relative path (starts with /), prepend backend URL
  if (imageUrl.startsWith('/')) {
    return `${backendUrl}${imageUrl}`;
  }
  
  // Otherwise, assume it's a relative path without leading slash
  return `${backendUrl}/${imageUrl}`;
};
