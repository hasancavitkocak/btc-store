'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import { useStore } from '../store/useStore';
import Container from '../components/Container';
import Section from '../components/Section';
import Button from '../components/Button';
import RichContentRenderer from '../components/RichContentRenderer';
import ImageLightbox from '../components/ImageLightbox';

export default function StoryDetail() {
  const params = useParams();
  const id = params?.id as string;
  const t = useTranslations();
  const router = useRouter();
  const { stories } = useStore();
  const [lightbox, setLightbox] = useState<{ isOpen: boolean; imageUrl: string }>({
    isOpen: false,
    imageUrl: ''
  });

  const story = stories.find((s) => s.id === id);

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
              className="aspect-video overflow-hidden rounded-2xl shadow-xl mb-8 cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => setLightbox({ isOpen: true, imageUrl: story.image! })}
            >
              <img
                src={story.image}
                alt={story.company}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {story.videoUrl && (
            <div className="aspect-video overflow-hidden rounded-2xl shadow-xl mb-8">
              <iframe
                src={story.videoUrl}
                title={story.company}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          )}

          <div className="flex items-center gap-3 mb-6">
            <span className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
              {story.company}
            </span>
            <span className="text-gray-600">{story.industry}</span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            {story.title[t('locale') as keyof typeof story.title] || story.title.tr}
          </h1>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <RichContentRenderer htmlContent={story.htmlContent[t('locale') as keyof typeof story.htmlContent] || story.htmlContent.tr} />
          </div>
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
