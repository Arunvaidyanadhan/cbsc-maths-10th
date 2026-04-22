import prisma from './prisma.js';
import { getBadgesWithProgress as getBadgesWithProgressFallback } from './badgeEngineFallback.js';

// Supported criteria types and their required fields
const SUPPORTED_CRITERIA_TYPES = {
  sessions: ['count'],
  streak: ['days'],
  accuracy: ['percentage'],
  marks: ['min'],
  mode: ['slug', 'count'],
  modeScore: ['slug', 'score'],
  topics: ['count'],
  comeback: ['gapDays'],
  profile: ['field']
};

/**
 * Validate badge criteria structure
 * @param {Object} criteria - Badge criteria object
 * @param {string} type - Badge type
 * @returns {boolean}
 */
function validateCriteria(criteria, type) {
  if (!criteria || typeof criteria !== 'object') {
    return false;
  }

  const requiredFields = SUPPORTED_CRITERIA_TYPES[type];
  if (!requiredFields) {
    console.warn(`Unsupported badge type: ${type}`);
    return false;
  }

  return requiredFields.every(field => field in criteria && criteria[field] !== null);
}

/**
 * Evaluate badge criteria against user stats
 * @param {Object} userStats - User statistics
 * @param {Object} criteria - Badge criteria
 * @param {string} type - Badge type
 * @returns {Object} - { unlocked: boolean, progress: number, target: number }
 */
function evaluateCriteria(userStats, criteria, type) {
  switch (type) {
    case 'sessions':
      return evaluateSessionsCriteria(userStats, criteria);
    case 'streak':
      return evaluateStreakCriteria(userStats, criteria);
    case 'accuracy':
      return evaluateAccuracyCriteria(userStats, criteria);
    case 'marks':
      return evaluateMarksCriteria(userStats, criteria);
    case 'mode':
      return evaluateModeCriteria(userStats, criteria);
    case 'modeScore':
      return evaluateModeScoreCriteria(userStats, criteria);
    case 'topics':
      return evaluateTopicsCriteria(userStats, criteria);
    case 'comeback':
      return evaluateComebackCriteria(userStats, criteria);
    case 'profile':
      return evaluateProfileCriteria(userStats, criteria);
    default:
      return { unlocked: false, progress: 0, target: 1 };
  }
}

function evaluateSessionsCriteria(userStats, criteria) {
  const target = criteria.count || 1;
  const current = userStats.totalSessions || 0;
  return {
    unlocked: current >= target,
    progress: Math.min(current, target),
    target
  };
}

function evaluateStreakCriteria(userStats, criteria) {
  const target = criteria.days || 1;
  const current = userStats.streak || 0;
  return {
    unlocked: current >= target,
    progress: Math.min(current, target),
    target
  };
}

function evaluateAccuracyCriteria(userStats, criteria) {
  const target = criteria.percentage || 90;
  const current = userStats.recentAccuracy || 0;
  return {
    unlocked: current >= target,
    progress: Math.min(current, target),
    target
  };
}

function evaluateMarksCriteria(userStats, criteria) {
  const target = criteria.min || 50;
  const current = userStats.xp || 0;
  return {
    unlocked: current >= target,
    progress: Math.min(current, target),
    target
  };
}

function evaluateModeCriteria(userStats, criteria) {
  const target = criteria.count || 1;
  const modeSlug = criteria.slug;
  
  if (!modeSlug || !userStats.modeProgress) {
    return { unlocked: false, progress: 0, target };
  }

  const current = userStats.modeProgress[modeSlug] || 0;
  return {
    unlocked: current >= target,
    progress: Math.min(current, target),
    target
  };
}

function evaluateModeScoreCriteria(userStats, criteria) {
  const target = criteria.score || 8;
  const modeSlug = criteria.slug;
  
  if (!modeSlug || !userStats.modeBestScores) {
    return { unlocked: false, progress: 0, target };
  }

  const current = userStats.modeBestScores[modeSlug] || 0;
  return {
    unlocked: current >= target,
    progress: Math.min(current, target),
    target
  };
}

