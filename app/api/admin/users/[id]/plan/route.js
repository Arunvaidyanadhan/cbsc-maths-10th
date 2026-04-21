import { NextResponse } from 'next/server';
import prisma from '../../../../../../lib/prisma';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { plan } = body;

    const planExpiresAt = plan === 'pro' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null;
    const isPremium = plan === 'pro';

    const user = await prisma.user.update({
      where: { id },
      data: {
        plan,
        planExpiresAt,
        isPremium,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
