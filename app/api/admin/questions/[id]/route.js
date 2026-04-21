import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { chapterId, topicId, level, text, option1, option2, option3, option4, correctIndex, explanation, subtopicTag, difficulty, isActive } = body;

    const question = await prisma.question.update({
      where: { id },
      data: {
        ...(chapterId && { chapterId }),
        ...(topicId && { topicId }),
        ...(level && { level }),
        ...(text && { text }),
        ...(option1 && { option1 }),
        ...(option2 && { option2 }),
        ...(option3 && { option3 }),
        ...(option4 && { option4 }),
        ...(correctIndex !== undefined && { correctIndex }),
        ...(explanation && { explanation }),
        ...(subtopicTag && { subtopicTag }),
        ...(difficulty !== undefined && { difficulty }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(question);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Soft delete
    await prisma.question.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
