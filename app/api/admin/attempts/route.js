import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where = {};
    if (userId) where.userId = userId;

    const [attempts, total] = await Promise.all([
      prisma.attempt.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          topic: { select: { name: true } },
        },
        orderBy: { completedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.attempt.count({ where }),
    ]);

    return NextResponse.json({ attempts, total, page, limit });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
