import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  // If no token, redirect to login only for protected routes
  if (!token) {
    if (['/dashboard', '/api/tasks', '/profile', '/tasks', '/history'].some(route => request.nextUrl.pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    return NextResponse.next();
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );

    // If user is already authenticated and tries to access /auth/login, redirect to /dashboard
    if (request.nextUrl.pathname === '/auth/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}

export const config = {
  matcher: ['/dashboard', '/api/tasks', '/profile', '/tasks', '/history', '/auth/login'],
};
