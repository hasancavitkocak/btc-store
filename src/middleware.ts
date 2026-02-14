import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Eğer NEXT_LOCALE cookie'si yoksa, default olarak 'tr' set et
  if (!request.cookies.has('NEXT_LOCALE')) {
    response.cookies.set('NEXT_LOCALE', 'tr', {
      path: '/',
      maxAge: 31536000,
      sameSite: 'lax'
    });
  }

  // Admin route protection
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Login sayfasına izin ver
    if (request.nextUrl.pathname === '/admin/login') {
      return response;
    }

    // Token kontrolü
    const accessToken = request.cookies.get('accessToken');
    
    if (!accessToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  return response;
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)']
};
