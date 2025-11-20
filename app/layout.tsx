import type { Metadata } from "next";
import "./globals.css";
import "./style.css";

// Components import
import Header from "@/app/components/header/Header";
import Aside from "@/app/components/aside/Aside";
import Toast from "@/app/components/toast/Toast";
import BottomNav from "@/app/components/bottom_nav/BottomNav";
import Overlay from "@/app/components/overlay/Overlay";
import InitialLoading from "@/app/components/initial_loading/InitialLoading";

// Providers import
import { UIProvider } from "@/app/providers/UIProvider";
import { OverlayProvider } from "@/app/providers/OverlayProvider";
import { ToastProvider } from "@/app/providers/ToastProvider";
import { CurrentAccountProvider } from "@/app/providers/CurrentAccountProvider";
import { TrendsProvider } from "@/app/providers/TrendsProvider";

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
        <ToastProvider>
        <CurrentAccountProvider>
        <TrendsProvider>
        {/* <AccountsProvider> */}
        {/* <PostsProvider> */}
        {/* <FeedsProvider> */}
          <div className='wrap'>
            <Header />
            <main>
              <div className="main-content">
                {children}
              </div>
            </main>
            <Aside />
            <Toast />
            <BottomNav />
            <Overlay />
            <InitialLoading />
          </div>
        </TrendsProvider>
        {/* </FeedsProvider> */}
        {/* </AccountsProvider> */}
        {/* </PostsProvider> */}
        </CurrentAccountProvider>
        </ToastProvider>
        </OverlayProvider>
        </UIProvider>
      </body>
    </html>
  );
}
