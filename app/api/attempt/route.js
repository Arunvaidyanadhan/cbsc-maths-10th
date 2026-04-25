import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { runBadgeEvaluation } from '../../../lib/badgeEngine';
import { getRequestUserId } from '../../../lib/auth.js';
import { rateLimit } from '../../../lib/rateLimiter.js';
import { sanitizeId, sanitizeLevel, sanitizeNumber, sanitizeObjectArray } from '../../../lib/sanitize.js';

export async function POST(request) {
  // Rate limiting: 30 requests per minute for attempts
  const ip = request.headers.get('x-forwarded-for') || 
              request.headers.get('x-real-ip') || 
              'unknown';
  
  if (!rateLimit(ip, 30, 60000)) {
    return NextResponse.json({ 
      error: 'Too many requests. Please try again later.' 
    }, { status: 429 });
  }

  try {
    const body = await request.json();
    const sessionUserId = await getRequestUserId(request, { allowQuery: true, allowHeader: true });
    const { userId: bodyUserId, topicId, chapterId, level, score, total, answers, timeTakenSecs } = body;
    const userId = sessionUserId || bodyUserId;
    
    // Sanitize inputs
    const sanitizedTopicId = sanitizeId(topicId);
    const sanitizedChapterId = sanitizeId(chapterId);
    const sanitizedLevel = sanitizeLevel(level);
    const sanitizedScore = sanitizeNumber(score, 0, 1000);
    const sanitizedTotal = sanitizeNumber(total, 1, 1000);
    const sanitizedTime = sanitizeNumber(timeTakenSecs, 0, 3600);
    const sanitizedAnswers = sanitizeObjectArray(answers);
    
    if (!userId || !sanitizedTopicId || !sanitizedChapterId) {
      return NextResponse.json({ error: 'userId, topicId, and chapterId are required' }, { status: 400 });
    }
    
    const mastery = Math.round((sanitizedScore / sanitizedTotal) * 100);
    const xpEarned = sanitizedScore * 5;
    
    // Calculate weak subtopics (only from valid answers)
    const validAnswersForAnalysis = sanitizedAnswers.filter(a => 
      a && typeof a.isCorrect === 'boolean'
    );
    const wrongAnswers = validAnswersForAnalysis.filter(a => !a.isCorrect);
    const subtopicCounts = {};
    wrongAnswers.forEach(a => {
      if (a.subtopicTag) {
        subtopicCounts[a.subtopicTag] = (subtopicCounts[a.subtopicTag] || 0) + 1;
      }
    });
    const weakSubtopics = Object.entries(subtopicCounts)
      .filter(([, count]) => count >= 2)
      .map(([tag]) => tag);
    
  
    // Validate and filter answers before saving
    const validAnswers = sanitizedAnswers.filter(a => 
      a && 
      typeof a.selectedIndex === 'number' && 
      typeof a.correctIndex === 'number' && 
      typeof a.isCorrect === 'boolean'
    );

    if (validAnswers.length === 0) {
      return NextResponse.json({ 
        error: 'No valid answers provided' 
      }, { status: 400 });
    }

    // Save attempt with answers
    const attempt = await prisma.attempt.create({
      data: {
        userId,
        topicId: sanitizedTopicId,
        chapterId: sanitizedChapterId,
        level: sanitizedLevel,
        score: sanitizedScore,
        total: sanitizedTotal,
        mastery,
        xpEarned,
        timeTakenSecs: sanitizedTime,
        weakSubtopics,
        answers: {
          create: validAnswers.map(a => ({
            selectedIndex: a.selectedIndex,
            correctIndex: a.correctIndex,
            isCorrect: a.isCorrect,
            timeTakenSecs: a.timeTakenSecs || 0,
            subtopicTag: a.subtopicTag || null,
          })),
        },
      },
      include: {
        answers: true,
      },
    });
    
    // Update or create daily stats
    // Use toDateString() for proper unique day tracking
    const todayStr = new Date().toDateString();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toDateString();
    
    const existingDailyStats = await prisma.dailyStats.findUnique({
      where: { userId }
    });

    let newStreak = existingDailyStats?.streak || 0;
    let newLongestStreak = existingDailyStats?.longestStreak || 0;

    // Check if it's a new day
    if (existingDailyStats && existingDailyStats.todayDate !== todayStr) {
      // Check if yesterday was active
      if (existingDailyStats.todayDate === yesterdayStr && existingDailyStats.todayGoalHit) {
        newStreak = existingDailyStats.streak + 1;
      } else {
        // Streak reset if missed a day
        newStreak = 1;
      }
    } else if (!existingDailyStats) {
      // First time user
      newStreak = 1;
    }

    const dailyStats = await prisma.dailyStats.upsert({
      where: { userId },
      update: {
        xp: { increment: xpEarned },
        todayDate: todayStr,
        todayQuestionsAnswered: { increment: sanitizedTotal },
        todayQuestionsCorrect: { increment: sanitizedScore },
        streak: newStreak,
        longestStreak: Math.max(newLongestStreak, newStreak),
        todayGoalHit: existingDailyStats?.todayDate === todayStr 
          ? (existingDailyStats.todayQuestionsAnswered + sanitizedTotal >= 15)
          : (sanitizedTotal >= 15),
        updatedAt: new Date(),
      },
      create: {
        userId,
        xp: xpEarned,
        dailyGoal: 15,
        todayDate: todayStr,
        todayQuestionsAnswered: sanitizedTotal,
        todayQuestionsCorrect: sanitizedScore,
        streak: newStreak,
        longestStreak: newStreak,
        todayGoalHit: sanitizedTotal >= 15,
      },
    });
    
    // Update topic progress
    await prisma.topicProgress.upsert({
      where: { 
        userId_topicId: { userId, topicId: sanitizedTopicId }
      },
      update: {
        mastery,
        attempts: { increment: 1 },
        bestScore: { set: Math.max(sanitizedScore) },
        lastDoneAt: new Date(),
      },
      create: {
        userId,
        topicId: sanitizedTopicId,
        bestScore: sanitizedScore,
        mastery,
        attempts: 1,
        completedAt: new Date(),
        lastDoneAt: new Date(),
      },
    });
    
    // Track mistakes for weak area detection
    for (const answer of wrongAnswers) {
      if (answer.subtopicTag) {
        await prisma.mistake.upsert({
          where: {
            userId_topicId_subtopicTag: {
              userId,
              topicId: sanitizedTopicId,
              subtopicTag: answer.subtopicTag,
            }
          },
          update: {
            wrongCount: { increment: 1 },
          },
          create: {
            userId,
            topicId: sanitizedTopicId,
            subtopicTag: answer.subtopicTag,
            wrongCount: 1,
          },
        });
      }
    }
    
    // Update chapter progress
    const chapterProgress = await prisma.chapterProgress.findUnique({
      where: { 
        userId_chapterId: { userId, chapterId: sanitizedChapterId }
      },
    });
    
    // Get total topics in this chapter
    const chapter = await prisma.chapter.findUnique({
      where: { id: sanitizedChapterId },
      select: { totalTopics: true }
    });
    
    const completedTopics = chapterProgress?.completedTopicIds || [];
    const totalTopics = chapter?.totalTopics || 1;
    
    if (!completedTopics.includes(sanitizedTopicId)) {
      const newCompletedTopics = [...completedTopics, sanitizedTopicId];
      const newPct = Math.round((newCompletedTopics.length / totalTopics) * 100);
      
      await prisma.chapterProgress.upsert({
        where: { 
          userId_chapterId: { userId, chapterId: sanitizedChapterId }
        },
        update: {
          completedTopicIds: { push: sanitizedTopicId },
          pct: newPct,
          lastPractisedAt: new Date(),
        },
        create: {
          userId,
          chapterId: sanitizedChapterId,
          completedTopicIds: [sanitizedTopicId],
          pct: Math.round((1 / totalTopics) * 100),
          lastPractisedAt: new Date(),
        },
      });
    }
    
    // Update user XP
    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: { increment: xpEarned },
        lastActiveAt: new Date(),
      },
    });
    
    // Check for new badge unlocks (protected from failure)
    let newlyUnlockedBadges = [];
    try {
      newlyUnlockedBadges = await runBadgeEvaluation(userId, 'practice');
    } catch (badgeError) {
      console.error('Badge evaluation failed:', badgeError);
      // Continue without badges - don't break the attempt flow
    }
    
    return NextResponse.json({ 
      success: true, 
      attemptId: attempt.id,
      mastery,
      xpEarned,
      weakSubtopics,
      newlyUnlockedBadges,
    });
  } catch (error) {
    console.error('Attempt API Error:', error);
    console.error('Stack trace:', error.stack);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
