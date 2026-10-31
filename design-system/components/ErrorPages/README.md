# ErrorPages

The pages nobody plans for: not found, server error, maintenance — and `ErrorPage`, the bare layout for any other status.

**Install** `pnpm dlx shadcn@latest add @coreloom/error-pages`. It writes `error-page.tsx`.

**The consumer provides**:

- `<NotFoundPage homeHref brand>` — 404 with "Go home" and "Go back".
- `<ServerErrorPage onRetry reference statusHref brand>` — 500 with "Try again" (when `onRetry`), "Go home", the error reference and a status link.
- `<MaintenancePage until statusHref brand>` — "We'll be right back", with "Back by 14:30" in the user's locale and time zone.
- `<ErrorPage code title description actions footer brand>` for anything else (403, 410, an expired link).

- Full-height `bg-base` page with the faint accent top-light, a large mono code in `accent-fg`, a `font-display` title (`<h1>`) and one sentence. Titles and texts come from i18n; every prop overrides them.
- Next.js: `app/not-found.tsx` renders `<NotFoundPage />`; `app/error.tsx` (a client component) renders `<ServerErrorPage onRetry={reset} reference={error.digest} />`.
- Say what happened and what to do next; never blame the user; always give a way out.

_Parts are on `window.CoreloomUIDesignSystem_ff5f32` (`ErrorPage`, `NotFoundPage`, `ServerErrorPage`, `MaintenancePage`)._
