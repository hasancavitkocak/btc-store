/**
 * Utility functions for handling multi-language content
 */

export type MultiLangText = {
  tr?: string;
  en?: string;
  de?: string;
  fr?: string;
  es?: string;
  it?: string;
};

export type SupportedLocale = 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it';

/**
 * Get localized text from multi-language object based on current locale
 * Fallback order: requested locale -> Turkish (tr) -> English (en) -> empty string
 */
export function getLocalizedText(
  multiLangText: MultiLangText | undefined | null,
  locale: SupportedLocale = 'tr'
): string {
  if (!multiLangText) return '';
  
  // Try to get the text in the requested locale
  const text = multiLangText[locale];
  if (text) return text;
  
  // Fallback to Turkish
  if (multiLangText.tr) return multiLangText.tr;
  
  // Fallback to English
  if (multiLangText.en) return multiLangText.en;
  
  // Return empty string if nothing found
  return '';
}

/**
 * Get current locale from cookie (client-side)
 */
export function getCurrentLocale(): SupportedLocale {
  if (typeof window === 'undefined') return 'tr';
  
  const cookies = document.cookie.split(';');
  const localeCookie = cookies.find(c => c.trim().startsWith('NEXT_LOCALE='));
  
  if (localeCookie) {
    const locale = localeCookie.split('=')[1].trim() as SupportedLocale;
    if (['tr', 'en', 'de', 'fr', 'es', 'it'].includes(locale)) {
      return locale;
    }
  }
  
  return 'tr';
}
