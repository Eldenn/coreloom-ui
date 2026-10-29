# Coreloom starter

A React app on **Vite** and the **TanStack** stack — Router (file-based routes), Query and Form —
built with Coreloom UI. It runs entirely in the browser: the data is a local demo module, ready to
be swapped for your API.

```bash
pnpm dlx degit Eldenn/coreloom-ui/starter my-app
cd my-app
pnpm install
pnpm dev
```

Sign in with any email and a password of 8 characters or more. Live demo:
https://eldenn.github.io/coreloom-ui/starter/

## What's in it

| Screen | Route file | Shows |
|---|---|---|
| Sign in | `src/routes/login.tsx` | `LoginForm`, redirect back to the page you asked for |
| Overview | `src/routes/_app/index.tsx` | `StatGrid`, `TrendChart`, `ActivityFeed`, data from a route loader |
| Projects | `src/routes/_app/projects/index.tsx` | `useDataList` with search, filters and page in the route's typed search params; "New project" dialog (`?new=true`) |
| Project | `src/routes/_app/projects/$projectId.tsx` | Loader with `notFound()`, breadcrumb from loader data |
| Settings | `src/routes/_app/settings.tsx` | `SettingsLayout` with one URL per section, a form, switches, the danger zone |
| 404 and errors | `src/routes/__root.tsx` | `NotFoundPage`, `ServerErrorPage` with retry |

Around them: the app shell (sidebar, breadcrumbs, ⌘K palette, theme menu, language menu), English
and French, light / dark / system theme without a flash on load, and the TanStack devtools in
development.

## How it fits together

- **Routes** live in `src/routes/`; the Vite plugin generates `src/routeTree.gen.ts` (committed so
  `tsc` works before the first `dev`). `_app.tsx` is the signed-in layout: its `beforeLoad` sends
  signed-out visitors to `/login?redirect=…`.
- **Data**: `src/lib/api.ts` is the only file that knows where data comes from. Today it is an
  in-memory demo with a short delay; replace each function's body with a `fetch` to your backend.
  `src/lib/queries.ts` holds the query options: loaders call `ensureQueryData`, components
  `useSuspenseQuery`, mutations invalidate by key.
- **Auth**: `src/lib/auth.ts` keeps a pretend session in `localStorage`. Keep its shape
  (`auth.user`, `signIn`, `signOut`, `useAuth()`) and plug in your real sign-in.
- **Forms** use `useAppForm` from `@/components/ui/form` with zod schemas. `new-project-dialog.tsx`
  shows an API error landing on its field.
- **Links inside Coreloom blocks** (sidebar, breadcrumbs, settings nav, auth and error pages) go
  through `CoreloomLinkProvider` → `src/components/router-link.tsx`, so they navigate client-side.
  In your own code, use TanStack's typed `<Link to>`.
- **Text**: the components bring their own strings in both languages; the app's own copy is in
  `src/messages.ts` (`useT()`). Breadcrumbs come from each route's `staticData.crumb`.

## Coreloom components

Everything under `src/components/ui/`, the blocks in `src/components/` and `src/lib/{utils,i18n,link}`
come from the `@coreloom` registry; they are yours to edit. Add or update one with:

```bash
pnpm dlx shadcn@latest add @coreloom/date-range-picker
pnpm dlx shadcn@latest add @coreloom/app-shell --overwrite   # read the CHANGELOG first
```

Docs and live examples: https://eldenn.github.io/coreloom-ui/

## Scripts

| | |
|---|---|
| `pnpm dev` | Dev server with the router and query devtools |
| `pnpm build` | Typecheck, then a production build in `dist/` |
| `pnpm preview` | Serve `dist/` |
| `pnpm typecheck` | `tsc -b` |

Deploying `dist/` as a static site: send every unknown path to `index.html` (the router handles
it), e.g. a `_redirects` rule `/* /index.html 200` on Netlify, a rewrite on Vercel, or
`try_files $uri /index.html` in nginx. Under a sub-path, build with `vite build --base /my-app/`:
the router takes Vite's base as its basepath. GitHub Pages has no rewrites; copy `index.html` to
`404.html` at the site root, as the coreloom-ui repo does for its demo.
