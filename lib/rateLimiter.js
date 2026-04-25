/**
 * Lightweight in-memory rate limiter
 * Uses sliding window approach with Map for O(1) operations
 */

const rateLimitMap = new Map();

/**
 * Check if IP is rate limited
 * @param {string} ip - Client IP address
 * @param {number} limit - Max requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} - True if request is allowed, false if rate limited
 */
export function rateLimit(ip, limit = 30, windowMs = 60000) {
  const now = Date.now();

  // Initialize IP entry if not exists
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }

  // Get existing timestamps for this IP
  const timestamps = rateLimitMap.get(ip);
  
  // Filter out timestamps outside the window
  const validTimestamps = timestamps.filter(ts => now - ts < windowMs);
  
  // Check if limit exceeded
  if (validTimestamps.length >= limit) {
    return false;
  }

  // Add current timestamp
  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);

  return true;
}

/**
 * Get remaining requests for an IP
 * @param {string} ip - Client IP address
 * @param {number} limit - Max requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {number} - Remaining requests
 */
export function getRemainingRequests(ip, limit = 30, windowMs = 60000) {
  const now = Date.now();
  
  if (!rateLimitMap.has(ip)) {
    return limit;
  }

  const timestamps = rateLimitMap.get(ip);
  const validTimestamps = timestamps.filter(ts => now - ts < windowMs);
  
  return Math.max(0, limit - validTimestamps.length);
}

/**
 * Get reset time for an IP
 * @param {string} ip - Client IP address
 * @param {number} windowMs - Time window in milliseconds
 * @returns {number} - Timestamp when limit resets
 */
export function getResetTime(ip, windowMs = 60000) {
  if (!rateLimitMap.has(ip)) {
    return Date.now();
  }

  const timestamps = rateLimitMap.get(ip);
  if (timestamps.length === 0) {
    return Date.now();
  }

  // Return oldest timestamp + window duration
  return Math.min(...timestamps) + windowMs;
}

/**
 * Cleanup old entries to prevent memory leaks
 * Call this periodically (e.g., every 5 minutes)
 */
export function cleanupRateLimiter() {
  const now = Date.now();
  const maxWindow = 300000; // 5 minutes max window

  for (const [ip, timestamps] of rateLimitMap.entries()) {
    const validTimestamps = timestamps.filter(ts => now - ts < maxWindow);
    
    if (validTimestamps.length === 0) {
      rateLimitMap.delete(ip);
    } else {
      rateLimitMap.set(ip, validTimestamps);
    }
  }
}

// Auto-cleanup every 5 minutes
setInterval(cleanupRateLimiter, 300000);
