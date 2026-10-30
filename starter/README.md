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
| Sign up | `src/routes/signup.tsx`, `verify.tsx` | `SignupForm`, then `VerifyForm` for the emailed code |
| Password reset | `src/routes/forgot-password.tsx`, `reset-password.tsx` | `ForgotPasswordForm`, then `ResetPasswordForm` on the emailed link (`?token=…`) |
| Overview | `src/routes/_app/index.tsx` | `StatGrid`, `TrendChart`, `ActivityFeed`, data from a route loader |
| Projects | `src/routes/_app/projects/index.tsx` | `useDataList` with search, filters and page in the route's typed search params; "New project" dialog (`?new=true`) |
| Project | `src/routes/_app/projects/$projectId.tsx` | Loader with `notFound()`, breadcrumb from loader data; notes in `RichTextEditor`, loaded with `React.lazy` so Tiptap downloads only here |
| Deployments | `src/routes/_app/deployments.tsx` | `DataTable` driven by the API (sort, search, pages) with the query in the URL |
| Settings | `src/routes/_app/settings.tsx` | `SettingsLayout` with one URL per section: a form, appearance (theme and `AccentPicker`), members, billing, notification switches, the danger zone |
| Assistant | `src/routes/_app/assistant.tsx` | `Chat` and `ConversationList`, the conversation in the URL (`?c=…`); answers streamed by `useDemoChat`, with reasoning, a tool call and approval for a rollback |
| Agents | `src/routes/_app/agents/` | `AgentList`, then `AgentEditor` and the agent's runs |
| Runs | `src/routes/_app/runs/` | `RunList`, then `RunTrace` for one run |
| Playground | `src/routes/_app/playground.tsx` | `Playground`, variants streamed side by side |
| Knowledge | `src/routes/_app/knowledge.tsx` | `KnowledgeBase` with an indexing queue the query polls, `RetrievalTest` |
| 404 and errors | `src/routes/__root.tsx` | `NotFoundPage`, `ServerErrorPage` with retry |

Around them: the app shell (sidebar, breadcrumbs, ⌘K palette, notifications, theme menu, language
menu), English and French, light / dark / system theme and the accent without a flash on load, and
the TanStack devtools in development.

## AI pages

Nothing calls a model: `src/lib/ai-api.ts` holds agents, runs, documents and conversations in
memory, and `src/lib/use-demo-chat.ts` simulates an answer (it thinks, calls a tool, streams text).
That hook has the AI SDK's `useChat` shape, so moving to a real model is a swap in
`src/routes/_app/assistant.tsx`:

```tsx
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"

const chat = useChat({ id, messages: initialMessages, transport: new DefaultChatTransport({ api: "/api/chat" }) })

// The SDK takes attachments as a FileList: wrap the File[] the composer hands over.
const onSend = ({ text, files }: { text: string; files: File[] }) => {
  const list = new DataTransfer()
  files.forEach((file) => list.items.add(file))
  void chat.sendMessage({ text, files: list.files })
}
// <Chat messages={chat.messages} status={chat.status} error={chat.error} onSend={onSend} onStop={chat.stop}
//       onRegenerate={chat.regenerate} onToolApprovalResponse={chat.addToolApprovalResponse} … />
```

The endpoint is yours (`streamText(…).toUIMessageStreamResponse()` on your server); the blocks
only render what it streams. Replace the functions in `ai-api.ts` with calls to your backend the
same way as `api.ts`.

## How it fits together

- **Routes** live in `src/routes/`; the Vite plugin generates `src/routeTree.gen.ts` (committed so
  `tsc` works before the first `dev`). `_app.tsx` is the signed-in layout: its `beforeLoad` sends
  signed-out visitors to `/login?redirect=…`.
- **Data**: `src/lib/api.ts` is the only file that knows where data comes from. Today it is an
  in-memory demo with a short delay; replace each function's body with a `fetch` to your backend.
  `src/lib/queries.ts` holds the query options: loaders call `ensureQueryData`, components
  `useSuspenseQuery`, mutations invalidate by key.
- **Auth**: `src/lib/auth.ts` keeps a pretend session in `localStorage`, and pretends to send the
  sign-up code and the reset link. Keep its shape (`auth.user`, `signIn`, `signUp`, `verify`,
  `requestPasswordReset`, `resetPassword`, `signOut`, `useAuth()`) and plug in your real auth. Each
  screen states its demo rule underneath (e.g. any code but 000000).
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
