import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Check if the request is for a dashboard route
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('token')?.value;

    console.log(`[Middleware] Checking route: ${pathname}`);
    console.log(`[Middleware] Token exists: ${!!token}`);

    if (!token) {
      console.log(`[Middleware] No token found, redirecting to login`);
      return NextResponse.redirect(new URL('/login', request.url));
    }

    console.log(`[Middleware] Token found, allowing access`);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
