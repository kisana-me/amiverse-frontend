import { NextResponse } from "next/server";

export async function GET() {

  await new Promise((resolve) => setTimeout(resolve, 2000));

  const mock = {
    signed_in: {
      is_signed_in: true,
      account: {
        aid: "12345678901234",
        name: "Example Account",
        name_id: "example_account",
        icon_url: "https://kisana.me/images/amiverse/amiverse-logo.png",
        description: "Bio of Example Account",
        followers_count: 100,
        following_count: 50,
        statuses_count: 200,
      },
    },
    signed_out: {
      is_signed_in: false,
      account: null,
    }
  };

  return NextResponse.json(mock.signed_out, { status: 200 });
}
