import type { Metadata } from "next";
import "./globals.css";
import "./style.css";

// Components import
import Header from "./header/Header";

// Providers import
import { UIProvider } from "./providers/UIProvider";
import { OverlayProvider } from "./providers/OverlayProvider";
import { CurrentAccountProvider } from "./providers/CurrentAccountProvider";

export const metadata: Metadata = {
  title: "Amiverse",
  description: "Amiverse - Social media platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="ja" suppressHydrationWarning>
      <body>
        <UIProvider>
        <OverlayProvider>
        <CurrentAccountProvider>
          <div className='wrap'>
            <Header />
            <main>
              <div className="main-content">
                {children}
              </div>
            </main>
            {/* <Aside /> */}
            {/* <Toast /> */}
            {/* <BottomNav /> */}
            {/* <Overlay /> */}
          </div>
        </CurrentAccountProvider>
        </OverlayProvider>
        </UIProvider>
      </body>
    </html>
  );
}
