'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Phone, Mail, MapPin } from 'lucide-react';
import Container from './Container';
import { useStore } from '../store/useStore';
import { useEffect } from 'react';

export default function Footer() {
  const t = useTranslations();
  const locale = useLocale();
  const { siteConfiguration, isLoadingSiteConfiguration, fetchSiteConfiguration } = useStore();

  useEffect(() => {
    fetchSiteConfiguration();
  }, [fetchSiteConfiguration]);

  // Footer menülerini al
  const footerMenus = siteConfiguration?.footerMenus || [];

  // Menü adını locale'e göre al
  const getMenuName = (menu: any) => {
    return menu.name?.[locale] || menu.name?.tr || menu.name?.en || '';
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <Container>
        <div className="py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="mb-4 bg-white/10 backdrop-blur-sm rounded-xl p-3 inline-block">
              {isLoadingSiteConfiguration ? (
                <div className="h-12 w-32 bg-gray-700 rounded animate-pulse"></div>
              ) : siteConfiguration?.footerLogo?.absolutePath ? (
                <img 
                  src={siteConfiguration.footerLogo.absolutePath} 
                  alt="Logo" 
                  className="h-12 w-auto"
                />
              ) : (
                <img 
                  src="/ChatGPT_Image_11_Sub_2026_09_47_39.png" 
                  alt="BTC Store" 
                  className="h-12 w-auto"
                />
              )}
            </div>
            <p className="text-gray-400 mb-4">
              {t('footer.description')}
            </p>
          </div>

          <div>
            {isLoadingSiteConfiguration ? (
              <div>
                <div className="h-6 w-32 bg-gray-700 rounded mb-4 animate-pulse"></div>
                <div className="flex flex-col gap-2">
                  <div className="h-5 w-40 bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-5 w-36 bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-5 w-44 bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
            ) : footerMenus.length > 0 ? (
              <>
                <h4 className="text-white font-semibold mb-4">{t('footer.quickLinks')}</h4>
                <nav className="flex flex-col gap-2">
                  {footerMenus.map((menu: any) => (
                    <Link
                      key={menu.code}
                      href={menu.url || '#'}
                      className="hover:text-white transition-colors"
                    >
                      {getMenuName(menu)}
                    </Link>
                  ))}
                </nav>
              </>
            ) : (
              <div>
                <h4 className="text-white font-semibold mb-4">{t('footer.quickLinks')}</h4>
                <p className="text-gray-500 text-sm">{t('footer.noMenuFound')}</p>
              </div>
            )}
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">{t('footer.contact')}</h4>
            {isLoadingSiteConfiguration ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-5 w-36 bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-5 w-40 bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 bg-gray-700 rounded animate-pulse mt-1"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-full bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-5 w-3/4 bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {siteConfiguration?.footerPhone && (
                  <a 
                    href={`tel:${siteConfiguration.footerPhone}`} 
                    className="flex items-center gap-2 hover:text-white transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    {siteConfiguration.footerPhone}
                  </a>
                )}
                {siteConfiguration?.footerEmail && (
                  <a 
                    href={`mailto:${siteConfiguration.footerEmail}`} 
                    className="flex items-center gap-2 hover:text-white transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    {siteConfiguration.footerEmail}
                  </a>
                )}
                {siteConfiguration?.footerAddress && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                    <span>{siteConfiguration.footerAddress}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-800 py-6 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} BTC Store. {t('footer.allRightsReserved')}.</p>
        </div>
      </Container>
    </footer>
  );
}
