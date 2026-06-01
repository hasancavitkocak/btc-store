'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowLeft, ChevronLeft, ChevronRight, Check, MessageCircle, FileText, Download } from 'lucide-react';
import Container from '../components/Container';
import Button from '../components/Button';
import { productService, ProductData, CategoryData } from '../services/product.service';
import { documentService, ProductDocument } from '../services/document.service';
import { usePublicAuthStore } from '../store/usePublicAuthStore';
import { getLocalizedText, SupportedLocale } from '../lib/i18n-utils';

export default function ProductDetail() {
  const params = useParams();
  const code = params?.id as string;
  const t = useTranslations();
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [documents, setDocuments] = useState<ProductDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const { isAuthenticated } = usePublicAuthStore();

  // Convert video URL to embed URL
  const getEmbedUrl = (url: string): string => {
    if (!url) return '';
    
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be') 
        ? url.split('youtu.be/')[1]?.split('?')[0]
        : url.split('v=')[1]?.split('&')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    
    // Vimeo
    if (url.includes('vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
    }
    
    // Dailymotion
    if (url.includes('dailymotion.com')) {
      const videoId = url.split('video/')[1]?.split('?')[0];
      return videoId ? `https://www.dailymotion.com/embed/video/${videoId}` : url;
    }
    
    // Wistia
    if (url.includes('wistia.com')) {
      const videoId = url.split('medias/')[1]?.split('?')[0];
      return videoId ? `https://fast.wistia.net/embed/iframe/${videoId}` : url;
    }
    
    // If already an embed URL or other format (like direct video files, other platforms), return as is
    // This allows using any embed URL directly or custom video hosting
    return url;
  };

  useEffect(() => {
    if (code) {
      loadProduct(code);
    }
  }, [code]);

  useEffect(() => {
    if (code && isAuthenticated) {
      loadDocuments(code);
    }
  }, [code, isAuthenticated]);

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

  const loadDocuments = async (productCode: string) => {
    try {
      setDocumentsLoading(true);
      console.log('Loading documents for product:', productCode);
      console.log('Is authenticated:', isAuthenticated);
      const docs = await documentService.getProductDocuments(productCode);
      console.log('Documents received:', docs);
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setDocumentsLoading(false);
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
                    alt={getLocalizedText(product.name, locale)}
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
                        alt={`${getLocalizedText(product.name, locale)} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Video Section */}
              {product.videoLink && (
                <div className="mt-6">
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">
                    Ürün Tanıtım Videosu
                  </h3>
                  <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-xl shadow-lg">
                    <iframe
                      src={getEmbedUrl(product.videoLink)}
                      className="absolute top-0 left-0 w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
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
                        {getLocalizedText(category.name, locale)}
                      </span>
                    ))}
                  </div>
                )}
                <h1 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 break-words">
                  {getLocalizedText(product.name, locale)}
                </h1>
                <p className="text-gray-600 mb-6">
                  {getLocalizedText(product.shortDescription, locale)}
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
          {product.description && getLocalizedText(product.description, locale) && (
            <div className="bg-white rounded-2xl shadow-lg p-4 lg:p-6 mb-6">
              <div 
                className="prose prose-sm lg:prose-lg max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: getLocalizedText(product.description, locale) }}
              />
            </div>
          )}

          {/* Product Documents - Only for authenticated users */}
          {isAuthenticated && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Ürün Dokümanları</h3>
              </div>

              {documentsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Dokümanlar yükleniyor...</p>
                </div>
              ) : documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents.map((doc) => {
                    const title = getLocalizedText(doc.title, locale) || 'Doküman';
                    const description = getLocalizedText(doc.description, locale);
                    
                    return (
                      <div
                        key={doc.id}
                        className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {title}
                            </h4>
                            {description && (
                              <p className="text-sm text-gray-600 mb-3">{description}</p>
                            )}
                            {doc.medias && doc.medias.length > 0 && (
                              <div className="space-y-2">
                                {doc.medias.map((media, idx) => (
                                  <a
                                    key={idx}
                                    href={media.absolutePath}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                                  >
                                    <Download className="w-4 h-4" />
                                    <span className="truncate">{media.name || `Dosya ${idx + 1}`}</span>
                                    {media.size && (
                                      <span className="text-xs text-gray-500">
                                        ({(media.size / 1024 / 1024).toFixed(2)} MB)
                                      </span>
                                    )}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p>Bu ürün için henüz doküman eklenmemiş.</p>
                </div>
              )}
            </div>
          )}
        </Container>
      </div>
    </div>
  );
}
