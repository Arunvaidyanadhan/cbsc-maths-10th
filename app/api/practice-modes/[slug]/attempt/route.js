import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { runBadgeEvaluation } from '../../../../../lib/badgeEngine';
import { getRequestUserId } from '../../../../../lib/auth.js';

export async function POST(request, { params }) {
  try {
    const { slug } = params;
    const userId = await getRequestUserId(request, { allowHeader: true });
    const body = await request.json();
    const { score, total, answers, timeTakenSecs } = body;

    if (!userId || !slug || score === undefined || total === undefined || !answers) {
      return NextResponse.json(
        { error: 'userId, slug, score, total, and answers are required' },
        { status: 400 }
      );
    }

    // Get the practice mode
    const practiceMode = await prisma.practiceMode.findUnique({
      where: { slug, isActive: true },
    });

    if (!practiceMode) {
      return NextResponse.json(
        { error: 'Practice mode not found' },
        { status: 404 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isPremium: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    // Check if user can access this mode
    if (practiceMode.isPro && !user.isPremium) {
      return NextResponse.json(
        { error: 'Premium subscription required' },
        { status: 403 }
      );
    }

    const mastery = Math.round((score / total) * 100);
    const xpEarned = score * 5;

    // Calculate weak subtopics
    const wrongAnswers = answers.filter(a => !a.isCorrect);
    const subtopicCounts = {};
    wrongAnswers.forEach(a => {
      if (a.subtopicTag) {
        subtopicCounts[a.subtopicTag] = (subtopicCounts[a.subtopicTag] || 0) + 1;
      }
    });
    const weakSubtopics = Object.entries(subtopicCounts)
      .filter(([, count]) => count >= 2)
      .map(([tag]) => tag);

    // Save practice mode attempt with answers
    const attempt = await prisma.practiceModeAttempt.create({
      data: {
        userId,
        practiceModeId: practiceMode.id,
        score,
        total,
        mastery,
        xpEarned,
        timeTakenSecs,
        answers: {
          create: answers.map(a => ({
            selectedIndex: a.selectedIndex,
            correctIndex: a.correctIndex,
            isCorrect: a.isCorrect,
            timeTakenSecs: a.timeTakenSecs || 0,
            subtopicTag: a.subtopicTag,
          })),
        },
      },
      include: {
        answers: true,
      },
    });

    // Update daily stats
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

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

    await prisma.dailyStats.upsert({
      where: { userId },
      update: {
        xp: { increment: xpEarned },
        todayDate: todayStr,
        todayQuestionsAnswered: { increment: total },
        todayQuestionsCorrect: { increment: score },
        streak: newStreak,
        longestStreak: Math.max(newLongestStreak, newStreak),
        todayGoalHit: existingDailyStats?.todayDate === todayStr 
          ? (existingDailyStats.todayQuestionsAnswered + total >= 15)
          : (total >= 15),
        updatedAt: new Date(),
      },
      create: {
        userId,
        xp: xpEarned,
        dailyGoal: 15,
        todayDate: todayStr,
        todayQuestionsAnswered: total,
        todayQuestionsCorrect: score,
        streak: newStreak,
        longestStreak: newStreak,
        todayGoalHit: total >= 15,
      },
    });

    // Track mistakes for weak area detection
    for (const answer of wrongAnswers) {
      if (answer.subtopicTag) {
        await prisma.mistake.upsert({
          where: {
            userId_topicId_subtopicTag: {
              userId,
              topicId: 'practice-mode', // Use a special topicId for practice modes
              subtopicTag: answer.subtopicTag,
            }
          },
          update: {
            wrongCount: { increment: 1 },
          },
          create: {
            userId,
            topicId: 'practice-mode',
            subtopicTag: answer.subtopicTag,
            wrongCount: 1,
          },
        });
      }
    }

    // Update user XP
    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: { increment: xpEarned },
        lastActiveAt: new Date(),
      },
    });

    // Check for new badge unlocks
    const newlyUnlockedBadges = await runBadgeEvaluation(userId, 'practice');

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      mastery,
      xpEarned,
      weakSubtopics,
      newlyUnlockedBadges,
    });
  } catch (error) {
    console.error('Error submitting practice mode attempt:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit attempt' },
      { status: 500 }
    );
  }
}
