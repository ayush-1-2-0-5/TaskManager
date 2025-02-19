import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  if (!token) {
    if (['/dashboard', '/api/tasks', '/profile', '/tasks','/tasks/create','/profile/change-password', '/history'].some(route => request.nextUrl.pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    return NextResponse.next();
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );
    if (request.nextUrl.pathname === '/auth/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}

export const config = {
  matcher: ['/dashboard', '/api/tasks', '/profile','/tasks/create','/profile/change-password', '/tasks', '/history', '/auth/login'],
};
