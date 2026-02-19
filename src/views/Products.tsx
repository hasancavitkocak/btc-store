'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Container from '../components/Container';
import Section from '../components/Section';
import Card from '../components/Card';
import Button from '../components/Button';
import { productService, ProductFilterData } from '../services/product.service';

export default function Products() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const [filterData, setFilterData] = useState<ProductFilterData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams?.get('category') || ''
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts(selectedCategory, currentPage);
  }, [selectedCategory, currentPage]);

  const loadProducts = async (categoryCode: string, page: number) => {
    try {
      setLoading(true);
      const response = await productService.getPublicProducts(categoryCode || undefined, page, 20);
      console.log('API Response:', response);
      
      // Ensure we have valid data structure
      if (response) {
        setFilterData({
          products: response.products || [],
          availableCategories: response.availableCategories || [],
          selectedCategory: response.selectedCategory,
          totalProducts: response.totalProducts || 0,
          pageNumber: response.pageNumber || 1,
          pageSize: response.pageSize || 20,
          totalPages: response.totalPages || 0
        });
      }
    } catch (error) {
      console.error('Error loading products:', error);
      // Set empty data on error
      setFilterData({
        products: [],
        availableCategories: [],
        totalProducts: 0,
        pageNumber: 1,
        pageSize: 20,
        totalPages: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryCode: string) => {
    setSelectedCategory(categoryCode);
    setCurrentPage(1); // Reset to first page when category changes
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (!categoryCode) {
        url.searchParams.delete('category');
      } else {
        url.searchParams.set('category', categoryCode);
      }
      url.searchParams.delete('page'); // Reset page in URL
      window.history.pushState({}, '', url);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    if (!filterData || filterData.totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(filterData.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-4 py-2 rounded-lg ${
          currentPage === 1
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
        }`}
      >
        ‹
      </button>
    );

    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-50 shadow-md"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="dots1" className="px-2">
            ...
          </span>
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 rounded-lg ${
            currentPage === i
              ? 'bg-blue-900 text-white shadow-xl'
              : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
          }`}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (endPage < filterData.totalPages) {
      if (endPage < filterData.totalPages - 1) {
        pages.push(
          <span key="dots2" className="px-2">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={filterData.totalPages}
          onClick={() => handlePageChange(filterData.totalPages)}
          className="px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-50 shadow-md"
        >
          {filterData.totalPages}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === filterData.totalPages}
        className={`px-4 py-2 rounded-lg ${
          currentPage === filterData.totalPages
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
        }`}
      >
        ›
      </button>
    );

    return (
      <div className="flex justify-center items-center gap-2 mt-12">
        {pages}
      </div>
    );
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
            {filterData.selectedCategory?.name?.tr || (!selectedCategory ? t('menu.products') : '')}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
            {filterData.selectedCategory?.description?.tr || (!selectedCategory ? t('home.categories.subtitle') : '')}
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
                {category.name?.tr || category.code}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filterData.products && filterData.products.map((product) => (
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
                    {product.name?.tr || ''}
                  </h3>
                  <p className="text-gray-600 mb-6 text-lg flex-grow">
                    {product.shortDescription?.tr || ''}
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

        {renderPagination()}
      </Container>
    </Section>
  );
}
