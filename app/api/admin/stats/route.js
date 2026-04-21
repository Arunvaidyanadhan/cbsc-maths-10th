import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET() {
  try {
    const [totalChapters, totalTopics, totalQuestions, totalUsers, totalAttempts, premiumUsers] = await Promise.all([
      prisma.chapter.count(),
      prisma.topic.count(),
      prisma.question.count(),
      prisma.user.count(),
      prisma.attempt.count(),
      prisma.user.count({ where: { isPremium: true } }),
    ]);

    return NextResponse.json({
      totalChapters,
      totalTopics,
      totalQuestions,
      totalUsers,
      totalAttempts,
      premiumUsers,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
