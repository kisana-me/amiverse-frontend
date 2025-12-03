import { Metadata } from 'next';
import HomeClient from './home_client';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  { searchParams }: Props
): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const tab = resolvedSearchParams.tab as string;
  
  let title = '人気 | Amiverse';
  if (tab === 'follow') {
    title = 'フォロー中 | Amiverse';
  } else if (tab === 'current') {
    title = '最新 | Amiverse';
  }

  const description = 'Amiverseは、あなたの興味を広げる新しいソーシャルプラットフォームです。';
  const baseUrl = new URL(process.env.NEXT_PUBLIC_FRONT_URL || 'https://amiverse.net');
  const imageUrl = new URL('/static-assets/images/amiverse-1.webp', baseUrl).toString();
  const iconUrl = new URL('/static-assets/images/amiverse-logo-400.webp', baseUrl).toString();

  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1920,
          height: 1080,
          alt: 'Amiverse',
        },
      ],
      siteName: 'Amiverse',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    icons: {
      icon: '/favicon.ico',
      apple: iconUrl,
    },
  };
}

export default function Page() {
  return <HomeClient />;
}
