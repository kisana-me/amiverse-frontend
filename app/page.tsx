import Link from "next/link";

export default function Home() {
  return (
    <div className="">
      <main className="">
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
      </main>
    </div>
  );
}
