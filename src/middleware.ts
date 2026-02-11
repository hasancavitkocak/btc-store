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
  
  return response;
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)']
};
