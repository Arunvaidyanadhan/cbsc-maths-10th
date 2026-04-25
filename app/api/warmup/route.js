import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

/**
 * Dynamic cache warm-up endpoint
 * Auto-discovers content and warms up caches without hardcoding
 */
export async function GET() {
  const results = {
    success: true,
    warmed: [],
    errors: []
  };

  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    // Step 1: Warm up chapters (1 hour cache)
    try {
      await fetch(`${baseUrl}/api/chapters`);
      results.warmed.push('chapters');
    } catch (error) {
      results.errors.push({ endpoint: 'chapters', error: error.message });
    }

    // Step 2: Fetch all chapters from DB
    let chapters;
    try {
      chapters = await prisma.chapter.findMany({
        where: { isActive: true },
        select: { id: true, slug: true }
      });
    } catch (error) {
      results.errors.push({ endpoint: 'fetch_chapters', error: error.message });
      return NextResponse.json(results);
    }

    // Step 3: Warm up ALL topics for each chapter (parallel)
    const topicWarmupPromises = chapters.map(async (chapter) => {
      try {
        await fetch(`${baseUrl}/api/topics?chapterId=${chapter.id}`);
        results.warmed.push(`topics_${chapter.id}`);
      } catch (error) {
        results.errors.push({ endpoint: `topics_${chapter.id}`, error: error.message });
      }
    });

    await Promise.all(topicWarmupPromises);

    // Step 4: Warm up questions for first topic in each chapter (parallel)
    const questionWarmupPromises = chapters.map(async (chapter) => {
      try {
        // Get first topic for this chapter
        const topic = await prisma.topic.findFirst({
          where: { 
            chapterId: chapter.id,
            isActive: true 
          },
          select: { id: true, slug: true },
          orderBy: { order: 'asc' }
        });

        if (topic) {
          // Warm up pass level questions (most common)
          await fetch(`${baseUrl}/api/questions?topicId=${topic.id}&level=pass`);
          results.warmed.push(`questions_${topic.id}_pass`);
        }
      } catch (error) {
        results.errors.push({ 
          endpoint: `questions_first_topic_${chapter.id}`, 
          error: error.message 
        });
      }
    });

    await Promise.all(questionWarmupPromises);

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
