'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import Container from '../components/Container';
import Section from '../components/Section';

export default function Partners() {
  const t = useTranslations();
  const { partners, isLoadingPartners, fetchActivePartners } = useStore();

  useEffect(() => {
    fetchActivePartners();
  }, []);

  const activePartners = partners.filter((p) => p.active).sort((a, b) => a.order - b.order);

  return (
    <div>
      <Section className="bg-gradient-to-b from-blue-50 to-white pt-24">
        <Container>
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              {t('partners.title')}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
              {t('partners.subtitle')}
            </p>
          </div>

          {isLoadingPartners ? (
            <div className="py-20 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-900 mx-auto mb-4"></div>
              <p className="text-gray-500 text-lg">Partnerler yükleniyor...</p>
            </div>
          ) : activePartners.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {activePartners.map((partner) => (
                <div
                  key={partner.id}
                  className="bg-white rounded-xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 flex items-center justify-center h-32 group"
                >
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="max-w-full max-h-full object-contain opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300 group-hover:scale-110"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">Henüz partner bulunmamaktadır.</p>
            </div>
          )}
        </Container>
      </Section>
    </div>
  );
}
