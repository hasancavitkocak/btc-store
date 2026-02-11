import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Phone, Menu, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../store/useStore';
import Container from './Container';
import Button from './Button';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const { t } = useTranslation();
  const { header, categories } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);

  return (
    <>
      {header.topBanner && (
        <div
          className="text-white text-center py-2 px-4 text-sm"
          style={{ backgroundColor: header.topBanner.bgColor }}
        >
          {header.topBanner.link ? (
            <Link to={header.topBanner.link} className="hover:underline">
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
              <Link to="/" className="flex items-center">
                <img 
                  src="/ChatGPT_Image_11_Sub_2026_09_47_39.png" 
                  alt="BTC Store" 
                  className="h-12 w-auto"
                />
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              {header.menuItems.map((item) => {
                if (item.path === '/products') {
                  return (
                    <div
                      key={item.id}
                      className="relative"
                      onMouseEnter={() => setProductsDropdownOpen(true)}
                      onMouseLeave={() => setProductsDropdownOpen(false)}
                    >
                      <Link
                        to={item.path}
                        className="text-gray-700 hover:text-blue-900 transition-colors font-medium flex items-center gap-1"
                      >
                        {t(item.labelKey)}
                        <ChevronDown className={`w-4 h-4 transition-transform ${productsDropdownOpen ? 'rotate-180' : ''}`} />
                      </Link>
                      <div className={`absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 transition-all duration-200 ${
                        productsDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                      }`}>
                          {categories.map((category) => (
                            <Link
                              key={category.id}
                              to={`/products?category=${category.id}`}
                              className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-900 transition-colors"
                              onClick={() => setProductsDropdownOpen(false)}
                            >
                              {t(category.nameKey)}
                            </Link>
                          ))}
                      </div>
                    </div>
                  );
                }
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className="text-gray-700 hover:text-blue-900 transition-colors font-medium"
                  >
                    {t(item.labelKey)}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-4">
              <LanguageSwitcher />

              <div className="hidden lg:flex items-center gap-2 text-gray-700">
                <Phone className="w-4 h-4" />
                <a href={`tel:${header.phone}`} className="hover:text-blue-900 transition-colors font-medium">
                  {header.phone}
                </a>
              </div>

              <Link to="/call-request" className="hidden sm:block">
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
              {header.menuItems.map((item) => {
                if (item.path === '/products') {
                  return (
                    <div key={item.id}>
                      <button
                        onClick={() => setProductsDropdownOpen(!productsDropdownOpen)}
                        className="text-gray-700 hover:text-blue-900 transition-colors font-medium py-2 w-full text-left flex items-center justify-between"
                      >
                        {t(item.labelKey)}
                        <ChevronDown className={`w-4 h-4 transition-transform ${productsDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <div className={`pl-4 flex flex-col gap-2 mt-2 transition-all duration-200 ${
                        productsDropdownOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                      }`}>
                          {categories.map((category) => (
                            <Link
                              key={category.id}
                              to={`/products?category=${category.id}`}
                             className="text-gray-600 hover:text-blue-900 transition-colors py-2"
                              onClick={() => {
                                setMobileMenuOpen(false);
                                setProductsDropdownOpen(false);
                              }}
                            >
                              {t(category.nameKey)}
                            </Link>
                          ))}
                      </div>
                    </div>
                  );
                }
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className="text-gray-700 hover:text-blue-900 transition-colors font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t(item.labelKey)}
                  </Link>
                );
              })}
              <Link to="/call-request" onClick={() => setMobileMenuOpen(false)}>
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
