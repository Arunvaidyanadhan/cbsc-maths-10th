/**
 * Weak Area Engine
 * Calculates weakness scores using weighted sum (not multiplication)
 * Returns top 5 weak areas with severity levels
 */

/**
 * Normalize a value to 0-1 range
 * @param {number} value - The value to normalize
 * @param {number} max - The maximum expected value
 * @returns {number} Normalized value between 0 and 1
 */
function normalize(value, max) {
  if (!value || value < 0) return 0;
  return Math.min(value / max, 1);
}

/**
 * Calculate weakness score using weighted sum formula
 * weaknessScore = (1 - accuracy) * 0.4 + normalize(mistakeScore, 5) * 0.3 + normalize(recentMistakes, 3) * 0.2 + normalize(timeFactor, 60) * 0.1
 * 
 * @param {Object} params - Calculation parameters
 * @param {number} params.accuracy - Accuracy ratio (0-1)
 * @param {number} params.mistakeScore - Total mistakes for this subtopic
 * @param {number} params.recentMistakes - Mistakes in recent attempts
 * @param {number} params.timeFactor - Time since last practice (in days or minutes)
 * @returns {number} Weakness score between 0 and 1
 */
function calculateWeaknessScore({ accuracy, mistakeScore, recentMistakes, timeFactor }) {
  const accuracyWeight = (1 - accuracy) * 0.4;
  const mistakeWeight = normalize(mistakeScore, 5) * 0.3;
  const recentWeight = normalize(recentMistakes, 3) * 0.2;
  const timeWeight = normalize(timeFactor, 60) * 0.1;
  
  return accuracyWeight + mistakeWeight + recentWeight + timeWeight;
}

/**
 * Determine severity level based on weakness score
 * @param {number} score - Weakness score (0-1)
 * @returns {string} Severity level: 'critical', 'high', 'medium', 'low'
 */
function getSeverityLevel(score) {
  if (score >= 0.7) return 'critical';
  if (score >= 0.5) return 'high';
  if (score >= 0.3) return 'medium';
  return 'low';
}

/**
 * Analyze weak areas based on current attempt and historical data
 * 
 * @param {Object} params - Analysis parameters
 * @param {Array} params.currentAnswers - Answers from current attempt
 * @param {Array} params.mistakes - Historical mistake records from DB
 * @param {Array} params.recentAttempts - Last 5 attempts for context
 * @returns {Array} Top 5 weak areas with severity and scores
 */
export function analyzeWeakAreas({ currentAnswers, mistakes, recentAttempts }) {
  if (!currentAnswers || currentAnswers.length === 0) {
    return [];
  }

  // Filter valid answers with subtopic tags
  const validAnswers = currentAnswers.filter(a => 
    a && typeof a.isCorrect === 'boolean' && a.subtopicTag
  );

  if (validAnswers.length === 0) {
    return [];
  }

  // Group answers by subtopic
  const subtopicStats = {};
  
  validAnswers.forEach(answer => {
    const tag = answer.subtopicTag;
    if (!subtopicStats[tag]) {
      subtopicStats[tag] = { total: 0, wrong: 0 };
    }
    subtopicStats[tag].total += 1;
    if (!answer.isCorrect) {
      subtopicStats[tag].wrong += 1;
    }
  });

  // Build mistake lookup map for quick access
  const mistakeMap = new Map();
  if (mistakes && mistakes.length > 0) {
    mistakes.forEach(m => {
      if (m.subtopicTag) {
        mistakeMap.set(m.subtopicTag, m.wrongCount || 0);
      }
    });
  }

  // Calculate recent mistakes per subtopic from last 5 attempts
  const recentMistakeMap = new Map();
  if (recentAttempts && recentAttempts.length > 0) {
    recentAttempts.forEach(attempt => {
      if (attempt.weakSubtopics && Array.isArray(attempt.weakSubtopics)) {
        attempt.weakSubtopics.forEach(tag => {
          recentMistakeMap.set(tag, (recentMistakeMap.get(tag) || 0) + 1);
        });
      }
    });
  }

  // Calculate weakness scores for each subtopic
  const weakAreas = [];
  const now = new Date();

  Object.entries(subtopicStats).forEach(([subtopicTag, stats]) => {
    const accuracy = stats.total > 0 ? (stats.total - stats.wrong) / stats.total : 0;
    const mistakeScore = mistakeMap.get(subtopicTag) || 0;
    const recentMistakes = recentMistakeMap.get(subtopicTag) || 0;
    
    // Calculate time factor (days since this subtopic was last practiced)
    // Default to 30 days if no previous data
    let timeFactor = 30;
    if (recentAttempts && recentAttempts.length > 0) {
      const lastAttemptWithTag = recentAttempts.find(a => 
        a.weakSubtopics && a.weakSubtopics.includes(subtopicTag)
      );
      if (lastAttemptWithTag && lastAttemptWithTag.completedAt) {
        const daysSince = Math.floor((now - new Date(lastAttemptWithTag.completedAt)) / (1000 * 60 * 60 * 24));
        timeFactor = Math.min(daysSince, 60);
      }
    }

    const weaknessScore = calculateWeaknessScore({
      accuracy,
      mistakeScore,
      recentMistakes,
      timeFactor
    });

    weakAreas.push({
      subtopicTag,
      weaknessScore: Math.round(weaknessScore * 100) / 100, // Round to 2 decimals
      severity: getSeverityLevel(weaknessScore),
      accuracy: Math.round(accuracy * 100),
      totalQuestions: stats.total,
      wrongCount: stats.wrong,
      historicalWrongCount: mistakeScore
    });
  });

  // Sort by weakness score descending and return top 5
  return weakAreas
    .sort((a, b) => b.weaknessScore - a.weaknessScore)
    .slice(0, 5);
}

/**
 * Get summary statistics for weak areas
 * @param {Array} weakAreas - Array of weak area objects
 * @returns {Object} Summary with count by severity
 */
export function getWeakAreaSummary(weakAreas) {
  if (!weakAreas || weakAreas.length === 0) {
    return { total: 0, critical: 0, high: 0, medium: 0, low: 0 };
  }

  return {
    total: weakAreas.length,
    critical: weakAreas.filter(w => w.severity === 'critical').length,
    high: weakAreas.filter(w => w.severity === 'high').length,
    medium: weakAreas.filter(w => w.severity === 'medium').length,
    low: weakAreas.filter(w => w.severity === 'low').length
  };
}
