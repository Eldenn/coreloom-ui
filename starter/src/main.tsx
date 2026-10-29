import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider, createRouter } from "@tanstack/react-router"

import { auth } from "@/lib/auth"
import type { Messages } from "@/messages"
import { routeTree } from "./routeTree.gen"
import "./styles/globals.css"

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000 } },
})

const router = createRouter({
  routeTree,
  // Vite's `base` (e.g. `vite build --base /my-app/`) becomes the router's basepath.
  basepath: import.meta.env.BASE_URL,
  context: { queryClient, auth },
  // Hovering a link preloads the next route's data; Query decides when it is stale.
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
  Wrap: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
})

// Signing in or out re-runs the routes' beforeLoad checks.
auth.subscribe(() => void router.invalidate())

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
  // `staticData: { crumb }` on a route adds it to the header's breadcrumbs (see src/routes/_app.tsx).
  interface StaticDataRouteOption {
    crumb?: string | ((t: Messages) => string)
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
