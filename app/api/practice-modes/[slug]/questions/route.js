import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { getRequestUserId } from '../../../../../lib/auth.js';

export async function GET(request, { params }) {
  try {
    const { slug } = params;
    const userId = await getRequestUserId(request, { allowHeader: true });

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get the practice mode
    const practiceMode = await prisma.practiceMode.findUnique({
      where: { slug, isActive: true },
    });

    if (!practiceMode) {
      return NextResponse.json(
        { error: 'Practice mode not found' },
        { status: 404 }
      );
    }

    // Check if user can access this mode
    if (practiceMode.isPro) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { isPremium: true },
      });

      if (!user?.isPremium) {
        return NextResponse.json(
          { error: 'Premium subscription required' },
          { status: 403 }
        );
      }
    }

    // Get questions for this practice mode
    const questionModes = await prisma.questionMode.findMany({
      where: { practiceModeId: practiceMode.id },
      include: {
        question: {
          include: {
            topic: {
              select: {
                name: true,
                chapter: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (questionModes.length === 0) {
      return NextResponse.json({ questions: [] });
    }

    // Transform and shuffle questions
    const questions = questionModes
      .map(qm => ({
        id: qm.question.id,
        text: qm.question.text,
        option1: qm.question.option1,
        option2: qm.question.option2,
        option3: qm.question.option3,
        option4: qm.question.option4,
        correctIndex: qm.question.correctIndex,
        explanation: qm.question.explanation,
        subtopicTag: qm.question.subtopicTag,
        difficulty: qm.question.difficulty,
        topicId: qm.question.topicId,
        chapterId: qm.question.chapterId,
        // Include mode-specific data
        year: qm.year,
        examBoard: qm.examBoard,
        topicName: qm.question.topic.name,
        chapterName: qm.question.topic.chapter.name,
      }))
      .sort(() => Math.random() - 0.5) // Shuffle
      .slice(0, 10); // Take 10 questions

    return NextResponse.json({ 
      questions,
      practiceMode: {
        id: practiceMode.id,
        slug: practiceMode.slug,
        name: practiceMode.name,
        description: practiceMode.description,
        icon: practiceMode.icon,
        color: practiceMode.color,
      }
    });
  } catch (error) {
    console.error('Error fetching practice mode questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}
