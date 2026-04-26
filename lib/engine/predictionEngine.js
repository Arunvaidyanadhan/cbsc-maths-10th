/**
 * Prediction Engine
 * Predicts score range based on last 5 attempts
 * Returns prediction with confidence level and disclaimer
 */

/**
 * Calculate prediction range based on recent attempts
 * Uses last 5 attempts only for recency bias
 * 
 * @param {Array} recentAttempts - Last 5 attempts with mastery field
 * @param {number} currentTotal - Total questions in current attempt (for confidence calculation)
 * @returns {Object} Prediction with min, max, confidence, and disclaimer
 */
export function predictScoreRange(recentAttempts, currentTotal = 10) {
  // Default prediction when no history available
  const defaultPrediction = {
    min: 40,
    max: 70,
    confidence: 'low',
    confidenceScore: 0.3,
    disclaimer: 'Limited practice history. Prediction based on typical learner performance.'
  };

  // Filter valid attempts with mastery data
  const validAttempts = (recentAttempts || []).filter(a => 
    a && typeof a.mastery === 'number' && a.mastery >= 0 && a.mastery <= 100
  );

  if (validAttempts.length === 0) {
    return defaultPrediction;
  }

  // Extract mastery scores
  const masteryScores = validAttempts.map(a => a.mastery);
  const count = masteryScores.length;

  // Calculate statistics
  const mean = masteryScores.reduce((sum, s) => sum + s, 0) / count;
  const sorted = [...masteryScores].sort((a, b) => a - b);
  const median = count % 2 === 0
    ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2
    : sorted[Math.floor(count / 2)];

  // Calculate standard deviation
  const variance = masteryScores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / count;
  const stdDev = Math.sqrt(variance);

  // Calculate trend (last 2 vs first 2-3)
  let trend = 'stable';
  if (count >= 3) {
    const recent = masteryScores.slice(-2).reduce((s, v) => s + v, 0) / 2;
    const older = masteryScores.slice(0, Math.min(3, count - 2)).reduce((s, v) => s + v, 0) / Math.min(3, count - 2);
    const trendDiff = recent - older;
    
    if (trendDiff > 10) trend = 'improving';
    else if (trendDiff < -10) trend = 'declining';
  }

  // Calculate confidence based on data quality
  // Factors: sample size, consistency (low stdDev), question count
  const sampleSizeFactor = Math.min(count / 5, 1); // Max at 5 attempts
  const consistencyFactor = Math.max(0, 1 - (stdDev / 50)); // Lower stdDev = higher confidence
  const questionCountFactor = Math.min(currentTotal / 10, 1); // More questions = better prediction
  
  const confidenceScore = Math.round(
    (sampleSizeFactor * 0.4 + consistencyFactor * 0.4 + questionCountFactor * 0.2) * 100
  ) / 100;

  // Determine confidence level
  let confidence;
  if (confidenceScore >= 0.7) confidence = 'high';
  else if (confidenceScore >= 0.5) confidence = 'medium';
  else confidence = 'low';

  // Adjust for low question count
  if (currentTotal < 5) {
    confidence = 'low';
  }

  // Calculate prediction range
  // Base range on mean with variance
  const rangeWidth = Math.max(stdDev * 1.5, 15); // Minimum 15-point range
  
  let minScore = Math.max(0, Math.round(mean - rangeWidth));
  let maxScore = Math.min(100, Math.round(mean + rangeWidth));

  // Adjust range based on trend
  if (trend === 'improving') {
    minScore = Math.min(maxScore - 10, Math.round(minScore + 5));
    maxScore = Math.min(100, Math.round(maxScore + 5));
  } else if (trend === 'declining') {
    minScore = Math.max(0, Math.round(minScore - 5));
    maxScore = Math.max(minScore + 10, Math.round(maxScore - 5));
  }

  // Build disclaimer based on conditions
  const disclaimers = [];
  
  if (count < 3) {
    disclaimers.push('Limited practice history.');
  } else if (count < 5) {
    disclaimers.push('Building confidence with more practice.');
  }
  
  if (currentTotal < 5) {
    disclaimers.push('Small question set reduces prediction accuracy.');
  }
  
  if (stdDev > 25) {
    disclaimers.push('Performance variance detected.');
  }
  
  if (trend === 'improving') {
    disclaimers.push('Recent upward trend suggests potential for higher scores.');
  } else if (trend === 'declining') {
    disclaimers.push('Recent challenges detected - review recommended.');
  }

  const disclaimer = disclaimers.length > 0 
    ? disclaimers.join(' ') + ' Prediction is an estimate only.'
    : 'Prediction based on recent performance patterns.';

  return {
    min: minScore,
    max: maxScore,
    confidence,
    confidenceScore,
    trend,
    basedOn: count,
    disclaimer
  };
}

/**
 * Quick prediction helper for minimal data scenarios
 * @param {number} currentMastery - Current attempt mastery percentage
 * @param {number} currentTotal - Total questions
 * @returns {Object} Simple prediction
 */
export function quickPredict(currentMastery, currentTotal = 10) {
  if (currentTotal < 3) {
    return {
      min: Math.max(0, currentMastery - 30),
      max: Math.min(100, currentMastery + 30),
      confidence: 'low',
      confidenceScore: 0.2,
      disclaimer: 'Insufficient questions for reliable prediction.'
    };
  }

  const range = currentTotal < 5 ? 25 : 15;
  
  return {
    min: Math.max(0, currentMastery - range),
    max: Math.min(100, currentMastery + range),
    confidence: currentTotal >= 10 ? 'medium' : 'low',
    confidenceScore: currentTotal >= 10 ? 0.5 : 0.3,
    disclaimer: currentTotal < 5 
      ? 'Small question set - range is wider.'
      : 'Prediction based on current attempt only.'
  };
}
