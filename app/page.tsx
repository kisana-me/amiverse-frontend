"use client";

import Link from "next/link";
import MainHeader from "@/app/components/main_header/MainHeader";
import { useToast } from "./providers/ToastProvider";

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
