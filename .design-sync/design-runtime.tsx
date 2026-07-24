// Merged into the bundle via cfg.extraEntries, so `window.Amiverse.DesignRoot`
// exists alongside the components.
//
// Amiverse components are Next.js app-router client components: they call
// useRouter()/usePathname()/useSearchParams() (directly or through hooks like
// usePostClick) and read theme + UI state from the provider chain in
// src/app/layout.tsx. Outside a running Next app both are absent, and
// `invariant expected app router to be mounted` kills the whole tree.
//
// DesignRoot supplies a navigation-free stand-in for the router plus the
// provider chain, so any composition of Amiverse components renders standalone.
// It is also cfg.provider — every preview card is wrapped in it.
// Must stay first: this module is bundled as its own entry (cfg.extraEntries),
// so it cannot rely on the main entry's shim having run.
import './process-shim.mjs'

import type { ReactNode } from 'react'
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { PathParamsContext, PathnameContext, SearchParamsContext } from 'next/dist/shared/lib/hooks-client-context.shared-runtime'

import { UIProvider } from '../src/providers/UIProvider'
import { OverlayProvider } from '../src/providers/OverlayProvider'
import { ToastProvider } from '../src/providers/ToastProvider'
import { CurrentAccountProvider } from '../src/providers/CurrentAccountProvider'
import { PostsProvider } from '../src/providers/PostsProvider'
import { EmojiProvider } from '../src/providers/EmojiProvider'

const noop = () => {}

// Shape-compatible with Next's AppRouterInstance; every navigation is a no-op
// because a design has nowhere to navigate to.
const router = {
  back: noop,
  forward: noop,
  refresh: noop,
  push: noop,
  replace: noop,
  prefetch: noop,
  hmrRefresh: noop,
}

export function DesignRoot({ children, pathname = '/' }: { children: ReactNode; pathname?: string }) {
  return (
    <AppRouterContext.Provider value={router as never}>
      <PathnameContext.Provider value={pathname}>
        <SearchParamsContext.Provider value={new URLSearchParams() as never}>
          <PathParamsContext.Provider value={{}}>
            <UIProvider>
              <OverlayProvider>
                <ToastProvider>
                  <CurrentAccountProvider>
                    <PostsProvider>
                      <EmojiProvider>{children}</EmojiProvider>
                    </PostsProvider>
                  </CurrentAccountProvider>
                </ToastProvider>
              </OverlayProvider>
            </UIProvider>
          </PathParamsContext.Provider>
        </SearchParamsContext.Provider>
      </PathnameContext.Provider>
    </AppRouterContext.Provider>
  )
}
