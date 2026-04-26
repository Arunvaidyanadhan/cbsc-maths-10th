import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { getRequestUserId } from '../../../lib/auth.js';
import { rateLimit } from '../../../lib/rateLimiter.js';
import { sanitizeId, sanitizeLevel, sanitizeNumber, sanitizeObjectArray } from '../../../lib/sanitize.js';
import { analyzeWeakAreas } from '../../../lib/engine/weakAreaEngine.js';
import { predictScoreRange } from '../../../lib/engine/predictionEngine.js';
import { generateRecommendations } from '../../../lib/engine/recommendationEngine.js';
import { getDynamicMessage } from '../../../lib/engine/messageEngine.js';

export async function POST(request) {
  // Rate limiting: 30 requests per minute
  const ip = request.headers.get('x-forwarded-for') ||
              request.headers.get('x-real-ip') ||
              'unknown';

  if (!rateLimit(ip, 30, 60000)) {
    return NextResponse.json({
      error: 'Too many requests. Please try again later.'
    }, { status: 429 });
  }

  try {
    const result = await processAttempt(request);

    // Optional: Generate dynamic message (safe fallback)
    let dynamicMessage = null;
    try {
      dynamicMessage = await getDynamicMessage({
        userId: result.userId,
        score: result.mastery,
        trend: result.prediction?.trend,
        confidence: result.prediction?.confidence,
        weakAreas: result.weakAreas
      });
    } catch {
      dynamicMessage = "Keep practicing consistently.";
    }

    // Minimal response - decision engine output only
    return NextResponse.json({
      success: true,
      mastery: result.mastery,
      weakAreas: result.weakAreas,
      prediction: result.prediction,
      recommendations: result.recommendations,
      dynamicMessage
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Process attempt - optimized lightweight version
 * Minimal DB operations for Vercel/Neon free tier
 * @param {Request} request - HTTP request
 * @returns {Object} Decision engine output
 */
async function processAttempt(request) {
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
    throw new Error('userId, topicId, and chapterId are required');
  }

  if (sanitizedTotal === 0) {
    throw new Error('Total questions cannot be zero');
  }

  // Compute mastery
  const mastery = Math.round((sanitizedScore / sanitizedTotal) * 100);

  // Prepare answers for analysis and storage
  const validAnswers = sanitizedAnswers.filter(a =>
    a &&
    typeof a.selectedIndex === 'number' &&
    typeof a.correctIndex === 'number' &&
    typeof a.isCorrect === 'boolean'
  );

  if (validAnswers.length === 0) {
    throw new Error('No valid answers provided');
  }

  const wrongAnswers = validAnswers.filter(a => !a.isCorrect);

  // Execute minimal transaction: attempt + progress + mistakes only
  const [attempt, topicProgress] = await prisma.$transaction([
    // Create attempt (no xpEarned, no weakSubtopics, no include)
    prisma.attempt.create({
      data: {
        userId,
        topicId: sanitizedTopicId,
        chapterId: sanitizedChapterId,
        level: sanitizedLevel,
        score: sanitizedScore,
        total: sanitizedTotal,
        mastery,
        timeTakenSecs: sanitizedTime,
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
    }),

    // Update topic progress
    prisma.topicProgress.upsert({
      where: { userId_topicId: { userId, topicId: sanitizedTopicId } },
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
    }),
  ]);

  // Track mistakes in parallel (outside transaction for speed)
  const mistakePromises = wrongAnswers
    .filter(answer => answer.subtopicTag)
    .map(answer =>
      prisma.mistake.upsert({
        where: {
          userId_topicId_subtopicTag: {
            userId,
            topicId: sanitizedTopicId,
            subtopicTag: answer.subtopicTag,
          }
        },
        update: { wrongCount: { increment: 1 } },
        create: {
          userId,
          topicId: sanitizedTopicId,
          subtopicTag: answer.subtopicTag,
          wrongCount: 1,
        },
      })
    );

  // Fetch minimal data for engines in parallel with mistake updates
  const [recentAttempts, mistakes, topicProgressAll] = await Promise.all([
    // Last 5 attempts - only mastery needed
    prisma.attempt.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      take: 5,
      select: { mastery: true }
    }),

    // All user mistakes - minimal fields
    prisma.mistake.findMany({
      where: { userId },
      select: { subtopicTag: true, wrongCount: true, topicId: true }
    }),

    // Topic progress for recommendations
    prisma.topicProgress.findMany({
      where: { userId },
      select: { topicId: true, mastery: true }
    }),

    // Fire-and-forget mistake updates
    ...mistakePromises
  ]);

  // Call decision engines
  const weakAreas = analyzeWeakAreas({
    currentAnswers: validAnswers,
    mistakes,
    recentAttempts
  });

  const prediction = predictScoreRange(recentAttempts, sanitizedTotal);

  const recommendations = generateRecommendations({
    weakAreas,
    topicProgress: topicProgressAll,
    recentAttempts
  });

  return {
    success: true,
    userId,
    mastery,
    weakAreas,
    prediction,
    recommendations
  };
}
