import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    const topics = await prisma.topic.findMany({
      include: { chapter: { select: { name: true } } },
      orderBy: [{ chapter: { order: 'asc' } }, { order: 'asc' }],
    });
    return NextResponse.json(topics);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { chapterId, name, slug, order, level, emoji, label, range, questionCount, locked, isActive } = body;

    if (!chapterId || !name || !slug || !order || !level || !emoji || !label || !range || !questionCount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const topic = await prisma.topic.create({
      data: {
        id: randomUUID(),
        chapterId,
        name,
        slug,
        order,
        level,
        emoji,
        label,
        range,
        questionCount,
        locked: locked || false,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(topic);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
