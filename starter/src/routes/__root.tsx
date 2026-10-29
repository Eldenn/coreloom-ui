import * as React from "react"
import type { QueryClient } from "@tanstack/react-query"
import { Outlet, createRootRouteWithContext, useRouter, type ErrorComponentProps } from "@tanstack/react-router"

import { Brand } from "@/components/brand"
import { RouterLink } from "@/components/router-link"
import { NotFoundPage, ServerErrorPage } from "@/components/error-page"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import type { Auth } from "@/lib/auth"
import { CoreloomLinkProvider } from "@/lib/link"
import { LocaleProvider } from "@/lib/locale"

// Devtools only load in development; the production bundle doesn't include them.
const Devtools = import.meta.env.DEV
  ? React.lazy(async () => {
      const [{ TanStackRouterDevtools }, { ReactQueryDevtools }] = await Promise.all([
        import("@tanstack/react-router-devtools"),
        import("@tanstack/react-query-devtools"),
      ])
      return {
        default: () => (
          <>
            <TanStackRouterDevtools position="bottom-right" />
            <ReactQueryDevtools buttonPosition="bottom-left" />
          </>
        ),
      }
    })
  : () => null

export type RouterContext = { queryClient: QueryClient; auth: Auth }

export const Route = createRootRouteWithContext<RouterContext>()({
  component: Root,
  notFoundComponent: () => <NotFoundPage brand={<Brand />} homeHref="/" />,
  errorComponent: RootError,
})

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <CoreloomLinkProvider component={RouterLink}>
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </CoreloomLinkProvider>
    </LocaleProvider>
  )
}

function Root() {
  return (
    <Providers>
      <Outlet />
      <React.Suspense>
        <Devtools />
      </React.Suspense>
    </Providers>
  )
}

function RootError({ error, reset }: ErrorComponentProps) {
  const router = useRouter()
  React.useEffect(() => console.error(error), [error])
  return (
    <Providers>
      <ServerErrorPage
        brand={<Brand />}
        homeHref="/"
        onRetry={() => {
          reset()
          void router.invalidate()
        }}
      />
    </Providers>
  )
}
