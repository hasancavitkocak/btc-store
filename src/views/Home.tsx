'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useStore } from '../store/useStore';
import Container from '../components/Container';
import Section from '../components/Section';
import Button from '../components/Button';
import Carousel from '../components/Carousel';
import ZigzagSection from '../components/ZigzagSection';

export default function Home() {
  const t = useTranslations();
  const { banners, categories, references, partners } = useStore();

  const activeBanners = banners.filter((b) => b.active).sort((a, b) => a.order - b.order);
  const homeCategories = categories.filter((c) => c.showOnHome).sort((a, b) => a.order - b.order);
  const activeReferences = references.filter((r) => r.active && r.showOnHome).sort((a, b) => a.order - b.order);
  const activePartners = partners.filter((p) => p.active).sort((a, b) => a.order - b.order);

  return (
    <div>
      <Carousel>
        {activeBanners.map((banner) => (
          <div key={banner.id} className="relative h-[70vh] min-h-[600px] max-h-[900px]">
            <img
              src={banner.image}
              alt={t(banner.titleKey)}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 flex items-center">
              <Container>
                <div className="max-w-3xl text-white px-4 md:px-8 lg:px-12">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
                    {t(banner.titleKey)}
                  </h1>
                  <p className="text-lg sm:text-xl md:text-2xl mb-10 text-gray-100 leading-relaxed">
                    {t(banner.subtitleKey)}
                  </p>
                  {banner.buttonTextKey && banner.buttonLink && (
                    <Link href={banner.buttonLink}>
                      <Button size="lg" className="text-lg px-8 py-6 shadow-2xl hover:shadow-3xl transition-all bg-blue-900 hover:bg-blue-800">
                        {t(banner.buttonTextKey)}
                      </Button>
                    </Link>
                  )}
                </div>
              </Container>
            </div>
          </div>
        ))}
      </Carousel>

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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
            {activePartners.map((partner) => (
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

      <div className="space-y-0">
        {homeCategories.map((category, index) => {
          return (
            <ZigzagSection
              key={category.id}
              image={category.image}
              imageAlt={t(category.nameKey)}
              reverse={index % 2 === 1}
              bgColor={category.bgColor || '#F9FAFB'}
            >
              <div className="space-y-4">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                  {t(category.nameKey)}
                </h3>
                <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                  {t(category.descriptionKey)}
                </p>
                {category.showButton !== false && (
                  <div className="pt-1">
                    <Link href={`/products?category=${category.id}`}>
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

          {activeReferences.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
                {activeReferences.map((ref) => (
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

              <div className="text-center mt-16">
                <Link href="/references">
                  <Button size="lg" variant="outline" className="text-lg shadow-lg hover:shadow-xl transition-all border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white hover:border-blue-900">
                    {t('common.learnMore')}
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Referanslar yükleniyor...</p>
            </div>
          )}
        </Container>
      </Section>
    </div>
  );
}
