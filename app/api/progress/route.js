import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { getRequestUserId } from '../../../lib/auth.js';

export async function GET(request) {
  try {
    const userId = await getRequestUserId(request, { allowQuery: true });
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Get user and daily stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        dailyStats: true,
      },
    });
    
    const stats = await prisma.dailyStats.findUnique({
      where: { userId },
    });
    
    // Get topic progress
    const topicProgress = await prisma.topicProgress.findMany({
      where: { userId },
    });
    
    // Get chapter progress
    const chapterProgress = await prisma.chapterProgress.findMany({
      where: { userId },
    });
    
    // Get mistakes for weak area detection
    const mistakes = await prisma.mistake.findMany({
      where: { userId, wrongCount: { gte: 3 } },
      orderBy: { wrongCount: 'desc' },
      take: 5,
      include: {
        topic: { select: { name: true } },
      },
    });
    
    // Calculate accuracy
    const todayQuestions = stats?.todayQuestionsAnswered || 0;
    const todayCorrect = stats?.todayQuestionsCorrect || 0;
    const accuracy = todayQuestions > 0 ? Math.round((todayCorrect / todayQuestions) * 100) : 0;
    
    // Calculate total attempted
    const totalAttempted = topicProgress.reduce((sum, tp) => sum + tp.attempts, 0);
    
    // Format weak topics
    const weakTopics = mistakes.map(m => ({
      topicId: m.topicId,
      subtopicTag: m.subtopicTag,
      wrongCount: m.wrongCount,
      topicName: m.topic?.name,
    }));
    
    // Format chapter progress for frontend
    const chaptersObj = {};
    chapterProgress.forEach(cp => {
      chaptersObj[cp.chapterId] = {
        completedTopics: cp.completedTopicIds,
        pct: cp.pct,
        lastPractisedAt: cp.lastPractisedAt,
      };
    });
    
    // Format topic progress for frontend
    const topicsObj = {};
    topicProgress.forEach(tp => {
      topicsObj[tp.topicId] = {
        bestScore: tp.bestScore,
        mastery: tp.mastery,
        attempts: tp.attempts,
        completedAt: tp.completedAt,
        lastDoneAt: tp.lastDoneAt,
      };
    });
    
    return NextResponse.json({
      userName: user?.name || 'Student',
      totalAttempted,
      accuracy,
      weakTopics,
      streak: stats?.streak || 0,
      longestStreak: stats?.longestStreak || 0,
      xp: user?.xp || 0,
      isPremium: user?.isPremium || false,
      todayQuestions,
      dailyGoal: stats?.dailyGoal || 15,
      goalHit: stats?.todayGoalHit || false,
      chapters: chaptersObj,
      topics: topicsObj,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
