import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma.js';
import { getRequestUserId } from '../../../../lib/auth.js';

export async function POST(request) {
  try {
    const userId = await getRequestUserId(request, { allowHeader: true });
    const { badgeId } = await request.json();

    if (!userId || !badgeId) {
      return NextResponse.json(
        { error: 'User ID and badge ID required' },
        { status: 400 }
      );
    }

    // Check if user has unlocked this badge
    const userBadge = await prisma.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId,
          badgeId
        }
      },
      include: {
        badge: true
      }
    });

    if (!userBadge) {
      return NextResponse.json(
        { error: 'Badge not unlocked yet' },
        { status: 404 }
      );
    }

    // Check if already revealed
    if (userBadge.revealedAt) {
      return NextResponse.json(
        { error: 'Badge already revealed' },
        { status: 400 }
      );
    }

    // Update revealedAt timestamp
    const updatedUserBadge = await prisma.userBadge.update({
      where: {
        userId_badgeId: {
          userId,
          badgeId
        }
      },
      data: {
        revealedAt: new Date()
      },
      include: {
        badge: true
      }
    });

    return NextResponse.json({
      success: true,
      badge: updatedUserBadge.badge,
      revealedAt: updatedUserBadge.revealedAt
    });
  } catch (error) {
    console.error('Error revealing badge:', error);
    return NextResponse.json(
      { error: 'Failed to reveal badge' },
      { status: 500 }
    );
  }
}
