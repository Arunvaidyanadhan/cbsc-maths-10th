import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { randomUUID } from 'crypto';

export async function POST(request) {
  try {
    const questions = await request.json();

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'Invalid input: expected array of questions' }, { status: 400 });
    }

    // Validate all questions
    for (const q of questions) {
      if (!q.topicId || !q.chapterId || !q.level || !q.text || !q.option1 || !q.option2 || !q.option3 || !q.option4 || !q.correctIndex || !q.explanation || !q.subtopicTag || !q.difficulty === undefined) {
        return NextResponse.json({ error: 'Missing required fields in one or more questions' }, { status: 400 });
      }
    }

    // Create all questions in a transaction
    const createdQuestions = await prisma.$transaction(
      questions.map((q) =>
        prisma.question.create({
          data: {
            id: randomUUID(),
            chapterId: q.chapterId,
            topicId: q.topicId,
            level: q.level,
            text: q.text,
            option1: q.option1,
            option2: q.option2,
            option3: q.option3,
            option4: q.option4,
            correctIndex: q.correctIndex,
            explanation: q.explanation,
            subtopicTag: q.subtopicTag,
            difficulty: q.difficulty,
            isActive: q.isActive !== undefined ? q.isActive : true,
          },
        })
      )
    );

    return NextResponse.json({ success: true, count: createdQuestions.length });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
