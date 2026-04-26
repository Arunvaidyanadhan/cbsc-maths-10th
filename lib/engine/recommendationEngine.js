/**
 * Recommendation Engine
 * Generates personalized study recommendations
 * Based on weak areas and topic progress
 * Returns simple text recommendations (no raw scores exposed)
 */

/**
 * Recommendation templates by category
 */
const RECOMMENDATION_TEMPLATES = {
  weakArea: {
    critical: [
      'Focus on mastering {topic} fundamentals before advancing.',
      'Schedule dedicated practice for {topic} - priority area.',
      'Review {topic} basics with video tutorials or guided examples.'
    ],
    high: [
      'Continue practicing {topic} with varied question types.',
      'Spend extra time on {topic} in your next session.',
      'Try beginner-level questions for {topic} to build confidence.'
    ],
    medium: [
      'Include {topic} in your mixed practice sessions.',
      'Review {topic} periodically to maintain progress.',
      'Practice {topic} alongside stronger areas for balance.'
    ],
    low: [
      'Maintain {topic} skills with occasional practice.',
      'Use {topic} as a confidence builder during review.',
      'Keep {topic} fresh with weekly touch-ups.'
    ]
  },
  progress: {
    newTopic: [
      'Explore the next topic in your learning path.',
      'Ready to tackle new concepts - proceed to next chapter.',
      'Build on your success with adjacent topics.'
    ],
    improving: [
      'Your progress is steady - maintain this momentum.',
      'Keep your current study routine - it\'s working.',
      'Consistent effort is paying off - stay on track.'
    ],
    plateau: [
      'Try a different question difficulty to challenge yourself.',
      'Mix easy and hard questions to break through the plateau.',
      'Review past mistakes before attempting new questions.'
    ]
  },
  general: {
    consistency: [
      'Practice daily to maintain your learning streak.',
      'Short daily sessions work better than occasional long ones.',
      'Set a regular study schedule and stick to it.'
    ],
    variety: [
      'Mix different question types for well-rounded preparation.',
      'Practice both easy and challenging questions.',
      'Rotate between topics to keep learning fresh.'
    ],
    review: [
      'Regular revision strengthens long-term memory.',
      'Spend 10 minutes reviewing before new practice.',
      'Create quick notes from mistakes for faster review.'
    ]
  }
};

/**
 * Format subtopic tag for display
 * @param {string} tag - Raw subtopic tag (e.g., 'irrational-properties')
 * @returns {string} Formatted display name
 */
