'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, ChevronLeft, ChevronRight, Check, MessageCircle } from 'lucide-react';
import Container from '../components/Container';
import Button from '../components/Button';
import { productService, ProductData, CategoryData } from '../services/product.service';

export default function ProductDetail() {
  const params = useParams();
  const code = params?.id as string;
  const t = useTranslations();
  const router = useRouter();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (code) {
      loadProduct(code);
    }
  }, [code]);

  const loadProduct = async (productCode: string) => {
    try {
      setLoading(true);
      const data = await productService.getPublicProductByCode(productCode);
      setProduct(data);
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Container>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </Container>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Container>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Product not found</h1>
            <Link href="/products">
              <Button>Back to Products</Button>
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  const productImages = product.images && product.images.length > 0 
    ? product.images.map(img => img.absolutePath).filter(Boolean)
    : product.mainImage?.absolutePath 
    ? [product.mainImage.absolutePath]
    : [];

  const nextImage = () => {
    if (productImages.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
    }
  };

  const prevImage = () => {
    if (productImages.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <Container>
          <div className="py-4">
            <button
              onClick={() => router.back()}
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
        <div className="px-4 lg:px-8 max-w-[1600px] mx-auto">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 relative">
            {/* Left Side - Large Product Image */}
            <div className="w-full lg:w-[70%] order-1 lg:order-1 relative z-0">
              {/* Main Large Image */}
              <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-xl overflow-hidden group aspect-video lg:aspect-auto lg:h-[75vh] mb-6 flex items-center justify-center">
                {productImages.length > 0 ? (
                  <img
                    src={productImages[currentImageIndex]}
                    alt={product.name?.tr || ''}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    className="w-48 h-48 text-blue-300"
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

                {/* Image Navigation */}
                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-gray-800 p-2 lg:p-4 rounded-full shadow-xl transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                    >
                      <ChevronLeft className="w-5 h-5 lg:w-8 lg:h-8" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-gray-800 p-2 lg:p-4 rounded-full shadow-xl transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                    >
                      <ChevronRight className="w-5 h-5 lg:w-8 lg:h-8" />
                    </button>

                    {/* Carousel Indicators */}
                    <div className="absolute bottom-4 lg:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 lg:gap-3">
                      {productImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full transition-all ${
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
                <div className="flex gap-3 lg:gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {productImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-16 lg:w-32 lg:h-24 rounded-lg lg:rounded-xl overflow-hidden border-2 lg:border-3 transition-all hover:scale-105 ${
                        index === currentImageIndex
                          ? 'border-blue-600 shadow-xl ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name?.tr} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Side - Contact Section */}
            <div className="w-full lg:w-[30%] order-2 lg:order-2 relative z-0">
              <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8 relative lg:sticky lg:top-8">
                {/* Product Info */}
                {product.categories && product.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.categories.map((category: CategoryData, index: number) => (
                      <span 
                        key={index}
                        className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {category.name?.tr}
                      </span>
                    ))}
                  </div>
                )}
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                  {product.name?.tr}
                </h1>
                <p className="text-gray-600 mb-6">
                  {product.shortDescription?.tr}
                </p>

                {/* Contact Section */}
                <div className="border-t pt-6">
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MessageCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {t('product.contactForProduct')}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {t('product.contactDescription')}
                    </p>
                  </div>

                  <div className="mt-6">
                    <Link href={`/products/${product.code}/contact`}>
                      <Button
                        fullWidth
                        size="lg"
                        className="bg-blue-900 hover:bg-blue-800 text-white shadow-lg hover:shadow-xl transition-all font-bold"
                      >
                        {t('common.contactUs')}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Features & Description - Full Width Below */}
      <div className="py-8 lg:py-12 bg-white">
        <Container>
          {/* Features */}
          {product.features && product.features.length > 0 && (
            <div className="mb-12">
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6 text-center">
                {t('product.features')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {product.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 lg:gap-4 p-4 lg:p-6 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-gray-700 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Product Description */}
          {product.description?.tr && (
            <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ürün Açıklaması</h3>
              <div 
                className="prose prose-sm lg:prose-lg max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: product.description.tr }}
              />
            </div>
          )}
        </Container>
      </div>
    </div>
  );
}
