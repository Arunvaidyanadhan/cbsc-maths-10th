// Temporary fallback badge engine for when database schema isn't updated yet

// Static badge data based on original implementation
const STATIC_BADGES = [
  {
    id: 'b1',
    name: 'First Step',
    description: 'Complete your first practice session',
    icon: '??',
    type: 'session',
    criteria: { count: 1 },
    order: 1,
    rarity: 'common',
    xpReward: 20,
    isActive: true
  },
  {
    id: 'b2',
    name: 'Getting Serious',
    description: 'Complete 5 practice sessions',
    icon: '??',
    type: 'session',
    criteria: { count: 5 },
    order: 2,
    rarity: 'common',
    xpReward: 20,
    isActive: true
  },
  {
    id: 'b3',
    name: '3-Day Streak',
    description: 'Maintain a 3-day practice streak',
    icon: '??',
    type: 'streak',
    criteria: { days: 3 },
    order: 3,
    rarity: 'rare',
    xpReward: 50,
    isActive: true
  },
  {
    id: 'b4',
    name: 'Week Warrior',
    description: 'Maintain a 7-day practice streak',
    icon: '??',
    type: 'streak',
    criteria: { days: 7 },
    order: 4,
    rarity: 'rare',
    xpReward: 50,
    isActive: true
  },
  {
    id: 'b5',
    name: 'Half Century',
    description: 'Achieve 50 marks',
    icon: '??',
    type: 'marks',
    criteria: { min: 50 },
    order: 5,
    rarity: 'rare',
    xpReward: 50,
    isActive: true
  }
];

/**
 * Get user stats for badge evaluation (simplified version)
 */
async function getUserStatsFallback(userId) {
  try {
    // This would normally fetch from database, but for now we'll simulate
    return {
      xp: 0,
      streak: 0,
      longestStreak: 0,
      dailyGoal: 10,
      hasSetGoal: false,
      daysSinceLastActive: 0,
      totalSessions: 0,
      recentAccuracy: 0,
      masteredTopics: 0,
      modeProgress: {},
      modeBestScores: {}
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return {
      xp: 0,
      streak: 0,
      longestStreak: 0,
      dailyGoal: 10,
      hasSetGoal: false,
      daysSinceLastActive: 0,
      totalSessions: 0,
      recentAccuracy: 0,
      masteredTopics: 0,
      modeProgress: {},
      modeBestScores: {}
    };
  }
}

/**
 * Evaluate badge criteria against user stats
 */
function evaluateBadgeCriteria(userStats, badge) {
  const { type, criteria } = badge;
  
  switch (type) {
    case 'session':
      const target = criteria.count || 1;
      const current = userStats.totalSessions || 0;
      return {
        unlocked: current >= target,
        progress: Math.min(current, target),
        target,
        percentage: (current / target) * 100
      };
      
    case 'streak':
      const streakTarget = criteria.days || 1;
      const currentStreak = userStats.streak || 0;
      return {
        unlocked: currentStreak >= streakTarget,
        progress: Math.min(currentStreak, streakTarget),
        target: streakTarget,
        percentage: (currentStreak / streakTarget) * 100
      };
      
    case 'marks':
      const marksTarget = criteria.min || 50;
      const currentMarks = userStats.xp || 0;
      return {
        unlocked: currentMarks >= marksTarget,
        progress: Math.min(currentMarks, marksTarget),
        target: marksTarget,
        percentage: (currentMarks / marksTarget) * 100
      };
      
    default:
      return {
        unlocked: false,
        progress: 0,
        target: 1,
        percentage: 0
      };
  }
}

/**
 * Get badges with progress information (fallback version)
 */
export async function getBadgesWithProgress(userId) {
  try {
    const userStats = await getUserStatsFallback(userId);
    
    return STATIC_BADGES.map(badge => {
      const evaluation = evaluateBadgeCriteria(userStats, badge);
      
      return {
        id: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        type: badge.type,
        criteria: badge.criteria,
        order: badge.order,
        rarity: badge.rarity,
        xpReward: badge.xpReward,
        isUnlocked: evaluation.unlocked,
        isRevealed: false, // All badges start as unrevealed
        earnedAt: null,
        revealedAt: null,
        progress: evaluation.progress,
        target: evaluation.target,
        percentage: evaluation.percentage
      };
    });
  } catch (error) {
    console.error('Error getting badges with progress:', error);
    return [];
  }
}

/**
 * Run badge evaluation (fallback version)
 */
export async function runBadgeEvaluation(userId, triggerType) {
  try {
    // For now, no badges will be unlocked in fallback mode
    return [];
  } catch (error) {
    console.error('Error in badge evaluation:', error);
    return [];
  }
}
