import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { getRequestUserId } from '../../../lib/auth.js';
import { getCache, setCache } from '../../../lib/cache';
import { rateLimit } from '../../../lib/rateLimiter.js';
import { sanitizeId, sanitizeLevel } from '../../../lib/sanitize.js';

export const revalidate = 1800; // 30 minutes

export async function GET(request) {
  // Rate limiting: 60 requests per minute for general APIs
  const ip = request.headers.get('x-forwarded-for') || 
              request.headers.get('x-real-ip') || 
              'unknown';
  
  if (!rateLimit(ip, 60, 60000)) {
    return NextResponse.json({ 
      error: 'Too many requests. Please try again later.' 
    }, { status: 429 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get('topicId');
    const level = searchParams.get('level');
    const refresh = searchParams.get('refresh') === 'true';
    const userId = await getRequestUserId(request, { allowQuery: true });
    
    // Sanitize inputs
    const sanitizedTopicId = sanitizeId(topicId);
    const sanitizedLevel = sanitizeLevel(level);
    
    if (!sanitizedTopicId || !sanitizedLevel) {
      return NextResponse.json({ error: 'topicId and level are required' }, { status: 400 });
    }
    
    // Get topic and chapter info for premium check
    const topic = await prisma.topic.findUnique({
      where: { id: sanitizedTopicId },
      include: { chapter: true }
    });
    
    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }
    
    // Premium check (must happen before caching check)
    if (sanitizedLevel !== 'pass') {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      
      // First 2 chapters are free for all levels
      const isFreeChapter = topic.chapter.order <= 2;
      
      // Check if user needs premium
      if (!isFreeChapter && (!user || !user.isPremium)) {
        return NextResponse.json({ error: 'premium_required', message: 'Upgrade to unlock this level' }, { status: 403 });
      }
    }
    
    const cacheKey = `questions_${sanitizedTopicId}_${sanitizedLevel}`;
    
    // Check cache for raw questions (unless refresh=true)
    let questions;
    if (!refresh) {
      const cached = getCache(cacheKey);
      if (cached) {
        questions = cached;
      }
    }
    
    // Fetch from database if not cached
    if (!questions) {
      questions = await prisma.question.findMany({
        where: { topicId: sanitizedTopicId, level: sanitizedLevel, isActive: true },
      });
      
      // Cache raw questions for 30 minutes
      setCache(cacheKey, questions, 1800);
    }
    
    // Shuffle and take 10 (always shuffle for randomness)
    const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, 10);
    
    return NextResponse.json({ questions: shuffled });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
