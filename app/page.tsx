"use client";

import Link from "next/link";
import MainHeader from "@/app/components/main_header/MainHeader";
import { useToast } from "./providers/ToastProvider";
import Items from "./components/posts/items";

export default function Home() {
  const { addToast } = useToast();
  const generateToast = () => {
    addToast({
      title: "Hello",
      message: "This is a toast message!",
      status: "show",
      date: Date.now(),
    });
  };

  const items = [
    {
      load_items: false,
      aid: "1",
      created_at: "2024-06-01T12:00:00Z",
      content: "This is the first post.",
      visibility: "public_share",
      viewed_counter: 10,
      control_disabled: false,

      quoters_counter: 2,
      diffusers_counter: 3,
      repliers_counter: 1,
      diffused: false,

      reactions_counter: 5,
      reactions: [
        {
          emoji: {
            aid: "e1",
            name: "like",
          },
          reaction_count: 3,
          reacted: true,
        },
        {
          emoji: {
            aid: "e2",
            name: "love",
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
          url: "https://kisana.me/images/anyur/anyur-1.png",
        },
      ],
      videos: [
      ],
    }
  ]

  return (
    <>
      <MainHeader>
        title!
      </MainHeader>
      <div className="">
        <button onClick={() => generateToast()}>Click me!</button>
        <div className="">
          <h1 className="">
            Done set up.
          </h1>
        </div>
        <div>
          <h2>Posts Items Example</h2>
          <div>
            <Items items={items} />
          </div>
        </div>
        <div className="">
          <a
            className=""
            href="https://amiverse.net"
            target="_blank"
            rel="noopener noreferrer"
          >
            Link!amiverse.net
          </a>
          <br />
          <Link href="/signup">signup!</Link>
          <Link href="/signin">signin!</Link>
          <br />
          <a href="/signup">signup!</a>
          <a href="/signin">signin!</a>
        </div>
      </div>
    </>
  );
}
