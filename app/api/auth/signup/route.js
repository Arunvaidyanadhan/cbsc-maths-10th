import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma.js';
import bcrypt from 'bcryptjs';
import { setSessionCookie } from '../../../../lib/auth.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'name, email, and password are required' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 6);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
      },
    });

    await setSessionCookie(user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
