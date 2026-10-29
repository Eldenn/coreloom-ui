// Lets the Coreloom blocks (sidebar, breadcrumbs, auth links, error pages…) navigate with TanStack
// Router instead of reloading the page. Given to <CoreloomLinkProvider> in src/routes/__root.tsx.
//
// The blocks only know an `href` ("/projects?status=ready"), so this resolves it with the router:
// in-app links get client-side navigation and hover preloading; a modified click (new tab…) or
// target="_blank" is left to the browser. In your own code, use TanStack's typed <Link to> instead.
import * as React from "react"
import { useRouter } from "@tanstack/react-router"

import type { LinkProps } from "@/lib/link"

export function RouterLink({ href, onClick, onMouseEnter, onFocus, target, ...props }: LinkProps) {
  const router = useRouter()

  // The blocks' hrefs are plain strings, so they skip the typed `to` API: history.push() navigates
  // (the router picks the change up and parses the search string), preloadRoute() warms the route.
  const preload = () => {
    const { pathname } = new URL(href, window.location.origin)
    void router.preloadRoute({ to: pathname } as never).catch(() => {})
  }

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    if (target && target !== "_self") return
    event.preventDefault()
    router.history.push(href)
  }

  return (
    <a
      href={href}
      target={target}
      onClick={handleClick}
      onMouseEnter={(event) => {
        onMouseEnter?.(event)
        preload()
      }}
      onFocus={(event) => {
        onFocus?.(event)
        preload()
      }}
      {...props}
    />
  )
}
