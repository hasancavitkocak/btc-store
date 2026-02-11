import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { useStore } from '../store/useStore';
import Container from '../components/Container';
import Section from '../components/Section';
import Button from '../components/Button';
import Carousel from '../components/Carousel';
import ZigzagSection from '../components/ZigzagSection';

export default function Home() {
  const { t } = useTranslation();
  const { banners, categories, references, partners } = useStore();

  const activeBanners = banners.filter((b) => b.active).sort((a, b) => a.order - b.order);
  const homeCategories = categories.filter((c) => c.showOnHome).sort((a, b) => a.order - b.order);
  const activeReferences = references.filter((r) => r.active).sort((a, b) => a.order - b.order);
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
                <div className="max-w-3xl text-white">
                  <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
                    {t(banner.titleKey)}
                  </h1>
                  <p className="text-xl sm:text-2xl md:text-3xl mb-10 text-gray-100 leading-relaxed">
                    {t(banner.subtitleKey)}
                  </p>
                  {banner.buttonTextKey && banner.buttonLink && (
                    <Link to={banner.buttonLink}>
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
          const IconComponent = Icons[category.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
          return (
            <ZigzagSection
              key={category.id}
              image={category.image}
              imageAlt={t(category.nameKey)}
              reverse={index % 2 === 1}
            >
              <div className="flex items-center gap-4 mb-6">
                {IconComponent && (
                  <div className="w-16 h-16 bg-blue-900 rounded-2xl flex items-center justify-center shadow-lg">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                )}
                <h3 className="text-4xl md:text-5xl font-bold text-gray-900">
                  {t(category.nameKey)}
                </h3>
              </div>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
                {t(category.descriptionKey)}
              </p>
              <Link to={`/products?category=${category.id}`}>
                <Button size="lg" variant="outline" className="text-lg shadow-lg hover:shadow-xl transition-all border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white hover:border-blue-900 group">
                  <span className="group-hover:text-white transition-colors">{t('common.learnMore')}</span>
                </Button>
              </Link>
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
            {activeReferences.slice(0, 4).map((ref) => (
              <div
                key={ref.id}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center h-32 group"
              >
                <img
                  src={ref.logo}
                  alt={ref.name}
                  className="max-w-full max-h-full object-contain grayscale hover:grayscale-0 transition-all duration-300 group-hover:scale-110"
                />
              </div>
            ))}
          </div>

          {activeReferences.length > 4 && (
            <div className="text-center mt-16">
              <Link to="/references">
                <Button size="lg" variant="outline" className="text-lg shadow-lg hover:shadow-xl transition-all border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white hover:border-blue-900">
                  {t('common.learnMore')}
                </Button>
              </Link>
            </div>
          )}
        </Container>
      </Section>
    </div>
  );
}
