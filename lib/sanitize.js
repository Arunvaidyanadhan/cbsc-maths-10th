/**
 * Lightweight input sanitization utilities
 * Prevents basic injection and malformed input
 */

/**
 * Sanitize string input
 * @param {any} input - Input to sanitize
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} - Sanitized string
 */
export function sanitizeString(input, maxLength = 500) {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .slice(0, maxLength);
}

/**
 * Sanitize email input
 * @param {any} input - Email to sanitize
 * @returns {string} - Sanitized email
 */
export function sanitizeEmail(input) {
  const email = sanitizeString(input, 254); // RFC 5321 max length
  return email.toLowerCase();
}

/**
 * Sanitize array input
 * @param {any} input - Input to sanitize
 * @param {number} maxLength - Max length per item
 * @returns {Array} - Sanitized array
 */
export function sanitizeArray(input, maxLength = 500) {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .filter(item => item !== null && item !== undefined);
}

/**
 * Sanitize array of objects (for answers, etc.)
 * @param {any} input - Input to sanitize
 * @returns {Array} - Sanitized array of objects
 */
export function sanitizeObjectArray(input) {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .filter(item => item !== null && item !== undefined && typeof item === 'object')
    .map(item => ({
      selectedIndex: typeof item.selectedIndex === 'number' ? item.selectedIndex : null,
      correctIndex: typeof item.correctIndex === 'number' ? item.correctIndex : null,
      isCorrect: typeof item.isCorrect === 'boolean' ? item.isCorrect : false,
      timeTakenSecs: typeof item.timeTakenSecs === 'number' ? item.timeTakenSecs : 0,
      subtopicTag: typeof item.subtopicTag === 'string' ? sanitizeString(item.subtopicTag, 100) : null,
    }));
}

/**
 * Sanitize number input
 * @param {any} input - Input to sanitize
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number|null} - Sanitized number or null
 */
export function sanitizeNumber(input, min = 0, max = 999999) {
  const num = parseInt(input, 10);
  
  if (isNaN(num)) {
    return null;
  }
  
  return Math.max(min, Math.min(max, num));
}

/**
 * Sanitize boolean input
 * @param {any} input - Input to sanitize
 * @returns {boolean} - Sanitized boolean
 */
export function sanitizeBoolean(input) {
  if (typeof input === 'boolean') {
    return input;
  }
  
  if (typeof input === 'string') {
    return input.toLowerCase() === 'true';
  }
  
  return Boolean(input);
}

/**
 * Sanitize object keys and values
 * @param {any} input - Object to sanitize
 * @param {number} maxKeys - Maximum number of keys
 * @returns {Object} - Sanitized object
 */
export function sanitizeObject(input, maxKeys = 50) {
  if (typeof input !== 'object' || input === null) {
    return {};
  }

  const sanitized = {};
  const keys = Object.keys(input).slice(0, maxKeys);
  
  for (const key of keys) {
    const sanitizedKey = sanitizeString(key, 100);
    const value = input[key];
    
    if (typeof value === 'string') {
      sanitized[sanitizedKey] = sanitizeString(value);
    } else if (typeof value === 'number') {
      sanitized[sanitizedKey] = sanitizeNumber(value);
    } else if (typeof value === 'boolean') {
      sanitized[sanitizedKey] = sanitizeBoolean(value);
    } else if (Array.isArray(value)) {
      sanitized[sanitizedKey] = sanitizeArray(value);
    }
  }
  
  return sanitized;
}

/**
 * Sanitize ID input (for database IDs)
 * @param {any} input - ID to sanitize
 * @returns {string|null} - Sanitized ID or null
 */
export function sanitizeId(input) {
  if (typeof input !== 'string') {
    return null;
  }
  
  // Allow only alphanumeric, hyphens, and underscores
  const sanitized = input.trim().replace(/[^a-zA-Z0-9_-]/g, '');
  
  return sanitized.length > 0 ? sanitized : null;
}

/**
 * Sanitize level input (pass/average/expert)
 * @param {any} input - Level to sanitize
 * @returns {string} - Sanitized level
 */
export function sanitizeLevel(input) {
  const level = sanitizeString(input, 10).toLowerCase();
  const validLevels = ['pass', 'average', 'expert'];
  
  return validLevels.includes(level) ? level : 'pass';
}
