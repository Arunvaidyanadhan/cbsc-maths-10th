import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, slug, icon, order, totalTopics, recommended, isActive } = body;

    const chapter = await prisma.chapter.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(icon && { icon }),
        ...(order !== undefined && { order }),
        ...(totalTopics !== undefined && { totalTopics }),
        ...(recommended !== undefined && { recommended }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(chapter);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Check if chapter has topics
    const topicCount = await prisma.topic.count({ where: { chapterId: id } });
    if (topicCount > 0) {
      return NextResponse.json({ error: 'Cannot delete chapter with topics' }, { status: 400 });
    }

    await prisma.chapter.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
