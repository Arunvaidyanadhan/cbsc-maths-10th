import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { chapterId, name, slug, order, level, emoji, label, range, questionCount, locked, isActive } = body;

    const topic = await prisma.topic.update({
      where: { id },
      data: {
        ...(chapterId && { chapterId }),
        ...(name && { name }),
        ...(slug && { slug }),
        ...(order !== undefined && { order }),
        ...(level && { level }),
        ...(emoji && { emoji }),
        ...(label && { label }),
        ...(range && { range }),
        ...(questionCount !== undefined && { questionCount }),
        ...(locked !== undefined && { locked }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(topic);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Check if topic has questions
    const questionCount = await prisma.question.count({ where: { topicId: id } });
    if (questionCount > 0) {
      return NextResponse.json({ error: 'Cannot delete topic with questions' }, { status: 400 });
    }

    await prisma.topic.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
