import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get('chapterId');
    
    if (!chapterId) {
      return NextResponse.json({ error: 'chapterId is required' }, { status: 400 });
    }
    
    const topics = await prisma.topic.findMany({
      where: { chapterId, isActive: true },
      orderBy: { order: 'asc' },
    });
    
    return NextResponse.json({ topics });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
