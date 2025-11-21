import { NextResponse } from "next/server";

export async function GET() {

  await new Promise((resolve) => setTimeout(resolve, 2000));

  const mock = [
    {
      category: "general",
      feed: [
        {
          aid: "post1",
          content: "テスト投稿！",
          visibility: "opened",
          created_at: Date.now(),

          reply_presence: false,
          quote_presence: false,

          replies_count: 2,
          quotes_count: 1,
          diffuses_count: 4,
          reactions_count: 7,
          views_count: 122,

          reactions: [
            {
              emoji: {
                aid: "e1",
                name: "like",
                name_id: "like",
              },
              reaction_count: 3,
              reacted: true,
            },
            {
              emoji: {
                aid: "e2",
                name: "love",
                name_id: "love",
              },
              reaction_count: 2,
              reacted: false,
            },
          ],
          account: {
            aid: "test user",
            name: "テストユーザー",
            name_id: "test_user",
            icon_url: "https://kisana.me/images/kisana/kisana-logo.png",
          }
        },
        {
          aid: "1",
          content: "This is the first post.",
          created_at: "2024-06-01T12:00:00Z",
          visibility: "opened",

          reply_presence: true,
          quote_presence: true,

          replies_count: 1,
          quotes_count: 2,
          diffuses_count: 3,
          reactions_count: 2,
          views_count: 22,

          is_diffused: true,
          is_reacted: true,

          reactions: [
            {
              emoji: {
                aid: "e1",
                name: "like",
                name_id: "like",
              },
              reaction_count: 3,
              reacted: true,
            },
            {
              emoji: {
                aid: "e2",
                name: "love",
                name_id: "love",
              },
              reaction_count: 2,
              reacted: false,
            },
          ],

          account: {
            name: "User One",
            name_id: "userone",
            icon_url: "https://kisana.me/images/kisana/kisana-logo.png",
            ring_color: "#ff0000",
            status_rb_color: "#00ff00",
          },
          images: [
            {
              aid: "img1",
              name: "画像",
              url: "https://kisana.me/images/anyur/anyur-1.png",
            },
          ],
          videos: [
          ],
        }
      ]
    }
  ];

  return NextResponse.json(mock[0], { status: 200 });
}
