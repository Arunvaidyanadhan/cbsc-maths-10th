import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { getRequestUserId } from '../../../lib/auth.js';

export async function GET(request) {
  try {
    const userId = await getRequestUserId(request, { allowQuery: true });
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // 1. Get user basic info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        xp: true,
        longestStreak: true,
        dailyGoal: true,
        isPremium: true,
      },
    });
    
    // 2. Get all attempts for real stats calculation
    const attempts = await prisma.attempt.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      include: {
        answers: true,
      },
    });
    
    // 3. Calculate real stats from attempts (NOT only DailyStats)
    const totalQuestions = attempts.reduce((sum, a) => sum + (a.total || 0), 0);
    const totalCorrect = attempts.reduce((sum, a) => sum + (a.score || 0), 0);
    const totalXP = attempts.reduce((sum, a) => sum + (a.xpEarned || 0), 0);
    
    // Calculate accuracy
    const accuracy = totalQuestions > 0
      ? Math.round((totalCorrect / totalQuestions) * 100)
      : 0;
    
    // Calculate average score and time
    const avgScore = attempts.length > 0
      ? (attempts.reduce((sum, a) => sum + ((a.score / a.total) * 10 || 0), 0) / attempts.length).toFixed(1)
      : 0;
    
    const avgTime = attempts.length > 0
      ? Math.round(attempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0) / attempts.length)
      : 0;
    
    // 4. Calculate streak from unique days (CORRECT LOGIC)
    const uniqueDays = new Set(
      attempts.map(a => new Date(a.completedAt).toDateString())
    );
    
    // Calculate streak: number of continuous days with activity
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    while (uniqueDays.has(currentDate.toDateString())) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    // Update user streak if needed
    if (streak > (user?.longestStreak || 0)) {
      await prisma.user.update({
        where: { id: userId },
        data: { longestStreak: streak }
      });
    }
    
    // 5. Calculate consistency %
    const consistency = Math.min(100, Math.round((uniqueDays.size / 30) * 100));
    
    // 6. Get today's progress
    const today = new Date().toDateString();
    const todayAttempts = attempts.filter(a => 
      new Date(a.completedAt).toDateString() === today
    );
    const todayQuestions = todayAttempts.reduce((sum, a) => sum + (a.total || 0), 0);
    const todayCorrect = todayAttempts.reduce((sum, a) => sum + (a.score || 0), 0);
    const dailyGoal = user?.dailyGoal || 15;
    const goalHit = todayQuestions >= dailyGoal;
    
    // 7. Get topic progress
    const topicProgress = await prisma.topicProgress.findMany({
      where: { userId },
      include: {
        topic: { select: { name: true } },
      },
    });
    
    // 8. Get chapter progress
    const chapterProgress = await prisma.chapterProgress.findMany({
      where: { userId },
      include: {
        chapter: { select: { name: true } },
      },
    });
    
    // 9. Get mistakes for weak area detection
    const mistakes = await prisma.mistake.findMany({
      where: { userId, wrongCount: { gte: 3 } },
      orderBy: { wrongCount: 'desc' },
      take: 5,
      include: {
        topic: { select: { name: true } },
      },
    });
    
    // 10. Get badges
    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: {
        badge: true,
      },
    });
    
    // 11. Get practice mode progress
    const practiceModeAttempts = await prisma.practiceModeAttempt.findMany({
      where: { userId },
      include: {
        practiceMode: true,
      },
    });
    
    // Calculate exam countdown (CBSE exam typically in March)
    const now = new Date();
    const currentYear = now.getFullYear();
    const examDate = new Date(currentYear, 2, 1); // March 1st
    if (now > examDate) {
      examDate.setFullYear(currentYear + 1);
    }
    const examCountdownDays = Math.ceil((examDate - now) / (1000 * 60 * 60 * 24));
    
    // Format weak topics
    const weakTopics = mistakes.map(m => ({
      topicId: m.topicId,
      subtopicTag: m.subtopicTag,
      wrongCount: m.wrongCount,
      topicName: m.topic?.name || m.subtopicTag,
    }));
    
    // Format strong topics (mastery > 70%)
    const strongTopics = topicProgress
      .filter(tp => tp.mastery > 70)
      .map(tp => tp.topic?.name || tp.topicId)
      .slice(0, 3);
    
    // Format chapter progress
    const chaptersObj = {};
    chapterProgress.forEach(cp => {
      chaptersObj[cp.chapterId] = {
        completedTopics: cp.completedTopicIds,
        pct: cp.pct,
        lastPractisedAt: cp.lastPractisedAt,
        name: cp.chapter?.name,
      };
    });
    
    // Format topic progress
    const topicsObj = {};
    topicProgress.forEach(tp => {
      topicsObj[tp.topicId] = {
        bestScore: tp.bestScore,
        mastery: tp.mastery,
        attempts: tp.attempts,
        completedAt: tp.completedAt,
        lastDoneAt: tp.lastDoneAt,
        name: tp.topic?.name,
      };
    });
    
    // Calculate practice modes progress
    const practiceModesProgress = {};
    practiceModeAttempts.forEach(pma => {
      const modeSlug = pma.practiceMode?.slug;
      if (modeSlug) {
        if (!practiceModesProgress[modeSlug]) {
          practiceModesProgress[modeSlug] = 0;
        }
        practiceModesProgress[modeSlug] += pma.score || 0;
      }
    });
    
    // Format badges
    const badgesEarned = userBadges.filter(ub => ub.isUnlocked).length;
    const unrevealedBadges = userBadges.filter(ub => ub.isUnlocked && !ub.isRevealed).length;
    
    return NextResponse.json({
      // User info
      name: user?.name || user?.email?.split('@')[0] || 'Student',
      email: user?.email || '',
      xp: totalXP || user?.xp || 0,
      streak,
      longestStreak: Math.max(streak, user?.longestStreak || 0),
      consistency,
      
      // Performance stats
      totalQuestions,
      totalCorrect,
      accuracy,
      avgScore: parseFloat(avgScore),
      avgTime,
      
      // Today's progress
      todayProgress: {
        done: todayQuestions,
        goal: dailyGoal,
        correct: todayCorrect,
      },
      goalHit,
      dailyGoal,
      todayQuestions,
      
      // Badges
      badgesEarned,
      unrevealedBadges,
      badges: userBadges,
      
      // Topics
      weakTopics,
      strongTopics,
      
      // Practice modes
      practiceModesProgress,
      
      // Exam
      examCountdownDays,
      
      // Progress data
      totalAttempted: attempts.length,
      chapters: chaptersObj,
      topics: topicsObj,
      isPremium: user?.isPremium || false,
    });
  } catch (error) {
    console.error('Error in progress API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
