'use client';

import StoryForm from '@/views/admin/StoryForm';
import { useParams } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function EditStoryPage() {
  const params = useParams();
  const storyId = params.id as string;
  
  return <StoryForm storyId={storyId} />;
}
