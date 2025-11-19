import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const body = await req.json();

  if (body.id === "test" && body.password === "pass") {
    return NextResponse.json({
      success: true,
      data: {
      is_signed_in: true,
      account: {
        aid: "00009999000099",
        name: "Ok Signin",
        icon_url: "https://kisana.me/images/kisana/kisana-logo.png",
        description: "Bio of Ok Signin",
        followers_count: 100,
        following_count: 50,
        statuses_count: 200,
      },
    }
    });
  }

  return NextResponse.json({
    success: false,
    error: "Invalid ID or password",
  }, { status: 401 });
}
