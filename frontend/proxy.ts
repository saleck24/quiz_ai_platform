import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Define public paths that don't need authentication
    const isPublicPath = path === '/login' || path === '/register';

    // Get the token from the cookies
    // In a real app, you would verify the token's validity here
    const token =
  request.cookies.get('access_token')?.value ||
  request.cookies.get('refresh_token')?.value ||
  '';

    if (isPublicPath && token) {
        // If user is already logged in and tries to access login/register, redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.nextUrl));
    }

    if (!isPublicPath && !token) {
        // If user is not logged in and tries to access a protected route, redirect to login
        return NextResponse.redirect(new URL('/login', request.nextUrl));
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        '/dashboard/:path*',
        '/documents/:path*',
        '/quiz/:path*',
        '/share/:path*',
        '/login',
        '/register',
    ],
}
