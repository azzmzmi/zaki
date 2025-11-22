/**
 * Image Cache Manager
 * Prevents duplicate image requests by caching image URLs and their load status
 * Uses in-memory cache with optional localStorage persistence
 */

interface CacheEntry {
  url: string;
  loadedAt: number;
  status: 'pending' | 'loaded' | 'error';
  errorCount: number;
  lastError?: string;
}

class ImageCacheManager {
  private cache: Map<string, CacheEntry> = new Map();
  private loadingPromises: Map<string, Promise<void>> = new Map();
  private readonly MAX_ERROR_RETRIES = 3;
  private readonly CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
  private readonly USE_LOCALSTORAGE = true;
  private readonly STORAGE_KEY = 'image_cache';

  constructor() {
    this.initializeFromLocalStorage();
  }

  /**
   * Initialize cache from localStorage if available
   */
  private initializeFromLocalStorage(): void {
    if (!this.USE_LOCALSTORAGE || typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        Object.entries(parsed).forEach(([url, entry]: [string, any]) => {
          // Only restore non-expired entries
          if (Date.now() - entry.loadedAt < this.CACHE_EXPIRY_MS) {
            this.cache.set(url, entry);
          }
        });
        console.log(`💾 [ImageCache] Restored ${this.cache.size} cached images from localStorage`);
      }
    } catch (error) {
      console.warn('📸 [ImageCache] Failed to restore from localStorage:', error);
    }
  }

  /**
   * Save cache to localStorage
   */
  private saveToLocalStorage(): void {
    if (!this.USE_LOCALSTORAGE || typeof window === 'undefined') return;

    try {
      const cacheObject = Object.fromEntries(this.cache);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cacheObject));
    } catch (error) {
      console.warn('📸 [ImageCache] Failed to save to localStorage:', error);
    }
  }

  /**
   * Check if image is in cache and still valid
   */
  isInCache(url: string): boolean {
    if (!url) return false;

    const entry = this.cache.get(url);
    if (!entry) {
      return false;
    }

    // Check if cache expired
    if (Date.now() - entry.loadedAt > this.CACHE_EXPIRY_MS) {
      this.cache.delete(url);
      return false;
    }

    return true;
  }

  /**
   * Get cached image status
   */
  getCacheStatus(url: string): 'pending' | 'loaded' | 'error' | 'not-cached' {
    if (!url) return 'not-cached';

    const entry = this.cache.get(url);
    if (!entry) {
      return 'not-cached';
    }

    // Check if cache expired
    if (Date.now() - entry.loadedAt > this.CACHE_EXPIRY_MS) {
      this.cache.delete(url);
      return 'not-cached';
    }

    return entry.status;
  }

  /**
   * Mark image as loading
   */
  async markAsLoading(url: string): Promise<void> {
    if (!url) return;

    // Return existing promise if already loading
    if (this.loadingPromises.has(url)) {
      console.log(`⏳ [ImageCache] Waiting for existing load promise for: ${url}`);
      return this.loadingPromises.get(url);
    }

    // Create new promise for this load
    const promise = new Promise<void>((resolve) => {
      setTimeout(resolve, 100); // Small delay to batch concurrent requests
    });

    this.loadingPromises.set(url, promise);

    promise.then(() => {
      this.loadingPromises.delete(url);
    });

    return promise;
  }

  /**
   * Mark image as successfully loaded
   */
  markAsLoaded(url: string): void {
    if (!url) return;

    const entry: CacheEntry = {
      url,
      loadedAt: Date.now(),
      status: 'loaded',
      errorCount: 0,
    };

    this.cache.set(url, entry);
    this.saveToLocalStorage();
    console.log(`✅ [ImageCache] Cached: ${url}`);
  }

  /**
   * Mark image as failed to load
   */
  markAsError(url: string, error?: string): boolean {
    if (!url) return false;

    const existing = this.cache.get(url) || {
      url,
      loadedAt: Date.now(),
      status: 'error' as const,
      errorCount: 0,
    };

    existing.errorCount++;
    existing.status = 'error';
    existing.lastError = error;
    existing.loadedAt = Date.now();

    this.cache.set(url, existing);
    this.saveToLocalStorage();

    const canRetry = existing.errorCount < this.MAX_ERROR_RETRIES;
    console.log(
      `❌ [ImageCache] Error loading ${url} (attempt ${existing.errorCount}/${this.MAX_ERROR_RETRIES})`,
      error || ''
    );

    return canRetry;
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    this.loadingPromises.clear();

    if (this.USE_LOCALSTORAGE && typeof window !== 'undefined') {
      try {
        localStorage.removeItem(this.STORAGE_KEY);
        console.log('🗑️ [ImageCache] Cache cleared');
      } catch (error) {
        console.warn('📸 [ImageCache] Failed to clear localStorage:', error);
      }
    }
  }

  /**
   * Get cache stats for debugging
   */
  getStats(): {
    totalCached: number;
    loading: number;
    successful: number;
    failed: number;
    expired: number;
  } {
    let successful = 0;
    let failed = 0;
    let expired = 0;

    this.cache.forEach((entry) => {
      if (Date.now() - entry.loadedAt > this.CACHE_EXPIRY_MS) {
        expired++;
      } else if (entry.status === 'loaded') {
        successful++;
      } else if (entry.status === 'error') {
        failed++;
      }
    });

    return {
      totalCached: this.cache.size,
      loading: this.loadingPromises.size,
      successful,
      failed,
      expired,
    };
  }

  /**
   * Log cache stats
   */
  logStats(): void {
    const stats = this.getStats();
    console.log('📊 [ImageCache] Stats:', stats);
  }
}

// Create singleton instance
export const imageCache = new ImageCacheManager();

// Export cache functions
export const cacheImage = {
  /**
   * Check if image URL is cached
   */
  isCached: (url: string) => imageCache.isInCache(url),

  /**
   * Get image cache status
   */
  getStatus: (url: string) => imageCache.getCacheStatus(url),

  /**
   * Mark image as loading
   */
  markLoading: (url: string) => imageCache.markAsLoading(url),

  /**
   * Mark image as successfully loaded
   */
  markLoaded: (url: string) => imageCache.markAsLoaded(url),

  /**
   * Mark image as failed
   */
  markError: (url: string, error?: string) => imageCache.markAsError(url, error),

  /**
   * Clear all cached images
   */
  clear: () => imageCache.clear(),

  /**
   * Get cache statistics
   */
  getStats: () => imageCache.getStats(),

  /**
   * Log cache statistics to console
   */
  logStats: () => imageCache.logStats(),
};
