import { Metadata } from "next";
import PostDetail from "./PostDetail";

type Props = {
  params: Promise<{
    aid: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { aid } = await params;
  const backUrl = process.env.NEXT_PUBLIC_BACK_URL || "";
  const baseUrl = backUrl.endsWith('/') ? backUrl.slice(0, -1) : backUrl;
  const ogImageUrl = `${baseUrl}/og/posts/${aid}`;

  return {
    openGraph: {
      images: [ogImageUrl],
    },
    twitter: {
      card: "summary_large_image",
      images: [ogImageUrl],
    },
  };
}

export default function Page(props: Props) {
  return <PostDetail {...props} />;
}
