import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { randomUUID } from 'crypto';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get('chapterId');
    const topicId = searchParams.get('topicId');
    const level = searchParams.get('level');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where = {};
    if (chapterId) where.chapterId = chapterId;
    if (topicId) where.topicId = topicId;
    if (level) where.level = level;
    if (search) where.text = { contains: search, mode: 'insensitive' };

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        include: { topic: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.question.count({ where }),
    ]);

    return NextResponse.json({ questions, total, page, limit });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { chapterId, topicId, level, text, option1, option2, option3, option4, correctIndex, explanation, subtopicTag, difficulty, isActive } = body;

    if (!chapterId || !topicId || !level || !text || !option1 || !option2 || !option3 || !option4 || !correctIndex || !explanation || !subtopicTag || !difficulty) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const question = await prisma.question.create({
      data: {
        id: randomUUID(),
        chapterId,
        topicId,
        level,
        text,
        option1,
        option2,
        option3,
        option4,
        correctIndex,
        explanation,
        subtopicTag,
        difficulty,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(question);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
