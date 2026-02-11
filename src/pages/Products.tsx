import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import Container from '../components/Container';
import Section from '../components/Section';
import Card from '../components/Card';
import Button from '../components/Button';

export default function Products() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, categories } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || 'all'
  );

  const activeProducts = products.filter((p) => p.active);
  const activeCategories = categories.sort((a, b) => a.order - b.order);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') {
      return activeProducts;
    }
    return activeProducts.filter((p) => p.categoryId === selectedCategory);
  }, [activeProducts, selectedCategory]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category: categoryId });
    }
  };

  return (
    <Section>
      <Container>
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 mb-6">
            {t('menu.products')}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
            {t('home.categories.subtitle')}
          </p>
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <Link key={product.id} to={`/products/${product.id}`}>
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
            <p className="text-gray-500 text-xl">No products found in this category.</p>
          </div>
        )}
      </Container>
    </Section>
  );
}
