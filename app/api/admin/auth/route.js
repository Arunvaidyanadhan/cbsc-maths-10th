import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const body = await request.json();
    const { password } = body;
    
    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }
    
    if (password !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }
    
    // Set httpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set('admin_session', process.env.ADMIN_SECRET, {
      httpOnly: true,
      maxAge: 8 * 60 * 60, // 8 hours
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
