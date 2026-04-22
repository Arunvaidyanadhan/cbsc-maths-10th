import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const learnerSession = request.cookies.get('rithamio_session');

  const publicLearnerRoutes = new Set([
    '/',
    '/signup',
    '/login',
    '/forgot-password',
  ]);
  
  // Protect all /admin/* routes except /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminSession = request.cookies.get('admin_session');
    
    if (!adminSession || adminSession.value !== process.env.ADMIN_SECRET) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/admin') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  if (publicLearnerRoutes.has(pathname)) {
    if (learnerSession && (pathname === '/login' || pathname === '/signup')) {
      return NextResponse.redirect(new URL('/profile', request.url));
    }
    return NextResponse.next();
  }

  if (!pathname.startsWith('/api') && !pathname.startsWith('/admin') && !learnerSession) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!.*\\.).*)'],
};
