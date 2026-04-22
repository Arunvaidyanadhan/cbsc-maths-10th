import prisma from './prisma.js';

/**
 * Unlock a badge for a user if they meet the criteria
 * @param {string} userId - User ID
 * @param {string} badgeId - Badge ID
 * @returns {Promise<{unlocked: boolean, badge?: Object}>}
 */
export async function unlockBadge(userId, badgeId) {
  try {
    // Check if badge is already unlocked
    const existing = await prisma.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId,
          badgeId
        }
      }
    });

    if (existing) {
      return { unlocked: false };
    }

    // Get badge details
    const badge = await prisma.badge.findUnique({
      where: { id: badgeId, isActive: true }
    });

    if (!badge) {
      return { unlocked: false };
    }

    // Check if user meets criteria
    const meetsCriteria = await checkBadgeCriteria(userId, badge);
    
    if (meetsCriteria) {
      // Unlock the badge
      const userBadge = await prisma.userBadge.create({
        data: {
          userId,
          badgeId
        },
        include: {
          badge: true
        }
      });

      return { unlocked: true, badge: userBadge.badge };
    }

    return { unlocked: false };
  } catch (error) {
    console.error('Error unlocking badge:', error);
    return { unlocked: false };
  }
}

/**
 * Check if user meets badge criteria
 * @param {string} userId - User ID
 * @param {Object} badge - Badge object with criteria
 * @returns {Promise<boolean>}
 */
async function checkBadgeCriteria(userId, badge) {
  const criteria = badge.criteria;
  const type = badge.type;

  try {
    switch (type) {
      case 'session':
        return await checkSessionCriteria(userId, criteria);
      case 'streak':
        return await checkStreakCriteria(userId, criteria);
      case 'marks':
        return await checkMarksCriteria(userId, criteria);
      case 'accuracy':
        return await checkAccuracyCriteria(userId, criteria);
      case 'mode':
        return await checkModeCriteria(userId, criteria);
      case 'modeScore':
        return await checkModeScoreCriteria(userId, criteria);
      case 'mastery':
        return await checkMasteryCriteria(userId, criteria);
      case 'correct':
        return await checkCorrectCriteria(userId, criteria);
      case 'profile':
        return await checkProfileCriteria(userId, criteria);
      case 'comeback':
        return await checkComebackCriteria(userId, criteria);
      default:
        return false;
    }
  } catch (error) {
    console.error('Error checking badge criteria:', error);
    return false;
  }
}

/**
 * Check session completion criteria
 */
async function checkSessionCriteria(userId, criteria) {
  const count = criteria.count || 1;
  const attemptCount = await prisma.attempt.count({
    where: { userId }
  });
  const practiceModeAttemptCount = await prisma.practiceModeAttempt.count({
    where: { userId }
  });
  const totalSessions = attemptCount + practiceModeAttemptCount;
  return totalSessions >= count;
}

/**
 * Check streak criteria
 */
async function checkStreakCriteria(userId, criteria) {
  const days = criteria.days || 1;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { streak: true }
  });
  return user?.streak >= days;
}

/**
 * Check marks criteria (based on XP)
 */
async function checkMarksCriteria(userId, criteria) {
  const marks = criteria.marks || 50;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true }
  });
  return user?.xp >= marks;
}

/**
 * Check accuracy criteria
 */
async function checkAccuracyCriteria(userId, criteria) {
  const percent = criteria.percent || 90;
  
  // Get recent attempts to check accuracy
  const recentAttempts = await prisma.attempt.findMany({
    where: { userId },
    orderBy: { completedAt: 'desc' },
    take: 10
  });

  if (recentAttempts.length === 0) return false;

  const totalCorrect = recentAttempts.reduce((sum, attempt) => sum + attempt.score, 0);
  const totalQuestions = recentAttempts.reduce((sum, attempt) => sum + attempt.total, 0);
  const accuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

  return accuracy >= percent;
}

/**
 * Check practice mode criteria
 */
async function checkModeCriteria(userId, criteria) {
  const count = criteria.count || 1;
  const mode = criteria.mode;

  if (!mode) return false;

  const practiceMode = await prisma.practiceMode.findUnique({
    where: { slug: mode }
  });

  if (!practiceMode) return false;

  const attemptCount = await prisma.practiceModeAttempt.count({
    where: {
      userId,
      practiceModeId: practiceMode.id
    }
  });

  return attemptCount >= count;
}

/**
 * Check mode score criteria
 */
async function checkModeScoreCriteria(userId, criteria) {
  const mode = criteria.mode;
  const score = criteria.score || 8;

  if (!mode) return false;

  const practiceMode = await prisma.practiceMode.findUnique({
    where: { slug: mode }
  });

  if (!practiceMode) return false;

  const bestAttempt = await prisma.practiceModeAttempt.findFirst({
    where: {
      userId,
      practiceModeId: practiceMode.id
    },
    orderBy: { score: 'desc' }
  });

  return bestAttempt?.score >= score;
}

/**
 * Check mastery criteria (topics mastered)
 */
async function checkMasteryCriteria(userId, criteria) {
  const topics = criteria.topics || 3;
  
  const masteredTopics = await prisma.topicProgress.count({
    where: {
      userId,
      mastery: { gte: 80 }
    }
  });

  return masteredTopics >= topics;
}

/**
 * Check correct questions criteria
 */
async function checkCorrectCriteria(userId, criteria) {
  const count = criteria.count || 50;

  const result = await prisma.attempt.aggregate({
    where: { userId },
    _sum: { score: true }
  });

  return (result._sum.score || 0) >= count;
}

/**
 * Check profile criteria
 */
async function checkProfileCriteria(userId, criteria) {
  if (criteria.goalSet) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { dailyGoal: true }
    });
    return user?.dailyGoal > 0;
  }
  return false;
}

/**
 * Check comeback criteria (return after break)
 */
async function checkComebackCriteria(userId, criteria) {
  const days = criteria.days || 3;
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastActiveAt: true }
  });

  if (!user?.lastActiveAt) return false;

  const daysSinceLastActive = Math.floor(
    (Date.now() - new Date(user.lastActiveAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysSinceLastActive >= days;
}

/**
 * Check all possible badges for a user and unlock any they qualify for
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of newly unlocked badges
 */
export async function checkAndUnlockBadges(userId) {
  try {
    // Get all active badges
    const badges = await prisma.badge.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });

    const newlyUnlocked = [];

    for (const badge of badges) {
      const result = await unlockBadge(userId, badge.id);
      if (result.unlocked) {
        newlyUnlocked.push(result.badge);
      }
    }

    return newlyUnlocked;
  } catch (error) {
    console.error('Error checking badges:', error);
    return [];
  }
}