function evaluateTopicsCriteria(userStats, criteria) {
  const target = criteria.count || 3;
  const current = userStats.masteredTopics || 0;
  return {
    unlocked: current >= target,
    progress: Math.min(current, target),
    target
  };
}

function evaluateComebackCriteria(userStats, criteria) {
  const target = criteria.gapDays || 3;
  const current = userStats.daysSinceLastActive || 0;
  return {
    unlocked: current >= target,
    progress: Math.min(current, target),
    target
  };
}

function evaluateProfileCriteria(userStats, criteria) {
  if (criteria.field === 'goalSet') {
    const current = userStats.hasSetGoal ? 1 : 0;
    return {
      unlocked: current >= 1,
      progress: current,
      target: 1
    };
  }
  return { unlocked: false, progress: 0, target: 1 };
}

/**
 * Get comprehensive user statistics for badge evaluation
 * @param {string} userId - User ID
 * @returns {Object} - User statistics object
 */
async function getUserStats(userId) {
  try {
    // Get basic user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        xp: true,
        streak: true,
        longestStreak: true,
        dailyGoal: true,
        lastActiveAt: true,
        isPremium: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Calculate days since last active
    const daysSinceLastActive = user.lastActiveAt 
      ? Math.floor((Date.now() - new Date(user.lastActiveAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Get total sessions (regular + practice mode)
    const [attemptCount, practiceModeCount] = await Promise.all([
      prisma.attempt.count({ where: { userId } }),
      prisma.practiceModeAttempt.count({ where: { userId } })
    ]);
    const totalSessions = attemptCount + practiceModeCount;

    // Get recent accuracy (last 10 sessions)
    const recentAttempts = await prisma.attempt.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      take: 10,
      select: { score: true, total: true }
    });

    let recentAccuracy = 0;
    if (recentAttempts.length > 0) {
      const totalCorrect = recentAttempts.reduce((sum, a) => sum + a.score, 0);
      const totalQuestions = recentAttempts.reduce((sum, a) => sum + a.total, 0);
      recentAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
    }

    // Get mastered topics
    const masteredTopics = await prisma.topicProgress.count({
      where: {
        userId,
        mastery: { gte: 80 }
      }
    });

    // Get practice mode progress
    const practiceModeAttempts = await prisma.practiceModeAttempt.groupBy({
      by: ['practiceModeId'],
      where: { userId },
      _count: { practiceModeId: true }
    });

    // Get practice mode best scores
    const practiceModeBestScores = await prisma.practiceModeAttempt.groupBy({
      by: ['practiceModeId'],
      where: { userId },
      _max: { score: true }
    });

    // Get practice mode details for mapping
    const practiceModes = await prisma.practiceMode.findMany({
      select: { id: true, slug: true }
    });

    const modeMap = practiceModes.reduce((acc, pm) => {
      acc[pm.id] = pm.slug;
      return acc;
    }, {});

    // Build mode progress and best scores maps
    const modeProgress = {};
    const modeBestScores = {};

    practiceModeAttempts.forEach(attempt => {
      const slug = modeMap[attempt.practiceModeId];
      if (slug) {
        modeProgress[slug] = attempt._count.practiceModeId;
      }
    });

    practiceModeBestScores.forEach(attempt => {
      const slug = modeMap[attempt.practiceModeId];
      if (slug) {
        modeBestScores[slug] = attempt._max.score;
      }
    });

    return {
      xp: user.xp,
      streak: user.streak,
      longestStreak: user.longestStreak,
      dailyGoal: user.dailyGoal,
      hasSetGoal: user.dailyGoal > 0,
      daysSinceLastActive,
      totalSessions,
      recentAccuracy,
      masteredTopics,
      modeProgress,
      modeBestScores
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
}

/**
 * Evaluate a single badge against user stats
 * @param {Object} userStats - User statistics
 * @param {Object} badge - Badge object
 * @returns {Object} - Evaluation result
 */
export function evaluateBadge(userStats, badge) {
  if (!badge || !badge.criteria || !badge.type) {
    return {
      unlocked: false,
      progress: 0,
      target: 1,
      error: 'Invalid badge data'
    };
  }

  // Validate criteria structure
  if (!validateCriteria(badge.criteria, badge.type)) {
    return {
      unlocked: false,
      progress: 0,
      target: 1,
      error: `Invalid criteria for type: ${badge.type}`
    };
  }

  // Evaluate criteria
  const result = evaluateCriteria(userStats, badge.criteria, badge.type);
  
  return {
    ...result,
    percentage: result.target > 0 ? Math.round((result.progress / result.target) * 100) : 0
  };
}

/**
 * Run badge evaluation for a user
 * @param {string} userId - User ID
 * @param {string} triggerType - Type of trigger ('practice', 'login', 'profile')
 * @returns {Array} - Array of newly unlocked badges
 */
export async function runBadgeEvaluation(userId, triggerType) {
  try {
    // Get user stats
    const userStats = await getUserStats(userId);
    
    // Get all active badges
    const badges = await prisma.badge.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });

    // Get user's existing badges
    const existingBadges = await prisma.userBadge.findMany({
      where: { userId },
      select: { badgeId: true }
    });
    const existingBadgeIds = new Set(existingBadges.map(ub => ub.badgeId));

    const newlyUnlocked = [];

    for (const badge of badges) {
      // Skip if already unlocked
      if (existingBadgeIds.has(badge.id)) {
        continue;
      }

      // Evaluate badge
      const evaluation = evaluateBadge(userStats, badge);
      
      // If unlocked, create UserBadge record and award XP
      if (evaluation.unlocked) {
        const userBadge = await prisma.userBadge.create({
          data: {
            userId,
            badgeId: badge.id,
            earnedAt: new Date(),
            progress: evaluation.target
          },
          include: {
            badge: true
          }
        });

        // Award XP for the badge
        await prisma.user.update({
          where: { id: userId },
          data: {
            xp: { increment: badge.xpReward || 20 }
          }
        });

        newlyUnlocked.push(userBadge.badge);
      }
    }

    return newlyUnlocked;
  } catch (error) {
    console.error('Error in badge evaluation:', error);
    return [];
  }
}

/**
 * Get badges with enhanced progress information
 * @param {string} userId - User ID
 * @returns {Array} - Enhanced badges array
 */
export async function getBadgesWithProgress(userId) {
  try {
    // Check if prisma is available
    if (!prisma || !prisma.badge) {
      console.warn('Prisma client not available, using fallback badge engine');
      return await getBadgesWithProgressFallback(userId);
    }

    // Get user stats
    const userStats = await getUserStats(userId);
    
    // Get all badges with user badge info
    const badges = await prisma.badge.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        userBadges: {
          where: { userId },
          select: {
            id: true,
            earnedAt: true,
            revealedAt: true,
            progress: true
          }
        }
      }
    });

    // Enhance badges with progress information
    return badges.map(badge => {
      const userBadge = badge.userBadges[0];
      const isUnlocked = !!userBadge;
      const isRevealed = !!userBadge?.revealedAt;

      let progress, target, percentage;
      
      if (isUnlocked) {
        progress = userBadge.progress || 1;
        target = userBadge.progress || 1;
        percentage = 100;
      } else {
        const evaluation = evaluateBadge(userStats, badge);
        progress = evaluation.progress;
        target = evaluation.target;
        percentage = evaluation.percentage;
      }

      return {
        id: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        type: badge.type,
        criteria: badge.criteria,
        order: badge.order,
        rarity: badge.rarity || 'common',
        xpReward: badge.xpReward || 20,
        isUnlocked,
        isRevealed,
        earnedAt: userBadge?.earnedAt || null,
        revealedAt: userBadge?.revealedAt || null,
        progress,
        target,
        percentage
      };
    });
  } catch (error) {
    console.error('Error getting badges with progress:', error);
    throw error;
  }
}