function formatSubtopicName(tag) {
  if (!tag) return 'this topic';
  
  return tag
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Select a random template from array
 * @param {Array} templates - Array of template strings
 * @returns {string} Selected template
 */
function selectTemplate(templates) {
  if (!templates || templates.length === 0) return '';
  const index = Math.floor(Math.random() * templates.length);
  return templates[index];
}

/**
 * Generate recommendations based on weak areas and progress
 * 
 * @param {Object} params - Recommendation parameters
 * @param {Array} params.weakAreas - Weak areas from weakAreaEngine
 * @param {Object} params.topicProgress - Current topic progress data
 * @param {Array} params.recentAttempts - Recent attempt history
 * @param {number} params.streakDays - Current streak
 * @returns {Array} Top 3 text recommendations
 */
export function generateRecommendations({ weakAreas, topicProgress, recentAttempts, streakDays = 0 }) {
  const recommendations = [];
  const usedTopics = new Set();

  // 1. Weak area recommendations (prioritize critical and high)
  if (weakAreas && weakAreas.length > 0) {
    const prioritized = weakAreas.filter(w => w.severity === 'critical' || w.severity === 'high');
    
    for (const weakArea of prioritized.slice(0, 2)) {
      const topicName = formatSubtopicName(weakArea.subtopicTag);
      
      // Avoid repeating the same topic
      if (usedTopics.has(topicName)) continue;
      usedTopics.add(topicName);
      
      const templates = RECOMMENDATION_TEMPLATES.weakArea[weakArea.severity];
      const template = selectTemplate(templates);
      
      if (template) {
        recommendations.push({
          type: 'weak_area',
          priority: weakArea.severity === 'critical' ? 1 : 2,
          text: template.replace('{topic}', topicName)
        });
      }
      
      if (recommendations.length >= 2) break;
    }
    
    // If no critical/high, use medium severity
    if (recommendations.length === 0) {
      const mediumAreas = weakAreas.filter(w => w.severity === 'medium');
      if (mediumAreas.length > 0) {
        const topicName = formatSubtopicName(mediumAreas[0].subtopicTag);
        const template = selectTemplate(RECOMMENDATION_TEMPLATES.weakArea.medium);
        
        recommendations.push({
          type: 'weak_area',
          priority: 3,
          text: template.replace('{topic}', topicName)
        });
      }
    }
  }

  // 2. Progress-based recommendation
  if (topicProgress) {
    let progressTemplate;
    let priority = 3;
    
    if (topicProgress.attempts <= 1) {
      progressTemplate = selectTemplate(RECOMMENDATION_TEMPLATES.progress.newTopic);
      priority = 2;
    } else if (topicProgress.mastery >= 70) {
      progressTemplate = selectTemplate(RECOMMENDATION_TEMPLATES.progress.improving);
      priority = 4;
    } else if (topicProgress.attempts >= 3 && topicProgress.mastery < 50) {
      progressTemplate = selectTemplate(RECOMMENDATION_TEMPLATES.progress.plateau);
      priority = 2;
    }
    
    if (progressTemplate) {
      recommendations.push({
        type: 'progress',
        priority,
        text: progressTemplate
      });
    }
  }

  // 3. General recommendations based on streak and patterns
  if (recommendations.length < 3) {
    let generalType;
    let priority = 5;
    
    if (streakDays < 3) {
      generalType = 'consistency';
      priority = 3;
    } else if (recentAttempts && recentAttempts.length >= 3) {
      // Check if user has been practicing same topic repeatedly
      const uniqueTopics = new Set(recentAttempts.map(a => a.topicId)).size;
      if (uniqueTopics === 1) {
        generalType = 'variety';
        priority = 3;
      } else {
        generalType = 'review';
        priority = 4;
      }
    } else {
      generalType = 'consistency';
    }
    
    const templates = RECOMMENDATION_TEMPLATES.general[generalType];
    const template = selectTemplate(templates);
    
    if (template) {
      recommendations.push({
        type: 'general',
        priority,
        text: template
      });
    }
  }

  // 4. Fill remaining slots with general recommendations if needed
  const generalTypes = ['consistency', 'variety', 'review'];
  let typeIndex = 0;
  
  while (recommendations.length < 3 && typeIndex < generalTypes.length) {
    const templates = RECOMMENDATION_TEMPLATES.general[generalTypes[typeIndex]];
    const template = selectTemplate(templates);
    
    // Avoid duplicates
    const isDuplicate = recommendations.some(r => r.text === template);
    
    if (template && !isDuplicate) {
      recommendations.push({
        type: 'general',
        priority: 5 + typeIndex,
        text: template
      });
    }
    
    typeIndex++;
  }

  // Sort by priority and return top 3 with clean format
  return recommendations
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3)
    .map(r => ({
      type: r.type,
      text: r.text
    }));
}

/**
 * Get recommendation summary
 * @param {Array} recommendations - Generated recommendations
 * @returns {Object} Summary with types and count
 */
export function getRecommendationSummary(recommendations) {
  if (!recommendations || recommendations.length === 0) {
    return { count: 0, hasWeakAreaFocus: false, types: [] };
  }

  const types = [...new Set(recommendations.map(r => r.type))];
  
  return {
    count: recommendations.length,
    hasWeakAreaFocus: types.includes('weak_area'),
    types
  };
}
