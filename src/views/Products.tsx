'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Container from '../components/Container';
import Section from '../components/Section';
import Card from '../components/Card';
import Button from '../components/Button';
import { productService, ProductFilterData } from '../services/product.service';
import { getLocalizedText, SupportedLocale } from '../lib/i18n-utils';

export default function Products() {
  const t = useTranslations();
  const locale = useLocale() as SupportedLocale;
  const searchParams = useSearchParams();
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [filterData, setFilterData] = useState<ProductFilterData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams?.get('category') || ''
  );
  const [currentPage, setCurrentPage] = useState<number>(
    parseInt(searchParams?.get('page') || '1')
  );
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);
  const lastLoadedPage = useRef(0);
  const loadingRef = useRef(false);

  useEffect(() => {
    // First mount only
    if (!mountedRef.current && !loadingRef.current) {
      mountedRef.current = true;
      loadingRef.current = true;
      const urlPage = parseInt(searchParams?.get('page') || '1');
      lastLoadedPage.current = urlPage;
      loadProducts(selectedCategory, urlPage, true).finally(() => {
        loadingRef.current = false;
      });
    }
  }, []);

  useEffect(() => {
    // Category changed - reset to page 1
    if (mountedRef.current && !loadingRef.current) {
      loadingRef.current = true;
      setCurrentPage(1);
      setAllProducts([]);
      setHasMore(true);
      lastLoadedPage.current = 1;
      loadProducts(selectedCategory, 1, true).finally(() => {
        loadingRef.current = false;
      });
    }
  }, [selectedCategory]);

  useEffect(() => {
    // Page changed by scroll - load more
    if (mountedRef.current && currentPage > lastLoadedPage.current && !loadingRef.current) {
      loadingRef.current = true;
      lastLoadedPage.current = currentPage;
      loadProducts(selectedCategory, currentPage, false).finally(() => {
        loadingRef.current = false;
      });
    }
  }, [currentPage]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !loadingMore && hasMore) {
          setCurrentPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [loading, loadingMore, hasMore]);

  const loadProducts = async (categoryCode: string, page: number, reset: boolean) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const response = await productService.getPublicProducts(categoryCode || undefined, page, 20);
      
      if (response) {
        const newProducts = response.products || [];
        
        if (reset) {
          setAllProducts(newProducts);
        } else {
          setAllProducts((prev) => [...prev, ...newProducts]);
        }
        
        setFilterData({
          products: newProducts,
          availableCategories: response.availableCategories || [],
          selectedCategory: response.selectedCategory,
          totalProducts: response.totalProducts || 0,
          pageNumber: response.pageNumber || 1,
          pageSize: response.pageSize || 20,
          totalPages: response.totalPages || 0
        });
        
        setHasMore(page < (response.totalPages || 0));
        
        // Update URL
        updateURL(categoryCode, page);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const updateURL = (categoryCode: string, page: number) => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (!categoryCode) {
        url.searchParams.delete('category');
      } else {
        url.searchParams.set('category', categoryCode);
      }
      if (page > 1) {
        url.searchParams.set('page', page.toString());
      } else {
        url.searchParams.delete('page');
      }
      window.history.pushState({}, '', url);
    }
  };

  const handleCategoryChange = (categoryCode: string) => {
    setSelectedCategory(categoryCode);
  };

  if (loading) {
    return (
      <Section>
        <Container>
          <div className="text-center py-20">
            <p className="text-gray-500 text-xl">Loading...</p>
          </div>
        </Container>
      </Section>
    );
  }

  if (!filterData) {
    return (
      <Section>
        <Container>
          <div className="text-center py-20">
            <p className="text-gray-500 text-xl">No data available</p>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section>
      <Container>
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 mb-6">
            {getLocalizedText(filterData.selectedCategory?.name, locale) || (!selectedCategory ? t('menu.products') : '')}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
            {getLocalizedText(filterData.selectedCategory?.description, locale) || (!selectedCategory ? t('home.categories.subtitle') : '')}
          </p>
          <p className="text-sm text-gray-500 mt-4">
            {filterData.totalProducts} {filterData.selectedCategory ? 'ürün bulundu' : t('common.products')}
          </p>
        </div>

        {filterData.availableCategories && filterData.availableCategories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <button
              onClick={() => handleCategoryChange('')}
              className={`px-8 py-3 rounded-2xl font-semibold text-lg transition-all duration-300 ${
                !selectedCategory
                  ? 'bg-blue-900 text-white shadow-xl scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg'
              }`}
            >
              {t('common.all')}
            </button>
            {filterData.availableCategories.map((category) => (
              <button
                key={category.code}
                onClick={() => handleCategoryChange(category.code)}
                className={`px-8 py-3 rounded-2xl font-semibold text-lg transition-all duration-300 ${
                  selectedCategory === category.code
                    ? 'bg-blue-900 text-white shadow-xl scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg'
                }`}
              >
                {getLocalizedText(category.name, locale) || category.code}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allProducts.map((product) => (
            <Link key={product.code} href={`/products/${product.code}`}>
              <Card hover className="group overflow-hidden h-full flex flex-col">
                <div className="aspect-video overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center relative">
                  {product.mainImage?.absolutePath ? (
                    <img
                      src={product.mainImage.absolutePath}
                      alt={product.name?.tr || ''}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <svg
                      className="w-32 h-32 text-blue-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={0.8}
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </div>
                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-800 transition-colors">
                    {getLocalizedText(product.name, locale)}
                  </h3>
                  <p className="text-gray-600 mb-6 text-lg flex-grow">
                    {getLocalizedText(product.shortDescription, locale)}
                  </p>
                  
                  {/* Features */}
                  {product.features && product.features.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {product.features.slice(0, 3).map((feature: string, index: number) => (
                        <span
                          key={index}
                          className="text-sm bg-blue-900 text-white px-4 py-2 rounded-full font-medium"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <Button variant="outline" fullWidth className="group-hover:bg-blue-900 group-hover:text-white group-hover:border-blue-900 transition-all">
                    {t('product.viewDetails')}
                  </Button>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {(!filterData.products || filterData.products.length === 0) && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-xl">No products found in this category.</p>
          </div>
        )}

        {/* Loading indicator for infinite scroll */}
        {loadingMore && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
            <p className="text-gray-500 mt-2">Daha fazla ürün yükleniyor...</p>
          </div>
        )}

        {/* Observer target for infinite scroll */}
        <div ref={observerTarget} className="h-4" />
      </Container>
    </Section>
  );
}
