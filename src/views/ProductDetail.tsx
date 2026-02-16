'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, ChevronLeft, ChevronRight, Check, MessageCircle, FileText, Download } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useAuthStore } from '../store/useAuthStore';
import Container from '../components/Container';
import Button from '../components/Button';

export default function ProductDetail() {
  const params = useParams();
  const id = params?.id as string;
  const t = useTranslations();
  const router = useRouter();
  const { products, categories, documents } = useStore();
  const { isAuthenticated } = useAuthStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const product = products.find((p) => p.id === id);
  const category = product ? categories.find((c) => c.id === product.categoryId) : null;
  
  // Ürüne ait dokümanları filtrele
  const productDocuments = documents.filter(doc => doc.productId === id);

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
              <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden group aspect-video lg:aspect-auto lg:h-[75vh] mb-6">
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
                        alt={`${t(product.nameKey)} ${index + 1}`}
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
                {category && (
                  <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                    {t(category.nameKey)}
                  </span>
                )}
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                  {t(product.nameKey)}
                </h1>
                <p className="text-gray-600 mb-6">
                  {t(product.shortDescKey)}
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
                    <Link href={`/products/${product.id}/contact`}>
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

      {/* Product Features - Full Width Below */}
      <div className="py-8 lg:py-12 bg-white">
        <Container>
          <div className="mb-8">
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6 text-center">
              {t('product.features')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {product.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 lg:gap-4 p-4 lg:p-6 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-700 font-medium">{t(feature)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Product Content */}
          {product.htmlContent && (
            <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8 mb-8">
              <div className="prose prose-sm lg:prose-lg max-w-none text-gray-700">
                <div dangerouslySetInnerHTML={{ __html: product.htmlContent }} />
              </div>
            </div>
          )}

          {/* Documents Section - Only for authenticated users */}
          {isAuthenticated && productDocuments.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 lg:p-10">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Ürün Dokümanları
                </h3>
                <p className="text-gray-600">
                  Bu ürüne ait teknik dokümanlar ve belgeler
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {productDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="group border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-md transition-all duration-200"
                  >
                    {/* File type indicator */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-gray-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {doc.fileType}
                      </span>
                    </div>

                    {/* Document info */}
                    <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
                      {doc.title}
                    </h4>
                    
                    {doc.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem]">
                        {doc.description}
                      </p>
                    )}

                    {/* Download button */}
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>İndir</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Container>
      </div>
    </div>
  );
}