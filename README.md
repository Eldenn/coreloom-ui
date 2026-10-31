<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="brand/logo/coreloom-horizontal-dark.svg">
    <img src="brand/logo/coreloom-horizontal-light.svg" alt="Coreloom" height="72">
  </picture>
</p>

<p align="center">
  React components and blocks on <a href="https://ui.shadcn.com">shadcn/ui</a>, in the Coreloom look.<br>
  Installed with the shadcn CLI, so the code is yours.
</p>

<p align="center">
  <a href="https://eldenn.github.io/coreloom-ui/">Storybook</a> ·
  <a href="https://eldenn.github.io/coreloom-ui/starter/">Starter demo</a> ·
  <a href="https://eldenn.github.io/coreloom-ui/r/registry.json">Registry</a> ·
  <a href="https://eldenn.github.io/coreloom-ui/tokens/coreloom.resolver.json">Design tokens</a> ·
  <a href="./CHANGELOG.md">Changelog</a>
</p>

---

- **70 components** on Radix and Tailwind CSS v4: forms, overlays, navigation, tables (sorting, server-driven
  or virtual), date, money and phone inputs, a rich text editor with an optional AI panel, and AI pieces
  (prompt, Markdown output with citations, reasoning, tool calls, model picker, context meter).
- **Blocks** for whole screens: app shell, auth, settings, dashboard, data list, pricing, onboarding, error
  pages, notifications, team, billing, kanban, calendar, marketing and docs.
- **AI blocks**: chat with conversation history, edits and branches, a floating chat widget, agent
  management, runs and traces, a model playground and a knowledge base. They read the AI SDK's
  `UIMessage` as is, without depending on it or on any API.
- **Dark and light** themes, four accent presets, every pairing WCAG AA. Axe runs on every story in CI.
- **English, French, Spanish and German** for every built-in string.
- **Forms** on TanStack Form with zod (or any Standard Schema).
- **A starter** on Vite + TanStack Router, Query and Form, with every screen wired and no backend needed.

## Quick start

Add the registry to your project once:

```bash
pnpm dlx shadcn@latest registry add @coreloom=https://eldenn.github.io/coreloom-ui/r/{name}.json
```

Install what you need:

```bash
pnpm dlx shadcn@latest add @coreloom/all         # theme, fonts, utils and every component
pnpm dlx shadcn@latest add @coreloom/dialog      # or one at a time (pulls its dependencies)
pnpm dlx shadcn@latest add @coreloom/app-shell   # or a whole screen: auth, settings, dashboard…
```

At the top of your global CSS, replacing the colour block `shadcn init` wrote:

```css
@import 'tailwindcss';
@import 'tw-animate-css';
@import './coreloom/fonts.css';
@import './coreloom/tokens.css';
@import './coreloom/theme.css';
@import './coreloom/accents.css'; /* optional: accent presets */
```

Then wrap the app in `<TooltipProvider>` and render one `<Toaster />`. Using a router? Hand the blocks
its link once with `<CoreloomLinkProvider component={Link}>` (Next.js's `Link` fits as is; for TanStack
Router, copy [`router-link.tsx`](./starter/src/components/router-link.tsx)). The starter shows the rest
wired up: the theme script in `index.html`, the language provider, the theme and accent menus.

### Or start from the starter

```bash
pnpm dlx degit Eldenn/coreloom-ui/starter my-app && cd my-app && pnpm install && pnpm dev
```

A Vite + TanStack Router / Query / Form app with sign-in, sign-up, password reset, dashboard, projects,
deployments, settings and error pages. Demo data is local; [`starter/README.md`](./starter/README.md) says
where to plug in your API.

### Pin a release

The namespace above follows `main`. To stay on one version, point it at a release:

```json
"registries": { "@coreloom": "https://github.com/Eldenn/coreloom-ui/releases/download/vX.Y.Z/{name}.json" }
```

Each release in the [changelog](./CHANGELOG.md) says what to do under **Upgrading**. Review with
`shadcn add … --diff` before `--overwrite`: installed files are yours.

### With AI assistants

