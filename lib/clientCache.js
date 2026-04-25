/**
 * Simple client-side cache for reducing API calls
 * Uses in-memory storage during user session
 */

const cache = {};

/**
 * Get cached data
 * @param {string} key - Cache key
 * @returns {any|null} - Cached data or null
 */
export const getClientCache = (key) => {
  return cache[key] || null;
};

/**
 * Set data in cache
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 */
export const setClientCache = (key, data) => {
  cache[key] = data;
};

/**
 * Check if data exists in cache
 * @param {string} key - Cache key
 * @returns {boolean} - Whether data exists
 */
export const hasClientCache = (key) => {
  return key in cache;
};

/**
 * Clear specific cache entry
 * @param {string} key - Cache key to clear
 */
export const clearClientCache = (key) => {
  delete cache[key];
};

/**
 * Clear all cache entries
 */
export const clearAllClientCache = () => {
  Object.keys(cache).forEach(key => delete cache[key]);
};

/**
 * Get cache size (for debugging)
 * @returns {number} - Number of cached entries
 */
export const getClientCacheSize = () => {
  return Object.keys(cache).length;
};

/**
 * Clean up old entries (optional - for future use)
 * Currently cache persists for session duration only
 */
export const cleanupClientCache = () => {
  // Session-based cache - no cleanup needed
  // Could add timestamp logic in future if needed
};
