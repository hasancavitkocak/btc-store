'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useStore } from '../store/useStore';
import Container from '../components/Container';
import Section from '../components/Section';

export default function References() {
  const t = useTranslations();
  const { references, fetchActiveReferences, isLoadingReferences } = useStore();

  useEffect(() => {
    fetchActiveReferences();
  }, [fetchActiveReferences]);

  const activeReferences = references.filter((r) => r.active).sort((a, b) => a.order - b.order);

  return (
    <Section>
      <Container>
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 mb-6">
            {t('references.title')}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
            {t('references.subtitle')}
          </p>
        </div>

        {isLoadingReferences ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-xl">Loading references...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {activeReferences.map((ref) => (
                <div
                  key={ref.id}
                  className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex items-center justify-center h-40"
                >
                  <img
                    src={ref.logo}
                    alt={ref.name}
                    className="max-w-full max-h-full object-contain grayscale hover:grayscale-0 transition-all duration-300 group-hover:scale-110"
                  />
                </div>
              ))}
            </div>

            {activeReferences.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-500 text-xl">No references available at the moment.</p>
              </div>
            )}
          </>
        )}
      </Container>
    </Section>
  );
}
