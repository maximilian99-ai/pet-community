import { setRequestLocale } from 'next-intl/server';
import FeedClient from './_ui/FeedClient';

interface Props {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getPosts() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/posts?limit=10&offset=0`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('Failed to fetch posts:', response.statusText);
      return { posts: [] };
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return { posts: [] };
  }
}

export default async function FeedPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  setRequestLocale(locale);
  
  const feedData = await getPosts();
  const sharedPostId = resolvedSearchParams.postId as string | undefined;

  return <FeedClient initialPosts={feedData.posts} sharedPostId={sharedPostId} />;
}
