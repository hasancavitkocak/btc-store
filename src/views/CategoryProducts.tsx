'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useStore } from '../store/useStore';
import Container from '../components/Container';
import Section from '../components/Section';
import Card from '../components/Card';
import Button from '../components/Button';

interface CategoryProductsProps {
  menuPath?: string; // Menünün path'i (örn: /sap-services)
  title?: string; // Sayfa başlığı
  subtitle?: string; // Sayfa alt başlığı
}

export default function CategoryProducts({ menuPath, title, subtitle }: CategoryProductsProps) {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const { products, categories, header } = useStore();
  const categoryParam = searchParams?.get('category');

  // Bu menüye bağlı kategorileri al - path'e göre bul
  const menuItem = menuPath ? header.menuItems.find(m => m.path === menuPath) : null;
  
  const menuCategories = useMemo(() => {
    if (!menuItem || menuItem.type !== 'category-dropdown') {
      // Eğer menü yoksa veya kategori dropdown değilse, tüm kategorileri göster
      return categories;
    }
    
    // Eğer categoryIds boş veya tanımsızsa, tüm kategorileri göster
    if (!menuItem.categoryIds || menuItem.categoryIds.length === 0) {
      return categories;
    }
    
    // Sadece bu menüye bağlı kategorileri göster
    return categories.filter(c => menuItem.categoryIds!.includes(c.id));
  }, [menuItem, categories]);

  // Kategori parametresini validate et
  const isValidCategory = categoryParam === 'all' || !categoryParam || menuCategories.some(c => c.id === categoryParam);

  const [selectedCategory, setSelectedCategory] = useState<string>(
    isValidCategory ? (categoryParam || 'all') : 'all'
  );

  const activeProducts = products.filter((p) => p.active);
  const activeCategories = menuCategories.sort((a, b) => a.order - b.order);

  // Seçili kategorinin bilgilerini al
  const selectedCategoryInfo = selectedCategory !== 'all'
    ? categories.find(c => c.id === selectedCategory)
    : null;

  const filteredProducts = useMemo(() => {
    let filtered = activeProducts;

    // Önce menüye bağlı kategorilere göre filtrele
    if (menuItem && menuItem.type === 'category-dropdown') {
      const categoryIds = menuItem.categoryIds && menuItem.categoryIds.length > 0
        ? menuItem.categoryIds
        : categories.map(c => c.id);
      filtered = filtered.filter(p => categoryIds.includes(p.categoryId));
    }

    // Sonra seçili kategoriye göre filtrele
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.categoryId === selectedCategory);
    }

    return filtered;
  }, [activeProducts, selectedCategory, menuItem, categories]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (categoryId === 'all') {
        url.searchParams.delete('category');
      } else {
        url.searchParams.set('category', categoryId);
      }
      window.history.pushState({}, '', url);
    }
  };

  const pageTitle = title || (menuItem ? t(menuItem.labelKey) : t('menu.products'));
  const pageSubtitle = subtitle || t('home.categories.subtitle');

  return (
    <Section>
      <Container>
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 mb-6">
            {pageTitle}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
            {pageSubtitle}
          </p>
        </div>

        {activeCategories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`px-8 py-3 rounded-2xl font-semibold text-lg transition-all duration-300 ${
                selectedCategory === 'all'
                  ? 'bg-blue-900 text-white shadow-xl scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg'
              }`}
            >
              {t('common.all')}
            </button>
            {activeCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-8 py-3 rounded-2xl font-semibold text-lg transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-blue-900 text-white shadow-xl scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg'
                }`}
              >
                {t(category.nameKey)}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`}>
              <Card hover className="group overflow-hidden h-full flex flex-col">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={product.image}
                    alt={t(product.nameKey)}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-800 transition-colors">
                    {t(product.nameKey)}
                  </h3>
                  <p className="text-gray-600 mb-6 text-lg flex-grow">
                    {t(product.shortDescKey)}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {product.features.slice(0, 3).map((feature, index) => (
                      <span
                        key={index}
                        className="text-sm bg-blue-900 text-white px-4 py-2 rounded-full font-medium"
                      >
                        {t(feature)}
                      </span>
                    ))}
                  </div>
                  <Button variant="outline" fullWidth className="group-hover:bg-blue-900 group-hover:text-white group-hover:border-blue-900 transition-all">
                    {t('product.viewDetails')}
                  </Button>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-6">📦</div>
              {selectedCategoryInfo ? (
                <>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {t(selectedCategoryInfo.nameKey)} Kategorisinde Ürün Bulunamadı
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Bu kategoride henüz ürün eklenmemiş. Diğer kategorilere göz atabilirsiniz.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Ürün Bulunamadı
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Bu kategoride henüz ürün bulunmuyor.
                  </p>
                </>
              )}
              {activeCategories.length > 0 && (
                <Button onClick={() => handleCategoryChange('all')} className="bg-blue-900 hover:bg-blue-800">
                  Tüm Ürünleri Görüntüle
                </Button>
              )}
            </div>
          </div>
        )}
      </Container>
    </Section>
  );
}
