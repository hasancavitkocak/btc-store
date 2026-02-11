import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ChevronLeft, ChevronRight, Check, Phone, Mail, MessageCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import Container from '../components/Container';
import Button from '../components/Button';

export default function ProductDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { products, categories } = useStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const product = products.find((p) => p.id === id);
  const category = product ? categories.find((c) => c.id === product.categoryId) : null;

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Container>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Product not found</h1>
            <Link to="/products">
              <Button>Back to Products</Button>
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  const productImages = product.images || [product.image];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <Container>
          <div className="py-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">{t('menu.products')}</span>
            </button>
          </div>
        </Container>
      </div>

      {/* Main Product Section */}
      <div className="py-8">
        <Container noPadding>
          <div className="flex min-h-[80vh]">
            {/* Left Side - Large Product Image (75% width) */}
            <div className="w-3/4 pr-8 pl-8">
              {/* Main Large Image */}
              <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden group h-[70vh] mb-6">
                <img
                  src={productImages[currentImageIndex]}
                  alt={t(product.nameKey)}
                  className="w-full h-full object-cover"
                />

                {/* Image Navigation */}
                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-gray-800 p-4 rounded-full shadow-xl transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                    >
                      <ChevronLeft className="w-8 h-8" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-gray-800 p-4 rounded-full shadow-xl transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                    >
                      <ChevronRight className="w-8 h-8" />
                    </button>

                    {/* Carousel Indicators */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
                      {productImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-3 h-3 rounded-full transition-all ${
                            index === currentImageIndex
                              ? 'bg-white scale-125 shadow-lg'
                              : 'bg-white/60 hover:bg-white/80'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnail Images */}
              {productImages.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {productImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-32 h-24 rounded-xl overflow-hidden border-3 transition-all hover:scale-105 ${
                        index === currentImageIndex
                          ? 'border-blue-600 shadow-xl ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${t(product.nameKey)} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Side - Contact Section (25% width) */}
            <div className="w-1/4 pr-8">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
                {/* Product Info */}
                {category && (
                  <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                    {t(category.nameKey)}
                  </span>
                )}
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                  {t(product.nameKey)}
                </h1>
                <p className="text-gray-600 mb-6 text-sm">
                  {t(product.shortDescKey)}
                </p>

                {/* Contact Section */}
                <div className="border-t pt-6">
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MessageCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Ürün Hakkında İletişime Geçin
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Bu ürün hakkında detaylı bilgi almak için bizimle iletişime geçin.
                    </p>
                  </div>

                  <div className="mt-6">
                    <Link to={`/products/${product.id}/contact`}>
                      <Button
                        fullWidth
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all font-bold"
                      >
                        İletişime Geç
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Product Features - Full Width Below */}
      <div className="py-8 bg-white">
        <Container>
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Ürün Özellikleri
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {product.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-4 p-6 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-700 font-medium text-lg">{t(feature)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Product Content */}
          {product.htmlContent && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="prose prose-lg max-w-none text-gray-700">
                <div dangerouslySetInnerHTML={{ __html: product.htmlContent }} />
              </div>
            </div>
          )}
        </Container>
      </div>
    </div>
  );
}