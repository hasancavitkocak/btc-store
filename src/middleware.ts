import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n/request';

export default createMiddleware({
  locales,
  defaultLocale: 'tr',
  localePrefix: 'as-needed'
});

export const config = {
  matcher: ['/', '/(tr|en|de|fr|es|ar)/:path*', '/((?!_next|_vercel|.*\\..*).*)']
};
