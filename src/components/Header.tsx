'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Phone, Menu, X, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import Container from './Container';
import Button from './Button';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const { header, menuItems, siteConfiguration, isLoadingMenus, isLoadingSiteConfiguration, fetchPublicMenus, fetchSiteConfiguration } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);

  // Menüleri ve konfigürasyonu fetch et
  useEffect(() => {
    fetchPublicMenus();
    fetchSiteConfiguration();
  }, [fetchPublicMenus, fetchSiteConfiguration]);

  // Backend'den gelen menüleri hiyerarşik yapıya çevir
  const rootMenus = menuItems
    .filter(menu => menu.isRoot && menu.active)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  // Menü adını locale'e göre al
  const getMenuName = (menu: any) => {
    return menu.name?.[locale] || menu.name?.tr || menu.name?.en || '';
  };

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <Container>
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center">
                {isLoadingSiteConfiguration ? (
                  <div className="h-12 w-32 bg-gray-200 rounded animate-pulse"></div>
                ) : siteConfiguration?.headerLogo?.absolutePath ? (
                  <img 
                    src={siteConfiguration.headerLogo.absolutePath} 
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
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              {isLoadingMenus ? (
                // Loading skeleton - daha gerçekçi
                <>
                  <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-5 w-28 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
                </>
              ) : (
                rootMenus.map((menu) => {
                  const menuName = getMenuName(menu);
                  const hasSubMenus = menu.subMenuLinkItems && menu.subMenuLinkItems.length > 0;
                  
                  if (hasSubMenus) {
                    return (
                      <div
                        key={menu.code}
                        className="relative"
                        onMouseEnter={() => setProductsDropdownOpen(true)}
                        onMouseLeave={() => setProductsDropdownOpen(false)}
                      >
                        <Link
                          href={menu.url || '#'}
                          className="text-gray-700 hover:text-blue-900 transition-colors font-medium flex items-center gap-1"
                        >
                          {menuName}
                          <ChevronDown className={`w-4 h-4 transition-transform ${productsDropdownOpen ? 'rotate-180' : ''}`} />
                        </Link>
                        <div className={`absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 transition-all duration-200 ${
                          productsDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                        }`}>
                          {menu.subMenuLinkItems
                            ?.filter(sub => sub.active)
                            .sort((a, b) => a.displayOrder - b.displayOrder)
                            .map((subMenu) => (
                              <Link
                                key={subMenu.code}
                                href={subMenu.url || '#'}
                                className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-900 transition-colors"
                                onClick={() => setProductsDropdownOpen(false)}
                              >
                                {getMenuName(subMenu)}
                              </Link>
                            ))}
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <Link
                      key={menu.code}
                      href={menu.url || '#'}
                      className="text-gray-700 hover:text-blue-900 transition-colors font-medium"
                    >
                      {menuName}
                    </Link>
                  );
                })
              )}
            </nav>

            <div className="flex items-center gap-4">
              <LanguageSwitcher />

              {isLoadingSiteConfiguration ? (
                <div className="hidden lg:flex items-center gap-2">
                  <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ) : (
                siteConfiguration?.showContactPhone && siteConfiguration?.contactPhone && (
                  <div className="hidden lg:flex items-center gap-2 text-gray-700">
                    <Phone className="w-4 h-4" />
                    <a href={`tel:${siteConfiguration.contactPhone}`} className="hover:text-blue-900 transition-colors font-medium">
                      {siteConfiguration.contactPhone}
                    </a>
                  </div>
                )
              )}

              <Link href="/call-request" className="hidden sm:block">
                <Button size="sm" className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800">
                  <Phone className="w-4 h-4" />
                  {t('callRequest.title')}
                </Button>
              </Link>

              <button
                className="md:hidden text-gray-700"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <nav className="md:hidden pb-4 flex flex-col gap-3">
              {isLoadingMenus ? (
                // Mobile skeleton
                <>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </>
              ) : (
                <>
                  {rootMenus.map((menu) => {
                    const menuName = getMenuName(menu);
                    const hasSubMenus = menu.subMenuLinkItems && menu.subMenuLinkItems.length > 0;
                    
                    if (hasSubMenus) {
                      return (
                        <div key={menu.code}>
                          <button
                            onClick={() => setProductsDropdownOpen(!productsDropdownOpen)}
                            className="text-gray-700 hover:text-blue-900 transition-colors font-medium py-2 w-full text-left flex items-center justify-between"
                          >
                            {menuName}
                            <ChevronDown className={`w-4 h-4 transition-transform ${productsDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>
                          <div className={`pl-4 flex flex-col gap-2 mt-2 transition-all duration-200 ${
                            productsDropdownOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                          }`}>
                            {menu.subMenuLinkItems
                              ?.filter(sub => sub.active)
                              .sort((a, b) => a.displayOrder - b.displayOrder)
                              .map((subMenu) => (
                                <Link
                                  key={subMenu.code}
                                  href={subMenu.url || '#'}
                                  className="text-gray-600 hover:text-blue-900 transition-colors py-2"
                                  onClick={() => {
                                    setMobileMenuOpen(false);
                                    setProductsDropdownOpen(false);
                                  }}
                                >
                                  {getMenuName(subMenu)}
                                </Link>
                              ))}
                          </div>
                        </div>
                      );
                    }
                    
                    return (
                      <Link
                        key={menu.code}
                        href={menu.url || '#'}
                        className="text-gray-700 hover:text-blue-900 transition-colors font-medium py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {menuName}
                      </Link>
                    );
                  })}
                  <Link href="/call-request" onClick={() => setMobileMenuOpen(false)}>
                    <Button size="sm" fullWidth className="flex items-center justify-center gap-2">
                      <Phone className="w-4 h-4" />
                      {t('callRequest.title')}
                    </Button>
                  </Link>
                </>
              )}
            </nav>
          )}
        </Container>
      </header>
    </>
  );
}
