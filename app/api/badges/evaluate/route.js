import { NextResponse } from 'next/server';
import { runBadgeEvaluation } from '../../../../lib/badgeEngine.js';
import { getRequestUserId } from '../../../../lib/auth.js';

export async function POST(request) {
  try {
    const userId = await getRequestUserId(request, { allowHeader: true });
    const { triggerType } = await request.json();

    if (!userId || !triggerType) {
      return NextResponse.json(
        { error: 'User ID and trigger type required' },
        { status: 400 }
      );
    }

    // Validate trigger type
    const validTriggers = ['practice', 'login', 'profile'];
    if (!validTriggers.includes(triggerType)) {
      return NextResponse.json(
        { error: 'Invalid trigger type' },
        { status: 400 }
      );
    }

    // Run badge evaluation
    const newlyUnlockedBadges = await runBadgeEvaluation(userId, triggerType);

    return NextResponse.json({
      success: true,
      newlyUnlockedBadges,
      count: newlyUnlockedBadges.length
    });
  } catch (error) {
    console.error('Error evaluating badges:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate badges' },
      { status: 500 }
    );
  }
}
