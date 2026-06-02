'use client';

import { useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Trophy, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import Container from '../components/Container';
import Section from '../components/Section';
import { getLocalizedText, SupportedLocale } from '../lib/i18n-utils';

export default function Stories() {
  const t = useTranslations();
  const locale = useLocale() as SupportedLocale;
  const { stories, fetchActiveSuccessStories, isLoadingStories } = useStore();

  useEffect(() => {
    fetchActiveSuccessStories();
  }, [fetchActiveSuccessStories]);

  const activeStories = stories.filter((s) => s.active).sort((a, b) => a.order - b.order);

  return (
    <div className="bg-white">
      <Section className="bg-gradient-to-b from-gray-50 to-white">
        <Container>
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              {t('stories.title')}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
              {t('stories.subtitle')}
            </p>
          </div>

          {isLoadingStories ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-xl">Loading success stories...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeStories.map((story) => (
                  <Link
                    key={story.id}
                    href={`/stories/${story.id}`}
                    className="group"
                  >
                    <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                      {/* Image */}
                      <div className="relative aspect-video overflow-hidden bg-gray-900">
                        {story.image && (
                          <>
                            {/* blurred background */}
                            <img
                              src={story.image}
                              alt=""
                              aria-hidden="true"
                              className="absolute inset-0 w-full h-full object-cover scale-110 blur-lg opacity-60"
                            />
                            {/* actual image */}
                            <img
                              src={story.image}
                              alt={story.company}
                              className="relative w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                            />
                          </>
                        )}
                        {story.videoUrl && !story.image && (
                          <iframe
                            src={story.videoUrl}
                            title={story.company}
                            className="w-full h-full"
                            allowFullScreen
                          />
                        )}

                      </div>

                      {/* Content */}
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-sm font-semibold text-blue-900 bg-blue-50 px-3 py-1 rounded-lg">
                            {story.company}
                          </span>
                          {story.industry && (
                            <span className="text-sm text-gray-500">
                              {story.industry}
                            </span>
                          )}
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-900 transition-colors">
                          {getLocalizedText(story.title, locale)}
                        </h3>

                        <div className="mt-auto flex items-center text-blue-900 font-medium group-hover:gap-2 transition-all">
                          <span>{t('common.learnMore')}</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {activeStories.length === 0 && (
                <div className="text-center py-20">
                  <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Henüz başarı hikayesi bulunmamaktadır.</p>
                </div>
              )}
            </>
          )}
        </Container>
      </Section>
    </div>
  );
}
