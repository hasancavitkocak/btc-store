import { NextRequest, NextResponse } from 'next/server';
import { decodeJwt } from './lib/jwt';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // JWT'den language bilgisini al
  const accessToken = request.cookies.get('accessToken')?.value;
  let userLanguage = 'tr'; // default
  
  if (accessToken) {
    try {
      const decoded = decodeJwt(accessToken);
      if (decoded?.language) {
        userLanguage = decoded.language;
      }
    } catch (error) {
      console.error('JWT decode error in middleware:', error);
    }
  }
  
  // Eğer NEXT_LOCALE cookie'si yoksa veya JWT'den farklıysa, güncelle
  const currentLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (!currentLocale || (accessToken && currentLocale !== userLanguage)) {
    response.cookies.set('NEXT_LOCALE', userLanguage, {
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
    if (!accessToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  return response;
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)']
};
