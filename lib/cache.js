/**
 * Simple in-memory cache for Vercel serverless environment
 * Uses global object to persist cache across function invocations (same container)
 */

const globalForCache = globalThis;

// Initialize cache if not exists
if (!globalForCache.cache) {
  globalForCache.cache = new Map();
}

const cache = globalForCache.cache;

/**
 * Get cached data if exists and not expired
 * @param {string} key - Cache key
 * @returns {any|null} - Cached data or null if not found/expired
 */
export function getCache(key) {
  const entry = cache.get(key);
  
  if (!entry) {
    return null;
  }
  
  // Check if expired
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
}

/**
 * Set data in cache with TTL
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttlSeconds - Time to live in seconds
 */
export function setCache(key, data, ttlSeconds) {
  const expiry = Date.now() + (ttlSeconds * 1000);
  cache.set(key, { data, expiry });
}

/**
 * Clear specific cache entry
 * @param {string} key - Cache key to clear
 */
export function clearCache(key) {
  cache.delete(key);
}

/**
 * Clear all cache entries
 */
export function clearAllCache() {
  cache.clear();
}

/**
 * Get cache stats (for debugging)
 * @returns {object} - Cache statistics
 */
export function getCacheStats() {
  const now = Date.now();
  let validCount = 0;
  let expiredCount = 0;
  
  for (const [key, entry] of cache.entries()) {
    if (now > entry.expiry) {
      expiredCount++;
    } else {
      validCount++;
    }
  }
  
  return {
    totalEntries: cache.size,
    validEntries: validCount,
    expiredEntries: expiredCount,
  };
}

/**
 * Clean up expired entries (call periodically)
 */
export function cleanupExpiredCache() {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [key, entry] of cache.entries()) {
    if (now > entry.expiry) {
      cache.delete(key);
      cleaned++;
    }
  }
  
  return cleaned;
}
