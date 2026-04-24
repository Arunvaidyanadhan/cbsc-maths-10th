import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { getRequestUserId } from '../../../lib/auth.js';

// Helper function to get next subtopic in sequence
function getNextSubtopic(currentSubtopicTag) {
  // Define subtopic sequences for each chapter (can be moved to DB later)
  const subtopicSequences = {
    'real-numbers': [
      'euclid-lemma',
      'prime-factorisation', 
      'irrational-proof',
      'decimal-expansion',
      'euclid-algorithm-hcf',
      'hcf-lcm-relation',
      'irrational-properties'
    ],
    'polynomials': [
      'polynomial-basics',
      'zeros-roots',
      'division-algorithm',
      'remainder-theorem',
      'factorization'
    ],
    // Add more chapters as needed
  };

  // Find which chapter this subtopic belongs to
  for (const [chapter, subtopics] of Object.entries(subtopicSequences)) {
    const currentIndex = subtopics.indexOf(currentSubtopicTag);
    if (currentIndex !== -1) {
      // Return next subtopic if available, otherwise move to next chapter
      if (currentIndex < subtopics.length - 1) {
        return subtopics[currentIndex + 1];
      }
      // Move to next chapter's first subtopic
      const chapters = Object.keys(subtopicSequences);
      const currentChapterIndex = chapters.indexOf(chapter);
      if (currentChapterIndex < chapters.length - 1) {
        const nextChapter = chapters[currentChapterIndex + 1];
        return subtopicSequences[nextChapter][0];
      }
      // Last subtopic - return current to repeat
      return currentSubtopicTag;
    }
  }

  // Default: return current subtopic
  return currentSubtopicTag;
}

// Personalization logic
function getPersonalizationStrategy(experienceLevel, preferences, accuracy) {
  let nextLevel = 'average';
  let message = "We'll continue with a balanced approach for your next practice.";

  // Determine next level based on experience
  switch (experienceLevel) {
    case 'hard':
      nextLevel = 'pass';
      message = "We'll adjust your next practice to focus on basics and strengthen your understanding.";
      break;
    case 'medium':
      nextLevel = 'average';
      message = "We'll maintain a balanced mix of questions to help you improve steadily.";
      break;
    case 'easy':
      nextLevel = 'expert';
      message = "Great! We'll provide more challenging problems to help you excel.";
      break;
  }

  // Adjust message based on preferences
  if (preferences.includes('More basic questions')) {
    nextLevel = 'pass';
    message = "We'll include more fundamental questions to build your foundation.";
  } else if (preferences.includes('More challenging problems')) {
    nextLevel = 'expert';
    message = "We'll provide more advanced problems to challenge your understanding.";
  } else if (preferences.includes('Better explanations')) {
    message += " We'll also provide detailed explanations for each concept.";
  }

  // Adjust based on performance
  if (accuracy < 60) {
    message = "We noticed you struggled with this topic. We'll provide more practice with basic concepts.";
    nextLevel = 'pass';
  } else if (accuracy > 80) {
    message = "You're doing great! Ready for more challenging problems?";
    nextLevel = 'expert';
  }

  return { nextLevel, message };
}

export async function POST(request) {
  try {
    const userId = await getRequestUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const {
      subtopicTag,
      experienceLevel,
      preferences,
      accuracy,
      totalQuestions
    } = body;

    // Validate required fields
    if (!subtopicTag || !experienceLevel || !preferences || accuracy === undefined || !totalQuestions) {
      return NextResponse.json({ 
        error: 'Missing required fields: subtopicTag, experienceLevel, preferences, accuracy, totalQuestions' 
      }, { status: 400 });
    }

    // Validate experience level
    if (!['easy', 'medium', 'hard'].includes(experienceLevel)) {
      return NextResponse.json({ 
        error: 'Invalid experience level. Must be: easy, medium, or hard' 
      }, { status: 400 });
    }

    // Get personalization strategy
    const { nextLevel, message } = getPersonalizationStrategy(experienceLevel, preferences, accuracy);

    // Determine next subtopic
    let nextSubtopic = getNextSubtopic(subtopicTag);
    
    // If user wants more practice in this topic, keep same subtopic
    if (preferences.includes('More practice in this topic')) {
      nextSubtopic = subtopicTag;
    }

    // Store feedback in database
    const feedback = await prisma.subtopicFeedback.create({
      data: {
        userId,
        subtopicTag,
        experienceLevel,
        preferences,
        accuracy,
        totalQuestions,
        nextLevel,
        nextSubtopic,
        message
      }
    });

    // Update user's personalization preferences in user table (optional)
    await prisma.user.update({
      where: { id: userId },
      data: {
        // Store latest preferences for future reference
        lastExperienceLevel: experienceLevel,
        lastPreferences: preferences,
        lastAccuracy: accuracy
      }
    });

    return NextResponse.json({
      nextSubtopic,
      nextLevel,
      message,
      feedbackId: feedback.id
    });

  } catch (error) {
    console.error('Error in subtopic-feedback API:', error);
    
    // Handle unique constraint violation (duplicate feedback)
    if (error.code === '23505') {
      return NextResponse.json({ 
        error: 'You have already provided feedback for this subtopic recently' 
      }, { status: 409 });
    }

    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// GET endpoint to retrieve user's feedback history
export async function GET(request) {
  try {
    const userId = await getRequestUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 10;
    const offset = parseInt(searchParams.get('offset')) || 0;

    const feedbackHistory = await prisma.subtopicFeedback.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        subtopicTag: true,
        experienceLevel: true,
        preferences: true,
        accuracy: true,
        totalQuestions: true,
        nextLevel: true,
        nextSubtopic: true,
        message: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      feedback: feedbackHistory,
      total: await prisma.subtopicFeedback.count({ where: { userId } })
    });

  } catch (error) {
    console.error('Error fetching feedback history:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
