import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Amiverse Frontend",
  description: "Done set up.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className="hi"
      >
        {children}
      </body>
    </html>
  );
}
