'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import { useStore } from '../store/useStore';
import Container from '../components/Container';
import Section from '../components/Section';
import Button from '../components/Button';
import RichContentRenderer from '../components/RichContentRenderer';
import ImageLightbox from '../components/ImageLightbox';
import { getLocalizedText, SupportedLocale } from '../lib/i18n-utils';

export default function StoryDetail() {
  const params = useParams();
  const id = params?.id as string;
  const t = useTranslations();
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();
  const { stories, fetchActiveSuccessStories, isLoadingStories } = useStore();
  const [lightbox, setLightbox] = useState<{ isOpen: boolean; imageUrl: string }>({
    isOpen: false,
    imageUrl: ''
  });

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
    
    // If already an embed URL or other format, return as is
    return url;
  };

  useEffect(() => {
    fetchActiveSuccessStories();
  }, [fetchActiveSuccessStories]);

  const story = stories.find((s) => s.id === id);

  if (isLoadingStories) {
    return (
      <Section>
        <Container>
          <div className="text-center py-20">
            <p className="text-gray-500 text-xl">Loading...</p>
          </div>
        </Container>
      </Section>
    );
  }

  if (!story) {
    return (
      <Section>
        <Container>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Story not found</h1>
            <Link href="/stories">
              <Button>Back to Stories</Button>
            </Link>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section>
      <Container>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">{t('menu.stories')}</span>
        </button>

        <article className="max-w-4xl mx-auto">
          {story.image && (
            <div
              className="mb-8 cursor-pointer hover:opacity-95 transition-opacity flex items-center justify-center"
              onClick={() => setLightbox({ isOpen: true, imageUrl: story.image! })}
            >
              <img
                src={story.image}
                alt={story.company}
                className="max-w-full h-auto max-h-[600px] rounded-2xl shadow-xl"
              />
            </div>
          )}

          {story.videoUrl && !story.image && (
            <div className="aspect-video overflow-hidden rounded-2xl shadow-xl mb-8">
              <iframe
                src={getEmbedUrl(story.videoUrl)}
                title={story.company}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          <div className="flex items-center gap-3 mb-6">
            <span className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
              {story.company}
            </span>
            {story.industry && (
              <span className="text-gray-600">{story.industry}</span>
            )}
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            {getLocalizedText(story.title, locale)}
          </h1>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <RichContentRenderer htmlContent={getLocalizedText(story.htmlContent, locale)} />
          </div>

          {/* Video Section - Show below content if videoUrl exists and image also exists */}
          {story.videoUrl && story.image && (
            <div className="mt-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Hikaye Videosu
              </h3>
              <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-xl shadow-lg">
                <iframe
                  src={getEmbedUrl(story.videoUrl)}
                  className="absolute top-0 left-0 w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {story.results && story.results.length > 0 && (
            <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Sonuçlar</h2>
              <ul className="space-y-2">
                {story.results.map((result: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">✓</span>
                    <span className="text-gray-700">{result}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </article>

        <ImageLightbox
          isOpen={lightbox.isOpen}
          imageUrl={lightbox.imageUrl}
          alt={story.company}
          onClose={() => setLightbox({ isOpen: false, imageUrl: '' })}
        />
      </Container>
    </Section>
  );
}
