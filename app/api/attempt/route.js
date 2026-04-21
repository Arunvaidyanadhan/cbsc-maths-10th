import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, topicId, chapterId, level, score, total, answers, timeTakenSecs } = body;
    
    if (!userId || !topicId || !chapterId) {
      return NextResponse.json({ error: 'userId, topicId, and chapterId are required' }, { status: 400 });
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
    
    // Save attempt with answers
    const attempt = await prisma.attempt.create({
      data: {
        userId,
        topicId,
        chapterId,
        level,
        score,
        total,
        mastery,
        xpEarned,
        timeTakenSecs,
        weakSubtopics,
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
    
    // Update or create daily stats
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

    const dailyStats = await prisma.dailyStats.upsert({
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
    
    // Update topic progress
    await prisma.topicProgress.upsert({
      where: { 
        userId_topicId: { userId, topicId }
      },
      update: {
        mastery,
        attempts: { increment: 1 },
        bestScore: { set: Math.max(score) },
        lastDoneAt: new Date(),
      },
      create: {
        userId,
        topicId,
        bestScore: score,
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
              topicId,
              subtopicTag: answer.subtopicTag,
            }
          },
          update: {
            wrongCount: { increment: 1 },
          },
          create: {
            userId,
            topicId,
            subtopicTag: answer.subtopicTag,
            wrongCount: 1,
          },
        });
      }
    }
    
    // Update chapter progress
    const chapterProgress = await prisma.chapterProgress.findUnique({
      where: { 
        userId_chapterId: { userId, chapterId }
      },
    });
    
    const completedTopics = chapterProgress?.completedTopicIds || [];
    if (!completedTopics.includes(topicId)) {
      await prisma.chapterProgress.upsert({
        where: { 
          userId_chapterId: { userId, chapterId }
        },
        update: {
          completedTopicIds: { push: topicId },
          lastPractisedAt: new Date(),
        },
        create: {
          userId,
          chapterId,
          completedTopicIds: [topicId],
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
    
    return NextResponse.json({ 
      success: true, 
      attemptId: attempt.id,
      mastery,
      xpEarned,
      weakSubtopics,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
