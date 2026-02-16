'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Phone, Menu, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../store/useStore';
import Container from './Container';
import Button from './Button';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const t = useTranslations();
  const { header, categories } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<{ [key: string]: boolean }>({});

  // Menü öğelerini sıraya göre sırala
  const sortedMenuItems = [...(header.menuItems || [])].sort((a, b) => a.order - b.order);

  const toggleDropdown = (itemId: string, isOpen: boolean) => {
    setOpenDropdowns(prev => ({ ...prev, [itemId]: isOpen }));
  };

  // Menü öğesi için kategorileri al
  const getCategoriesForMenuItem = (item: any) => {
    if (item.type === 'category-dropdown') {
      // Eğer categoryIds boş veya tanımsızsa, tüm kategorileri göster
      if (!item.categoryIds || item.categoryIds.length === 0) {
        return categories;
      }
      // Belirtilen kategorileri filtrele
      return categories.filter(cat => item.categoryIds.includes(cat.id));
    }
    return [];
  };

  const renderMenuItem = (item: any, isMobile: boolean = false) => {
    if (!item?.path) return null;

    const isDropdownOpen = openDropdowns[item.id] || false;
    const itemCategories = getCategoriesForMenuItem(item);
    const hasDropdown = item.type === 'category-dropdown' && itemCategories.length > 0;

    if (hasDropdown) {
      return (
        <div
          key={item.id}
          className={isMobile ? '' : 'relative'}
          onMouseEnter={() => !isMobile && toggleDropdown(item.id, true)}
          onMouseLeave={() => !isMobile && toggleDropdown(item.id, false)}
        >
          {isMobile ? (
            <>
              <button
                onClick={() => toggleDropdown(item.id, !isDropdownOpen)}
                className="text-gray-700 hover:text-blue-900 transition-colors font-medium py-2 w-full text-left flex items-center justify-between"
              >
                {t(item.labelKey)}
                <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              <div className={`pl-4 flex flex-col gap-2 mt-2 transition-all duration-200 ${
                isDropdownOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
              }`}>
                {itemCategories.map((category) => (
                  <Link
                    key={category.id}
                    href={`${item.path}?category=${category.id}`}
                    className="text-gray-600 hover:text-blue-900 transition-colors py-2"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      toggleDropdown(item.id, false);
                    }}
                  >
                    {t(category.nameKey)}
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <>
              <Link
                href={item.path}
                className="text-gray-700 hover:text-blue-900 transition-colors font-medium flex items-center gap-1"
              >
                {t(item.labelKey)}
                <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </Link>
              <div className={`absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 transition-all duration-200 ${
                isDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
              }`}>
                {itemCategories.map((category) => (
                  <Link
                    key={category.id}
                    href={`${item.path}?category=${category.id}`}
                    className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-900 transition-colors"
                    onClick={() => toggleDropdown(item.id, false)}
                  >
                    {t(category.nameKey)}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.id}
        href={item.path}
        className={`text-gray-700 hover:text-blue-900 transition-colors font-medium ${isMobile ? 'py-2' : ''}`}
        onClick={() => isMobile && setMobileMenuOpen(false)}
      >
        {t(item.labelKey)}
      </Link>
    );
  };

  return (
    <>
      {header.topBanner && (
        <div
          className="text-gray-900 text-center py-2 px-4 text-sm"
          style={{ backgroundColor: header.topBanner.bgColor }}
        >
          {header.topBanner.link ? (
            <Link href={header.topBanner.link} className="hover:underline">
              {t(header.topBanner.textKey)}
            </Link>
          ) : (
            <span>{t(header.topBanner.textKey)}</span>
          )}
        </div>
      )}

      <header className="bg-white shadow-sm sticky top-0 z-40">
        <Container>
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center">
                <img 
                  src="/btc-store-logo.png" 
                  alt="BTC Store" 
                  className="h-12 w-auto"
                />
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              {sortedMenuItems?.map((item) => renderMenuItem(item, false))}
            </nav>

            <div className="flex items-center gap-4">
              <LanguageSwitcher />

              <div className="hidden lg:flex items-center gap-2 text-gray-700">
                <Phone className="w-4 h-4" />
                <a href={`tel:${header.phone}`} className="hover:text-blue-900 transition-colors font-medium">
                  {header.phone}
                </a>
              </div>

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
              {sortedMenuItems?.map((item) => renderMenuItem(item, true))}
              <Link href="/call-request" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" fullWidth className="flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" />
                  {t('callRequest.title')}
                </Button>
              </Link>
            </nav>
          )}
        </Container>
      </header>
    </>
  );
}
