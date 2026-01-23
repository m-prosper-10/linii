import { PostCreationView } from '@/app/components/views/PostCreationView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Post | Linii',
  description: 'Create a new post on Linii',
};

export default function CreatePostPage() {
  return <PostCreationView />;
}
