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
import { UIProvider } from "@/app/providers/UIProvider";
import { OverlayProvider } from "@/app/providers/OverlayProvider";
import { ToastProvider } from "@/app/providers/ToastProvider";
import { CurrentAccountProvider } from "@/app/providers/CurrentAccountProvider";
import { TrendsProvider } from "@/app/providers/TrendsProvider";
import { AccountsProvider } from "@/app/providers/AccountsProvider";
import { PostsProvider } from "@/app/providers/PostsProvider";
import { FeedsProvider } from "@/app/providers/FeedsProvider";
import { EmojiProvider } from "@/app/providers/EmojiProvider";
import { NotificationsProvider } from "@/app/providers/NotificationsProvider";

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
