import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET() {
  try {
    const chapters = await prisma.chapter.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    
    return NextResponse.json({ chapters });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
