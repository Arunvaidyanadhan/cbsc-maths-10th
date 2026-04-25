import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma.js';
import bcrypt from 'bcryptjs';
import { setSessionCookie } from '../../../../lib/auth.js';
import { rateLimit } from '../../../../lib/rateLimiter.js';
import { sanitizeEmail, sanitizeString } from '../../../../lib/sanitize.js';

export async function POST(request) {
  // Rate limiting: 5 requests per minute for auth
  const ip = request.headers.get('x-forwarded-for') || 
              request.headers.get('x-real-ip') || 
              'unknown';
  
  if (!rateLimit(ip, 5, 60000)) {
    return NextResponse.json({ 
      error: 'Too many requests. Please try again later.' 
    }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { email, password } = body;

    // Sanitize inputs
    const sanitizedEmail = sanitizeEmail(email);
    const sanitizedPassword = sanitizeString(password, 100);

    if (!sanitizedEmail || !sanitizedPassword) {
      return NextResponse.json({ error: 'email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(sanitizedPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

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
