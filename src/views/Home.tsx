'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import Container from '../components/Container';
import Section from '../components/Section';
import Button from '../components/Button';
import Carousel from '../components/Carousel';
import ZigzagSection from '../components/ZigzagSection';

export default function Home() {
  const t = useTranslations();
  const { 
    banners, 
    categories, 
    references, 
    partners,
    isLoadingBanners,
    isLoadingCategories,
    isLoadingPartners,
    isLoadingReferences,
    fetchActiveBanners,
    fetchActiveCategories,
    fetchActivePartners,
    fetchActiveReferences
  } = useStore();

  // Sayfa yüklendiğinde verileri çek
  useEffect(() => {
    fetchActiveBanners();
    fetchActiveCategories();
    fetchActivePartners();
    fetchActiveReferences();
  }, [fetchActiveBanners, fetchActiveCategories, fetchActivePartners, fetchActiveReferences]);

  const activeBanners = banners.filter((b) => b.active).sort((a, b) => a.order - b.order);
  const homeCategories = categories.filter((c) => c.showOnHome).sort((a, b) => a.order - b.order);
  const activeReferences = references.filter((r) => r.active && r.showOnHome).sort((a, b) => a.order - b.order);
  const activePartners = partners.filter((p) => p.active).sort((a, b) => a.order - b.order);

  // Ana sayfada gösterilecek maksimum sayılar
  const MAX_HOME_PARTNERS = 8;
  const MAX_HOME_REFERENCES = 4;
  const homePartners = activePartners.slice(0, MAX_HOME_PARTNERS);
  const homeReferences = activeReferences.slice(0, MAX_HOME_REFERENCES);
  const hasMorePartners = activePartners.length > MAX_HOME_PARTNERS;
  const hasMoreReferences = activeReferences.length > MAX_HOME_REFERENCES;

  return (
    <div>
      {isLoadingBanners ? (
        <div className="relative h-[70vh] min-h-[600px] max-h-[900px] bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 overflow-hidden">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/10 to-transparent flex items-center">
            <Container>
              <div className="max-w-3xl space-y-6">
                {/* Title skeleton */}
                <div className="space-y-4">
                  <div className="h-16 bg-gray-300/50 rounded-lg w-3/4 animate-pulse"></div>
                  <div className="h-16 bg-gray-300/50 rounded-lg w-2/3 animate-pulse"></div>
                </div>
                
                {/* Subtitle skeleton */}
                <div className="space-y-3 pt-4">
                  <div className="h-8 bg-gray-300/40 rounded-lg w-full animate-pulse"></div>
                  <div className="h-8 bg-gray-300/40 rounded-lg w-5/6 animate-pulse"></div>
                </div>
                
                {/* Button skeleton */}
                <div className="pt-6">
                  <div className="h-14 bg-gray-300/60 rounded-lg w-48 animate-pulse"></div>
                </div>
              </div>
            </Container>
          </div>
        </div>
      ) : activeBanners.length > 0 ? (
        <Carousel>
          {activeBanners.map((banner) => {
            return (
              <div key={banner.id} className="relative h-[70vh] min-h-[600px] max-h-[900px]">
                <img
                  src={banner.image}
                  alt={banner.titleKey}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 flex items-center">
                  <Container>
                    <div className="max-w-3xl text-white">
                      {banner.showTitle !== false && banner.titleKey && (
                        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
                          {banner.titleKey}
                        </h1>
                      )}
                      {banner.showSubtitle !== false && banner.subtitleKey && (
                        <p className="text-xl sm:text-2xl md:text-3xl mb-10 text-gray-100 leading-relaxed">
                          {banner.subtitleKey}
                        </p>
                      )}
                      {banner.showButton !== false && banner.buttonTextKey && banner.buttonLink && (
                        <Link href={banner.buttonLink}>
                          <button
                            className="text-lg px-8 py-6 rounded-lg font-semibold shadow-2xl hover:shadow-3xl transition-all hover:scale-105"
                            style={{
                              backgroundColor: banner.buttonBackgroundColor || '#1E3A8A',
                              borderWidth: '2px',
                              borderStyle: 'solid',
                              borderColor: banner.buttonBorderColor || '#1E3A8A',
                              color: banner.buttonTextColor || '#FFFFFF'
                            }}
                          >
                            {banner.buttonTextKey}
                          </button>
                        </Link>
                      )}
                    </div>
                  </Container>
                </div>
              </div>
            );
          })}
        </Carousel>
      ) : null}

      <Section className="bg-gradient-to-b from-gray-50 to-white">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t('home.partners.title')}
            </h2>
            <p className="text-lg md:text-xl text-gray-600">
              {t('home.partners.subtitle')}
            </p>
          </div>

          {isLoadingPartners ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-200 rounded-xl h-24 animate-pulse"
                ></div>
              ))}
            </div>
          ) : homePartners.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
                {homePartners.map((partner) => (
                  <div
                    key={partner.id}
                    className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 flex items-center justify-center h-24 group"
                  >
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="max-w-full max-h-full object-contain opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300 group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>

              {hasMorePartners && (
                <div className="text-center mt-12">
                  <Link href="/partners">
                    <Button size="lg" variant="outline" className="text-lg shadow-lg hover:shadow-xl transition-all border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white hover:border-blue-900">
                      {t('common.seeMore')}
                    </Button>
                  </Link>
                </div>
              )}
            </>
          ) : null}
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              {t('home.categories.title')}
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
              {t('home.categories.subtitle')}
            </p>
          </div>
        </Container>
      </Section>

      {isLoadingCategories ? (
        <div className="space-y-0">
          {[...Array(3)].map((_, index) => (
            <div 
              key={index}
              className="py-16 md:py-24"
              style={{ backgroundColor: index % 2 === 0 ? '#F9FAFB' : '#FFFFFF' }}
            >
              <Container>
                <div className={`flex flex-col md:flex-row gap-12 items-center ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                  {/* Image skeleton */}
                  <div className="w-full md:w-1/2">
                    <div className="aspect-[4/3] bg-gray-300 rounded-2xl animate-pulse"></div>
                  </div>
                  
                  {/* Content skeleton */}
                  <div className="w-full md:w-1/2 space-y-4">
                    <div className="h-10 bg-gray-300 rounded-lg w-3/4 animate-pulse"></div>
                    <div className="space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-full animate-pulse"></div>
                      <div className="h-6 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                      <div className="h-6 bg-gray-200 rounded w-4/6 animate-pulse"></div>
                    </div>
                    <div className="pt-2">
                      <div className="h-12 bg-gray-300 rounded-lg w-40 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </Container>
            </div>
          ))}
        </div>
      ) : homeCategories.length > 0 ? (
        <div className="space-y-0">
          {homeCategories.map((category, index) => {
            return (
              <ZigzagSection
                key={category.id}
                image={category.image}
                imageAlt={category.nameKey}
                reverse={index % 2 === 1}
                bgColor={category.bgColor || '#F9FAFB'}
              >
                <div className="space-y-4">
                  <h3 
                    className="text-2xl md:text-3xl font-bold leading-tight"
                    style={{ color: category.textColor || '#111827' }}
                  >
                    {category.nameKey}
                  </h3>
                  <p 
                    className="text-base md:text-lg leading-relaxed"
                    style={{ color: category.textColor || '#4B5563' }}
                  >
                    {category.descriptionKey}
                  </p>
                  {category.showButton !== false && (
                    <div className="pt-1">
                      <Link href={category.buttonLink || `/products?category=${category.id}`}>
                        <button
                          className="px-6 py-2.5 text-sm md:text-base rounded-lg font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105"
                          style={{
                            backgroundColor: category.buttonBgColor || '#0EA5E9',
                            color: category.buttonTextColor || '#FFFFFF',
                            borderWidth: '2px',
                            borderStyle: 'solid',
                            borderColor: category.buttonBorderColor || '#0EA5E9'
                          }}
                        >
                          {category.buttonText || t('common.learnMore')}
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              </ZigzagSection>
            );
          })}
        </div>
      ) : null}

      <Section>
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              {t('home.references.title')}
            </h2>
            <p className="text-xl md:text-2xl text-gray-600">
              {t('home.references.subtitle')}
            </p>
          </div>

          {isLoadingReferences ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-200 rounded-2xl h-32 animate-pulse"
                ></div>
              ))}
            </div>
          ) : homeReferences.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
                {homeReferences.map((ref) => (
                  <div
                    key={ref.id}
                    className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center h-32 group"
                  >
                    {ref.logo ? (
                      <img
                        src={ref.logo}
                        alt={ref.name}
                        className="max-w-full max-h-full object-contain grayscale hover:grayscale-0 transition-all duration-300 group-hover:scale-110"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `<div class="text-gray-600 font-semibold text-center">${ref.name}</div>`;
                          }
                        }}
                      />
                    ) : (
                      <div className="text-gray-600 font-semibold text-center">{ref.name}</div>
                    )}
                  </div>
                ))}
              </div>

              {hasMoreReferences && (
                <div className="text-center mt-16">
                  <Link href="/references">
                    <Button size="lg" variant="outline" className="text-lg shadow-lg hover:shadow-xl transition-all border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white hover:border-blue-900">
                      {t('common.seeMore')}
                    </Button>
                  </Link>
                </div>
              )}
            </>
          ) : null}
        </Container>
      </Section>
    </div>
  );
}
