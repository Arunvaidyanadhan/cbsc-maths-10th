/**
 * Report Formatter Layer
 * Converts raw engine outputs into human-readable, emotionally safe, actionable reports
 * Pure function - no async, no DB queries, executes in < 5ms
 */

/**
 * Format subtopic tag into readable title
 * @param {string} tag - Raw subtopic tag (e.g., 'irrational-properties')
 * @returns {string} Readable title
 */
function formatTitle(tag) {
  if (!tag) return 'General Topic';

  return tag
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format score range for display
 * @param {Object} prediction - Raw prediction object
 * @returns {string} Formatted range like "65% – 75%"
 */
function formatScoreRange(prediction) {
  if (!prediction || typeof prediction.min !== 'number' || typeof prediction.max !== 'number') {
    return '40% – 70%';
  }

  const min = Math.round(prediction.min);
  const max = Math.round(prediction.max);

  return `${min}% – ${max}%`;
}

/**
 * Get confidence level display
 * @param {string} confidence - Raw confidence level
 * @returns {string} Formatted confidence
 */
function formatConfidence(confidence) {
  const validLevels = ['High', 'Medium', 'Low'];
  const normalized = confidence?.charAt(0).toUpperCase() + confidence?.slice(1).toLowerCase();

  return validLevels.includes(normalized) ? normalized : 'Low';
}

/**
 * Get confidence message with human-like tone
 * @param {string} confidence - Confidence level
 * @returns {string} Human-readable message
 */
function getConfidenceMessage(confidence) {
  const normalized = confidence?.toLowerCase();

  switch (normalized) {
    case 'high':
      return "You're performing consistently well.";
    case 'medium':
      return "You're making steady progress.";
    case 'low':
    default:
      return 'Your performance varies. Building consistency will help.';
  }
}

/**
 * Get personalized prediction message using confidence and trend
 * @param {Object} prediction - Raw prediction object
 * @returns {string} Personalized, encouraging message
 */
function getPredictionMessage(prediction) {
  if (!prediction || typeof prediction.min !== 'number' || typeof prediction.max !== 'number') {
    return 'With consistent practice, you can build a stronger foundation and improve your scores.';
  }

  const scoreRange = formatScoreRange(prediction);
  const confidence = (prediction.confidence || '').toLowerCase();
  const trend = prediction.trend || 0;

  let message;

  // Base message based on confidence
  if (confidence === 'high') {
    message = `Your performance is consistent. You are on track for ${scoreRange}.`;
  } else if (confidence === 'medium') {
    message = `Your performance is improving. You are currently on track for ${scoreRange}.`;
  } else {
    message = `Your performance is fluctuating. With consistent practice, you can improve beyond ${scoreRange}.`;
  }

  // Add trend-based enhancement
  if (trend > 10) {
    message += " You're showing strong improvement.";
  } else if (trend < -10) {
    message += ' Focus on consistency to stabilize your performance.';
  }

  return message;
}

/**
 * Determine contextual reason based on weak area data
 * @param {Object} area - Raw weak area data
 * @returns {string} Contextual reason
 */
function getWeakAreaReason(area) {
  const accuracy = area.accuracy;
  const recentMistakes = area.recentMistakes || 0;
  const timeFactor = area.timeFactor;

  // Determine dominant factor
  const hasHighRecentMistakes = recentMistakes >= 3;
  const hasLowAccuracy = typeof accuracy === 'number' && accuracy < 0.5;
  const hasHighTimeFactor = typeof timeFactor === 'number' && timeFactor > 30;

  // Return reason for most dominant factor
  if (hasHighRecentMistakes) {
    return 'You made multiple mistakes in recent questions';
  }

  if (hasLowAccuracy) {
    return 'Your accuracy in this topic is below average';
  }

  if (hasHighTimeFactor) {
    return 'You are taking more time than expected to solve these questions';
  }

  // Fallback based on severity
  const severity = area.severity?.toLowerCase();
  if (severity === 'critical' || severity === 'high') {
    return 'This topic needs focused attention';
  } else if (severity === 'medium') {
    return 'Additional practice will strengthen this area';
  }

  return 'Minor refinement will improve performance';
}

/**
 * Format weak areas for display with contextual reasons
 * @param {Array} weakAreas - Raw weak areas array
 * @returns {Array} Formatted weak areas
 */
function formatWeakAreas(weakAreas) {
  if (!weakAreas || !Array.isArray(weakAreas) || weakAreas.length === 0) {
    return [];
  }

  return weakAreas.map(area => {
    const severity = area.severity?.toLowerCase();
    let displaySeverity;

    // Severity mapping
    if (severity === 'critical' || severity === 'high') {
      displaySeverity = 'High';
    } else if (severity === 'medium') {
      displaySeverity = 'Medium';
    } else {
      displaySeverity = 'Low';
    }

    return {
      title: formatTitle(area.subtopicTag),
      severity: displaySeverity,
      reason: getWeakAreaReason(area)
    };
  });
}

/**
 * Clean up and limit recommendations
 * @param {Array} recommendations - Raw recommendations array
 * @returns {Array} Clean recommendations (max 3)
 */
function formatRecommendations(recommendations) {
  if (!recommendations || !Array.isArray(recommendations) || recommendations.length === 0) {
    return [];
  }

  // Extract text from recommendation objects or use strings directly
  const texts = recommendations.map(r => {
    if (typeof r === 'string') return r;
    if (r && typeof r.text === 'string') return r.text;
    return null;
  }).filter(Boolean);

  // Remove duplicates (case-insensitive)
  const unique = [];
  const seen = new Set();

  for (const text of texts) {
    const normalized = text.toLowerCase().trim();
    if (!seen.has(normalized)) {
      seen.add(normalized);
      unique.push(text);
    }

    if (unique.length >= 3) break;
  }

  return unique;
}

/**
 * Get status label based on prediction average
 * @param {Object} prediction - Raw prediction object
 * @returns {string} Status label
 */
function getStatusLabel(prediction) {
  if (!prediction || typeof prediction.min !== 'number' || typeof prediction.max !== 'number') {
    return 'Needs Improvement';
  }

  const avg = (prediction.min + prediction.max) / 2;

  if (avg >= 75) {
    return 'Strong Performance';
  }

  if (avg >= 60) {
    return 'On Track';
  }

  return 'Needs Improvement';
}

/**
 * Generate result-driven improvement hint
 * @param {Array} formattedWeakAreas - Formatted weak areas
 * @param {Object} prediction - Raw prediction object
 * @returns {string} Result-driven improvement hint
 */
function generateImprovementHint(formattedWeakAreas, prediction) {
  // If there's a top weak area, show result potential
  if (formattedWeakAreas && formattedWeakAreas.length > 0) {
    const topArea = formattedWeakAreas[0];
    const targetScore = prediction && typeof prediction.max === 'number'
      ? Math.round(prediction.max + 5)
      : 80;
    return `Improving ${topArea.title} can help you reach ${targetScore}%+`;
  }

  // If no weak areas but high score range
  if (prediction && prediction.max >= 80) {
    return "You're close to a top score. Fixing small mistakes can push you even higher.";
  }

  // Default hint
  return 'Consistent practice will help you reach your goals';
}

/**
 * Main formatter function
 * Converts raw engine outputs into human-readable report
 *
 * @param {Object} params - Input parameters
 * @param {Array} params.weakAreas - Raw weak areas from weakAreaEngine
 * @param {Object} params.prediction - Raw prediction from predictionEngine
 * @param {Array} params.recommendations - Raw recommendations from recommendationEngine
 * @returns {Object} Formatted report
 */
export function formatReport({ weakAreas, prediction, recommendations }) {
  // Format weak areas
  const formattedWeakAreas = formatWeakAreas(weakAreas);

  // Build the report
  const report = {
    scoreRange: formatScoreRange(prediction),
    confidence: formatConfidence(prediction?.confidence),
    statusLabel: getStatusLabel(prediction),
    confidenceMessage: getConfidenceMessage(prediction?.confidence),
    predictionMessage: getPredictionMessage(prediction),
    weakAreas: formattedWeakAreas,
    recommendations: formatRecommendations(recommendations),
    improvementHint: generateImprovementHint(formattedWeakAreas, prediction)
  };

  return report;
}

/**
 * Quick formatter for edge cases
 * Returns a safe default report when data is missing
 * @returns {Object} Default formatted report
 */
export function getDefaultReport() {
  return {
    scoreRange: '40% – 70%',
    confidence: 'Low',
    statusLabel: 'Needs Improvement',
    confidenceMessage: 'Your performance varies. Building consistency will help.',
    predictionMessage: 'With consistent practice, you can build a stronger foundation and improve your scores.',
    weakAreas: [],
    recommendations: ['Practice regularly to build consistency'],
    improvementHint: 'Consistent practice will help you reach your goals'
  };
}
