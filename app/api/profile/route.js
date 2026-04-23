import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma.js';
import { getBadgesWithProgress } from '../../../lib/badgeEngine.js';
import { getRequestUserId } from '../../../lib/auth.js';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const userId = await getRequestUserId(request, { allowHeader: true });

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user basic info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        xp: true,
        streak: true,
        longestStreak: true,
        dailyGoal: true,
        lastActiveAt: true,
        isPremium: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    // Debug logging to check user data
    console.log('Profile user data:', { userId, userName: user.name, userEmail: user.email });

    // Calculate consistency score from daily stats
    const dailyStats = await prisma.dailyStats.findUnique({
      where: { userId }
    });

    let consistencyScore = 0;
    if (dailyStats) {
      // Simple consistency calculation based on streak and recent activity
      const streakWeight = Math.min(dailyStats.streak * 10, 50); // Max 50 points from streak
      const todayActivity = dailyStats.todayGoalHit ? 30 : 0; // 30 points if today's goal hit
      const xpWeight = Math.min(user.xp / 20, 20); // Max 20 points from XP (1 point per 20 XP)
      consistencyScore = Math.min(streakWeight + todayActivity + xpWeight, 100);
    }

    // Get badges with enhanced progress information
    const badges = await getBadgesWithProgress(userId);

    return NextResponse.json({
      name: user.name || user.email?.split('@')[0] || 'Student',
      email: user.email || '',
      xp: user.xp,
      streak: user.streak,
      longestStreak: user.longestStreak,
      dailyGoal: user.dailyGoal,
      isPremium: user.isPremium,
      lastActiveAt: user.lastActiveAt,
      consistencyScore,
      badges
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
