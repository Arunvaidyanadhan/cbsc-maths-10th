import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { getRequestUserId } from '../../../lib/auth.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get('topicId');
    const level = searchParams.get('level');
    const userId = await getRequestUserId(request, { allowQuery: true });
    
    if (!topicId || !level) {
      return NextResponse.json({ error: 'topicId and level are required' }, { status: 400 });
    }
    
    // Get topic and chapter info for premium check
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: { chapter: true }
    });
    
    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }
    
    // Premium check
    if (level !== 'pass') {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      
      // First 2 chapters are free for all levels
      const isFreeChapter = topic.chapter.order <= 2;
      
      // Check if user needs premium
      if (!isFreeChapter && (!user || !user.isPremium)) {
        return NextResponse.json({ error: 'premium_required', message: 'Upgrade to unlock this level' }, { status: 403 });
      }
    }
    
    // Fetch active questions and shuffle in JS
    const questions = await prisma.question.findMany({
      where: { topicId, level, isActive: true },
    });
    
    // Shuffle and take 10
    const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, 10);
    
    return NextResponse.json({ questions: shuffled });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
