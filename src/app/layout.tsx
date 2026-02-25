import type { Metadata } from "next";
import "./globals.css";
import "./style.css";

// Components import
import Header from "@/components/header/Header";
import Aside from "@/components/aside/Aside";
import Toast from "@/components/toast/Toast";
import BottomNav from "@/components/bottom_nav/BottomNav";
import Overlay from "@/components/overlay/Overlay";
import InitialLoading from "@/components/initial_loading/InitialLoading";

// Providers import
import { UIProvider } from "@/providers/UIProvider";
import { OverlayProvider } from "@/providers/OverlayProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import { CurrentAccountProvider } from "@/providers/CurrentAccountProvider";
import { TrendsProvider } from "@/providers/TrendsProvider";
import { AccountsProvider } from "@/providers/AccountsProvider";
import { PostsProvider } from "@/providers/PostsProvider";
import { FeedsProvider } from "@/providers/FeedsProvider";
import { EmojiProvider } from "@/providers/EmojiProvider";
import { NotificationsProvider } from "@/providers/NotificationsProvider";

export const metadata: Metadata = {
  title: "Amiverse",
  description: "Amiverse - Social media platform.",
  manifest: "/manifest.json",
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
        <AccountsProvider>
        <PostsProvider>
        <FeedsProvider>
        <EmojiProvider>
        <NotificationsProvider>
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
        </NotificationsProvider>
        </EmojiProvider>
        </FeedsProvider>
        </PostsProvider>
        </AccountsProvider>
        </TrendsProvider>
        </CurrentAccountProvider>
        </ToastProvider>
        </OverlayProvider>
        </UIProvider>
      </body>
    </html>
  );
}
