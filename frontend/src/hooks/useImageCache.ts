import { cacheImage } from '@/lib/imageCache';

/**
 * Hook to interact with image cache
 * Usage: const { isCached, getStatus, clearCache, stats } = useImageCache();
 */
export const useImageCache = () => {
  /**
   * Check if an image is cached
   */
  const isCached = (url: string): boolean => {
    return cacheImage.isCached(url);
  };

  /**
   * Get the cache status of an image
   */
  const getStatus = (url: string) => {
    return cacheImage.getStatus(url);
  };

  /**
   * Clear all cached images
   */
  const clearCache = () => {
    cacheImage.clear();
    console.log('🗑️ [ImageCache] Cache cleared by user');
  };

  /**
   * Get cache statistics
   */
  const getStats = () => {
    return cacheImage.getStats();
  };

  /**
   * Log cache statistics to console
   */
  const logStats = () => {
    cacheImage.logStats();
  };

  return {
    isCached,
    getStatus,
    clearCache,
    getStats,
    logStats,
  };
};
