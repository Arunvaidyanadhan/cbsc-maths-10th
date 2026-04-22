import { NextResponse } from 'next/server';
import { getBadgesWithProgress } from '../../../lib/badgeEngine.js';
import { getRequestUserId } from '../../../lib/auth.js';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const userId = await getRequestUserId(request, { allowHeader: true });

    if (!userId) {
      return NextResponse.json([]); // Return empty array instead of error
    }

    // Get badges with enhanced progress information
    const badges = await getBadgesWithProgress(userId);

    return NextResponse.json(badges);
  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json([]); // Return empty array on error
  }
}
