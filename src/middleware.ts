import { NextRequest, NextResponse } from 'next/server';
import { decodeJwt } from './lib/jwt';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  const accessToken = request.cookies.get('accessToken')?.value;
  const currentLocale = request.cookies.get('NEXT_LOCALE')?.value;
  
  // Eğer NEXT_LOCALE cookie'si yoksa, tarayıcı dilini algıla ve ayarla
  if (!currentLocale) {
    const browserLanguage = request.headers.get('accept-language');
    let detectedLanguage = 'tr'; // default
    
    if (browserLanguage) {
      // İlk dil tercihini al (örn: "en-US,en;q=0.9,tr;q=0.8" -> "en")
      const primaryLanguage = browserLanguage.split(',')[0].split('-')[0].toLowerCase();
      const supportedLanguages = ['tr', 'en', 'de', 'fr', 'es', 'it'];
      
      if (supportedLanguages.includes(primaryLanguage)) {
        detectedLanguage = primaryLanguage;
      }
    }
    
    response.cookies.set('NEXT_LOCALE', detectedLanguage, {
      path: '/',
      maxAge: 31536000, // 1 yıl
      sameSite: 'lax'
    });
  }
  
  // Admin kullanıcısı için: Token varsa, JWT'den language bilgisini al ve cookie'yi güncelle
  if (accessToken && request.nextUrl.pathname.startsWith('/admin')) {
    try {
      const decoded = decodeJwt(accessToken);
      if (decoded?.language && currentLocale !== decoded.language) {
        response.cookies.set('NEXT_LOCALE', decoded.language, {
          path: '/',
          maxAge: 31536000,
          sameSite: 'lax'
        });
      }
    } catch (error) {
      console.error('JWT decode error in middleware:', error);
    }
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
