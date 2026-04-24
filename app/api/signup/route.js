import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { setSessionCookie } from '../../../lib/auth.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'name, email, and password are required' }, { status: 400 });
    }
    
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
      }
    });

    await setSessionCookie(newUser.id);
    
    return NextResponse.json({
      success: true,
      userId: newUser.id,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
