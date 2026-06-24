import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = ['/', '/landing', '/auth/signin', '/auth/signup', '/auth/verify-email'];

// Candidate-only routes
const candidateRoutes = ['/dashboard', '/onboarding'];

// Recruiter-only route prefix
const recruiterRoutePrefix = '/recruiter';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public routes and Next.js internals
  if (
    publicRoutes.some((route) => pathname === route || pathname.startsWith(route + '/')) ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next')
  ) {
    return NextResponse.next();
  }

  // Role-based protection is handled client-side (tokens are in localStorage).
  // Middleware can't read localStorage, so we let client-side guards handle
  // candidate vs recruiter redirects. We only block unauthenticated access
  // to protected routes via client-side checks in each page.
  //
  // If you add cookie-based auth in the future, enforce here:
  //   const token = request.cookies.get('access_token')?.value;
  //   if (!token) return NextResponse.redirect(new URL('/auth/signin', request.url));

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
