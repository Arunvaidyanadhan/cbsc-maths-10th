import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma.js';
import { getRequestUserId } from '../../../lib/auth.js';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const userId = await getRequestUserId(request, { allowHeader: true });
    
    // Get all active practice modes
    const modes = await prisma.practiceMode.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    // If user is authenticated, get additional data
    if (userId) {
      // Get user's practice mode attempts
      const userAttempts = await prisma.practiceModeAttempt.groupBy({
        by: ['practiceModeId'],
        where: { userId },
        _count: { id: true },
        _max: { score: true, total: true },
        orderBy: { _max: { completedAt: 'desc' } },
      });

      // Get user info for premium status
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { isPremium: true },
      });

      // Create a map of practice mode data
      const modeDataMap = {};
      userAttempts.forEach(attempt => {
        modeDataMap[attempt.practiceModeId] = {
          attemptCount: attempt._count.id,
          lastScore: attempt._max.score || 0,
        };
      });

      // Combine data
      const enrichedModes = modes.map(mode => ({
        ...mode,
        attemptCount: modeDataMap[mode.id]?.attemptCount || 0,
        lastScore: modeDataMap[mode.id]?.lastScore || 0,
        isUnlocked: !mode.isPro || user?.isPremium || false,
      }));

      return NextResponse.json(enrichedModes);
    }

    // Return basic modes for unauthenticated users
    const basicModes = modes.map(mode => ({
      ...mode,
      attemptCount: 0,
      lastScore: 0,
      isUnlocked: !mode.isPro,
    }));

    return NextResponse.json(basicModes);
  } catch (error) {
    console.error('Error fetching practice modes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch practice modes' },
      { status: 500 }
    );
  }
}
