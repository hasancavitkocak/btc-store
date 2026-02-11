import Stories from '@/pages/Stories';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stories - Btc Store',
  description: 'Read our customer success stories',
};

export default function StoriesPage() {
  return <Stories />;
}
