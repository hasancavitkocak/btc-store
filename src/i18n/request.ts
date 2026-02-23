import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export const locales = ['tr', 'en', 'de', 'fr', 'es', 'it'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async () => {
  // Cookie'den locale oku
  const cookieStore = cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE');
  let locale = localeCookie?.value || 'tr';
  
  // Geçerli bir locale değilse, default kullan
  if (!locales.includes(locale as Locale)) {
    locale = 'tr';
  }

  return {
    locale,
    messages: (await import(`./locales/${locale}.json`)).default
  };
});
