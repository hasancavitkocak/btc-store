import StoryDetail from '@/pages/StoryDetail';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Story Details - Btc Store',
  description: 'Read the full story',
};

export default function StoryDetailPage() {
  return <StoryDetail />;
}
