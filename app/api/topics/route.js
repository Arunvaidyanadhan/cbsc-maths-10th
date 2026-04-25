import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { getCache, setCache } from '../../../lib/cache';
import { rateLimit } from '../../../lib/rateLimiter.js';
import { sanitizeId } from '../../../lib/sanitize.js';

export const revalidate = 3600; // 1 hour

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
    const chapterId = searchParams.get('chapterId');
    const refresh = searchParams.get('refresh') === 'true';
    
    // Sanitize input
    const sanitizedChapterId = sanitizeId(chapterId);
    
    if (!sanitizedChapterId) {
      return NextResponse.json({ error: 'chapterId is required' }, { status: 400 });
    }
    
    const cacheKey = `topics_chapter_${sanitizedChapterId}`;
    
    // Check cache first (unless refresh=true)
    if (!refresh) {
      const cached = getCache(cacheKey);
      if (cached) {
        return NextResponse.json(cached);
      }
    }
    
    // Fetch from database
    const topics = await prisma.topic.findMany({
      where: { chapterId: sanitizedChapterId, isActive: true },
      orderBy: { order: 'asc' },
    });
    
    const response = { topics };
    
    // Cache for 1 hour
    setCache(cacheKey, response, 3600);
    
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
