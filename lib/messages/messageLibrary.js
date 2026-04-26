/**
 * Message Library
 * Structured performance messages with priority-based categories
 * Pure rule-based system (NO AI/ML)
 */

/**
 * Performance-based messages with metadata
 * Each message has text, type, and tone for better organization
 */
export const PERFORMANCE_MESSAGES = {
  TOP_PERFORMER: [
    { text: "Outstanding! You're in the top tier of performers.", type: "performance", tone: "celebratory" },
    { text: "Excellent work! Your consistency is paying off.", type: "performance", tone: "celebratory" },
    { text: "You're mastering this material beautifully.", type: "performance", tone: "encouraging" }
  ],
  STRONG: [
    { text: "You're performing consistently well.", type: "performance", tone: "motivational" },
    { text: "Great job maintaining strong accuracy.", type: "performance", tone: "motivational" },
    { text: "You're on track for a high score.", type: "performance", tone: "motivational" },
    { text: "Your performance is impressive—keep it up.", type: "performance", tone: "encouraging" },
    { text: "You're consistently hitting strong results.", type: "performance", tone: "motivational" }
  ],
  AVERAGE: [
    { text: "You're making steady progress.", type: "performance", tone: "motivational" },
    { text: "You're close to the next level.", type: "performance", tone: "motivational" },
    { text: "A bit more focus can boost your score.", type: "performance", tone: "actionable" },
    { text: "You're improving—keep pushing forward.", type: "performance", tone: "encouraging" },
    { text: "Good progress, consistency will take you higher.", type: "performance", tone: "motivational" }
  ],
  WEAK: [
    { text: "You're improving, keep going.", type: "performance", tone: "encouraging" },
    { text: "Focus on basics to build confidence.", type: "performance", tone: "actionable" },
    { text: "Consistent practice will help you improve.", type: "performance", tone: "motivational" },
    { text: "Take it step by step—you'll get better.", type: "performance", tone: "encouraging" },
    { text: "Start with fundamentals to strengthen your base.", type: "performance", tone: "actionable" }
  ]
};

/**
 * Special category messages (priority-based)
 * These override performance messages when conditions are met
 */
export const SPECIAL_MESSAGES = {
  CONSISTENCY: [
    { text: "Consistency is key—keep practicing daily.", type: "consistency", tone: "actionable" },
    { text: "Try maintaining steady practice for better results.", type: "consistency", tone: "actionable" },
    { text: "Regular practice will stabilize your performance.", type: "consistency", tone: "motivational" }
  ],
  IMPROVEMENT: [
    { text: "You're improving faster than before.", type: "improvement", tone: "celebratory" },
    { text: "Your recent performance shows good progress.", type: "improvement", tone: "encouraging" },
    { text: "You're moving in the right direction.", type: "improvement", tone: "motivational" },
    { text: "Nice improvement—keep building momentum.", type: "improvement", tone: "celebratory" }
  ]
};

/**
 * Get performance level from score
 * Segmented for better granularity
 * @param {number} score - Score percentage (0-100)
 * @returns {string} Performance level (TOP_PERFORMER, STRONG, AVERAGE, WEAK)
 */
export function getPerformanceLevel(score) {
  if (typeof score !== 'number' || isNaN(score)) {
    return 'WEAK';
  }

  if (score >= 90) return 'TOP_PERFORMER';
  if (score >= 75) return 'STRONG';
  if (score >= 60) return 'AVERAGE';
  return 'WEAK';
}

/**
 * Select message category based on strict priority logic
 * ONLY ONE category is selected (no mixing)
 * Priority: CONSISTENCY > IMPROVEMENT > PERFORMANCE
 *
 * @param {string} confidence - Confidence level (High/Medium/Low)
 * @param {number} trend - Performance trend
 * @param {string} performanceLevel - Performance level from getPerformanceLevel
 * @returns {Object} Selected category with priority info
 */
export function selectCategory({ confidence, trend, performanceLevel }) {
  // Priority 1: Low confidence → CONSISTENCY
  if (confidence?.toLowerCase() === 'low') {
    return {
      category: 'CONSISTENCY',
      messages: SPECIAL_MESSAGES.CONSISTENCY,
      priority: 1
    };
  }

  // Priority 2: Strong improvement trend → IMPROVEMENT
  if (typeof trend === 'number' && trend > 10) {
    return {
      category: 'IMPROVEMENT',
      messages: SPECIAL_MESSAGES.IMPROVEMENT,
      priority: 2
    };
  }

  // Priority 3: Default → PERFORMANCE
  const performanceMessages = PERFORMANCE_MESSAGES[performanceLevel] || PERFORMANCE_MESSAGES.WEAK;

  return {
    category: 'PERFORMANCE',
    subCategory: performanceLevel,
    messages: performanceMessages,
    priority: 3
  };
}
