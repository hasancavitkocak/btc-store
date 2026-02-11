import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Trophy, TrendingUp, Star } from 'lucide-react';
import { useStore } from '../store/useStore';
import Container from '../components/Container';
import Section from '../components/Section';
import Card from '../components/Card';
import Button from '../components/Button';

export default function Stories() {
  const { t } = useTranslation();
  const { stories } = useStore();

  const activeStories = stories.filter((s) => s.active).sort((a, b) => a.order - b.order);

  const gradients = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-orange-500 to-red-500',
    'from-green-500 to-teal-500',
    'from-indigo-500 to-blue-500',
    'from-rose-500 to-orange-500'
  ];

  return (
    <div className="bg-gradient-to-b from-blue-50 via-white to-gray-50">
      <Section>
        <Container>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-full mb-6 shadow-lg">
              <Trophy className="w-5 h-5" />
              <span className="font-semibold text-sm uppercase tracking-wide">{t('stories.title')}</span>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              {t('stories.title')}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
              {t('stories.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeStories.map((story, index) => (
              <Link key={story.id} to={`/stories/${story.id}`}>
                <Card hover className="group overflow-hidden h-full border-0 shadow-xl">
                  <div className="relative">
                    {story.image && (
                      <div className="aspect-video overflow-hidden relative">
                        <img
                          src={story.image}
                          alt={story.company}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-t ${gradients[index % gradients.length]} opacity-20 group-hover:opacity-30 transition-opacity`} />
                      </div>
                    )}
                    {story.videoUrl && (
                      <div className="aspect-video overflow-hidden bg-gray-900 flex items-center justify-center relative">
                        <iframe
                          src={story.videoUrl}
                          title={story.company}
                          className="w-full h-full"
                          allowFullScreen
                        />
                        <div className={`absolute inset-0 bg-gradient-to-t ${gradients[index % gradients.length]} opacity-20 pointer-events-none`} />
                      </div>
                    )}
                    <div className={`absolute top-4 right-4 w-12 h-12 bg-gradient-to-br ${gradients[index % gradients.length]} rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform`}>
                      <Star className="w-6 h-6 text-white fill-white" />
                    </div>
                  </div>
                  <div className="p-8 bg-white">
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      <span className={`text-sm font-bold text-white bg-gradient-to-r ${gradients[index % gradients.length]} px-4 py-2 rounded-full shadow-md`}>
                        {story.company}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                        <TrendingUp className="w-3 h-3" />
                        {story.industry}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {t(story.titleKey)}
                    </h3>
                    <Button
                      variant="outline"
                      fullWidth
                      className={`bg-gradient-to-r ${gradients[index % gradients.length]} text-white border-0 hover:shadow-xl transition-all font-semibold`}
                    >
                      {t('common.learnMore')}
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {activeStories.length === 0 && (
            <div className="text-center py-20">
              <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl p-12 inline-block">
                <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-xl">No success stories available at the moment.</p>
              </div>
            </div>
          )}
        </Container>
      </Section>
    </div>
  );
}
