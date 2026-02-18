'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useStore } from '../store/useStore';
import Link from 'next/link';

export default function TopBanner() {
  const locale = useLocale();
  const { siteConfiguration, isLoadingSiteConfiguration, fetchSiteConfiguration } = useStore();

  useEffect(() => {
    fetchSiteConfiguration();
  }, [fetchSiteConfiguration]);

  // Debug
  console.log('TopBanner - isLoading:', isLoadingSiteConfiguration);
  console.log('TopBanner - siteConfiguration:', siteConfiguration);
  console.log('TopBanner - topBannerEnabled:', siteConfiguration?.topBannerEnabled);
  console.log('TopBanner - topBannerText:', siteConfiguration?.topBannerText);

  // Loading skeleton
  if (isLoadingSiteConfiguration) {
    return (
      <div className="w-full py-2 px-4 bg-gray-200 animate-pulse">
        <div className="max-w-4xl mx-auto">
          <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Banner aktif değilse veya metin yoksa gösterme
  if (!siteConfiguration?.topBannerEnabled) {
    console.log('TopBanner - Banner aktif değil veya siteConfiguration yok');
    return null;
  }

  // Locale'e göre banner metnini seç
  let bannerText = '';
  if (siteConfiguration.topBannerText) {
    switch (locale) {
      case 'tr':
        bannerText = siteConfiguration.topBannerText.tr || '';
        break;
      case 'en':
        bannerText = siteConfiguration.topBannerText.en || '';
        break;
      case 'de':
        bannerText = siteConfiguration.topBannerText.de || '';
        break;
      case 'fr':
        bannerText = siteConfiguration.topBannerText.fr || '';
        break;
      case 'es':
        bannerText = siteConfiguration.topBannerText.es || '';
        break;
      case 'it':
        bannerText = siteConfiguration.topBannerText.it || '';
        break;
      default:
        bannerText = siteConfiguration.topBannerText.tr || siteConfiguration.topBannerText.en || '';
    }
  }

  if (!bannerText) {
    console.log('TopBanner - Banner metni yok');
    return null;
  }

  console.log('TopBanner - Banner gösteriliyor:', bannerText);

  const bgColor = siteConfiguration.topBannerBgColor || '#1e40af';
  const textColor = siteConfiguration.topBannerTextColor || '#ffffff';
  const link = siteConfiguration.topBannerLink;

  const content = (
    <div 
      style={{ 
        backgroundColor: bgColor,
        color: textColor
      }}
      className="w-full py-2 px-4 text-center text-sm font-medium transition-colors"
    >
      {bannerText}
    </div>
  );

  // Eğer link varsa, tıklanabilir yap
  if (link) {
    return (
      <Link href={link} className="block hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