[`llms.txt`](https://eldenn.github.io/coreloom-ui/llms.txt) lists every item with its install name and
a link to its guide (when to use it, props, accessibility rules);
[`llms-full.txt`](https://eldenn.github.io/coreloom-ui/llms-full.txt) has all the guides in one file.
Give either to your assistant as context.

To let Claude Code, Cursor or VS Code browse and install `@coreloom/*` items themselves, add the
namespace to `components.json` (as above) and turn on shadcn's MCP server in the app:

```bash
pnpm dlx shadcn@latest mcp init --client claude   # or cursor, vscode
```

Then ask in plain words: "add the Coreloom chat block and wire it to useChat", "which Coreloom
component is a date range picker?". The starter ships with the server configured (`.mcp.json`).

## What's in the repo

| Path                     | What                                                                                                 |
| ------------------------ | ---------------------------------------------------------------------------------------------------- |
| `src/components/ui/`     | The components. shadcn's code and APIs, Coreloom's look.                                             |
| `src/components/`        | Block parts, installed with their block (`auth` → `login-form.tsx`, `signup-form.tsx`…).             |
| `src/styles/`            | `tokens.css` (from the design system), `theme.css` (the shadcn mapping), `fonts.css`, `accents.css`. |
| `src/lib/`               | `i18n.tsx` (English and French), `i18n-es.tsx`, `i18n-de.tsx`, `link.tsx`, `utils.ts`.               |
| `registry.json`          | The registry's items. `pnpm registry:build` writes `public/r/`.                                      |
| `starter/`               | The starter app. `pnpm starter:sync` refreshes its copies of the components.                         |
| `stories/`               | Storybook: a story per component and block, and a Guidelines page for each.                          |
| `tests/`, `unit/`        | Playwright (a11y, visual, interactions, guidelines, starter) and Vitest.                             |
| `brand/logo/`            | The Coreloom logo: symbol, lockups, tile, one-colour versions and usage rules.                       |
| `build/`                 | Scripts: the design-system bundle, accent presets, DTCG tokens, release notes, starter sync.         |
| `preview/`, `templates/` | The design system's component cards and page templates.                                              |

## Conventions

- **No shadcn colour variables.** Coreloom already uses `--accent`, `--border` and `--radius-*` for its own
  tokens, so `theme.css` maps the utilities in `@theme inline`. `bg-primary` is the cyan; `bg-accent` is
  shadcn's hover surface.
- **Layers** use the `z-*` ladder (`z-(--z-modal)`, `z-(--z-popover)`, `z-(--z-toast)`, `z-(--z-tooltip)`),
  never a raw z-index.
- **Focus** is always the 3 px `ring-ring` (3:1 on every surface). Invalid fields set `aria-invalid`. Inputs
  outline in `border-input`. `text-faint-foreground` is for disabled text only.
- **Motion** respects `prefers-reduced-motion`.
- **Text** never hard-coded: read it from `useCoreloomI18n().messages`, add the key in every language, let
  a prop override it.
- **Variants** follow shadcn's names, plus `success` / `warning` on Badge and Alert and `accent` on Card.
- **React 19** (refs as props), like current shadcn.

## Develop

pnpm is pinned in `package.json` (`corepack enable`). `pnpm-workspace.yaml` only installs versions
published at least 14 days ago; Renovate opens dependency PRs on Mondays with the same rule.

```bash
pnpm install
pnpm storybook          # http://localhost:6006
pnpm format             # Prettier (format:check in CI)
pnpm lint               # ESLint, type-aware
pnpm typecheck          # library, stories and tests
pnpm test:unit          # Vitest
pnpm storybook:build    # then: pnpm test (Playwright)
pnpm --dir starter build   # include the starter in pnpm test
```

Adding a component: its file in `src/components/ui/`, an item in `registry.json`, a story in `stories/`, its
guide in `stories/guidelines/`, and a test when it has behaviour.

### CI

Every push and pull request runs the type check, the unit tests and Playwright on the built Storybook and
starter:

- **Accessibility:** axe on every story (dark, light, four languages, two accents) and every starter screen.
- **Visual:** a screenshot of every story in both themes, blocks also at phone width, compared with
  `tests/__screenshots__`. Baselines come from CI's container: after an intended visual change, run the
  **Visual baselines** workflow; it commits the new PNGs and re-runs the CI.
- **Interactions, guidelines and starter:** keyboard and pointer behaviour, every Guidelines page, and the
  starter end to end.

`main` deploys to GitHub Pages only when everything passes: Storybook, the registry (`/r/`), the design
tokens in the DTCG format (`/tokens/`) and the starter demo (`/starter/`).

### Release

1. Move `[Unreleased]` in `CHANGELOG.md` under `## [x.y.z] - date` and set `version` in `package.json`.
2. Push `main`, then `git tag vx.y.z && git push origin vx.y.z`.

The **Release** workflow checks the tag against `package.json` and the changelog, then publishes a GitHub
release with the notes, the registry and the tokens attached.

## License

MIT, see [`LICENSE`](./LICENSE). The components are derived from shadcn/ui (MIT, © 2023 shadcn). The
Coreloom logo isn't covered by the license: see [`brand/logo/README.md`](./brand/logo/README.md).
