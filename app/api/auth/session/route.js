import { NextResponse } from 'next/server';
import { getSessionUser } from '../../../../lib/auth.js';

export async function GET() {
  try {
    const user = await getSessionUser({
      id: true,
      email: true,
      name: true,
      isPremium: true,
      offeredPrice: true,
    });

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user,
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
