import { cookies } from 'next/headers';
import prisma from './prisma.js';

export const AUTH_COOKIE = 'rithamio_session';

export async function getSessionUserId() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE)?.value ?? null;
}

export async function getRequestUserId(request, options = {}) {
  const sessionUserId = await getSessionUserId();
  if (sessionUserId) return sessionUserId;

  if (options.allowHeader) {
    const headerUserId = request.headers.get('x-user-id');
    if (headerUserId) return headerUserId;
  }

  if (options.allowQuery) {
    const { searchParams } = new URL(request.url);
    const queryUserId = searchParams.get('userId');
    if (queryUserId) return queryUserId;
  }

  return null;
}

export async function getSessionUser(select) {
  const userId = await getSessionUserId();
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    ...(select ? { select } : {}),
  });
}

export async function requireSessionUser(select) {
  const user = await getSessionUser(select);
  if (!user) {
    return null;
  }
  return user;
}

export async function setSessionCookie(userId) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, userId, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}
