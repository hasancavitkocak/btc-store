'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Phone, Mail, MapPin } from 'lucide-react';
import Container from './Container';
import { useStore } from '../store/useStore';

export default function Footer() {
  const t = useTranslations();
  const { header } = useStore();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <Container>
        <div className="py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="mb-4">
              <img 
                src="/btc-store-logo.png" 
                alt="BTC Store" 
                className="h-12 w-auto"
              />
            </div>
            <p className="text-gray-400 mb-4">
              {t('home.categories.subtitle')}
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">{t('menu.products')}</h4>
            <nav className="flex flex-col gap-2">
              {header.menuItems?.map((item) => {
                if (!item?.path) return null;
                return (
                  <Link
                    key={item.id}
                    href={item.path}
                    className="hover:text-white transition-colors"
                  >
                    {t(item.labelKey)}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">{t('menu.contact')}</h4>
            <div className="flex flex-col gap-3">
              <a href={`tel:${header.phone}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="w-4 h-4" />
                {header.phone}
              </a>
              <a href="mailto:info@company.com" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
                info@company.com
              </a>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>Istanbul, Turkey</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 py-6 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} {header.logo}. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
}
