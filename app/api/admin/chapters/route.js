import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    const chapters = await prisma.chapter.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(chapters);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, slug, icon, order, totalTopics, recommended, isActive } = body;

    if (!name || !slug || !icon || !order || !totalTopics) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const chapter = await prisma.chapter.create({
      data: {
        id: randomUUID(),
        name,
        slug,
        icon,
        order,
        totalTopics,
        recommended: recommended || false,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(chapter);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
