import { NextResponse } from "next/server";

export async function GET() {

  await new Promise((resolve) => setTimeout(resolve, 2000));

  const mock = [
    {
      category: "general",
      image_url: "https://kisana.me/images/amiverse/amiverse-1.png",
      title: "今日のトレンド",
      overview: "日本の最新トレンド情報です。",
      last_updated_at: new Date(),
      ranking: [
        { word: "トレンドワード1", count: 1500 },
        { word: "トレンドワード2", count: 1200 },
        { word: "トレンドワード3", count: 900 },
        { word: "トレンドワード4", count: 800 },
        { word: "トレンドワード5", count: 500 },
        { word: "トレンドワード6", count: 400 },
        { word: "トレンドワード7", count: 200 },
        { word: "トレンドワード8", count: 10 },
      ],
    }
  ];

  return NextResponse.json(mock, { status: 200 });
}
