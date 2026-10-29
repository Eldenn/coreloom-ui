# @coreloom/ui

Coreloom UI's components, built on [shadcn/ui](https://ui.shadcn.com) (Radix primitives,
Tailwind CSS v4) and themed with the Coreloom tokens. It ships as a **shadcn registry**:
projects install components with the shadcn CLI and own the code, as with any shadcn
component.

## What's inside

| Path | What |
|---|---|
| `src/styles/tokens.css` | The Coreloom tokens — colors per theme (dark default, light via `<html data-theme="light">`), type, spacing, radii, shadows, z-index, breakpoints, container widths. Copied from the design system's compiled `tokens.css` with `pnpm tokens:sync <path>` (drops the `@font-face` rules). |
| `src/styles/fonts.css` | Geist, Space Grotesk and JetBrains Mono from Fontsource (variable files), bundled by the app. Part of `@coreloom/theme`. |
| `src/styles/theme.css` | The shadcn layer: maps Tailwind / shadcn color utilities (`bg-background`, `bg-primary`, `text-muted-foreground`, `border-input`, `ring-ring`…) onto the Coreloom tokens, adds Coreloom-only utilities (`bg-inset`, `text-fg-secondary`, `bg-primary-subtle`, `shadow-glow`, `bg-scrim`…) and makes `dark:` follow `data-theme`. |
| `src/styles/globals.css` | Imports Tailwind, `tw-animate-css`, the tokens and the theme. |
| `src/components/ui/*.tsx` | 53 components: accordion, alert, alert-dialog, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, combobox, command, context-menu, data-table, date-picker, dialog, drawer, dropdown-menu, empty, field, hover-card, icon, input, input-otp, item, kbd, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner (Toaster), spinner, switch, table, tabs, textarea, toggle, toggle-group, tooltip. shadcn's code and APIs, Coreloom's look. |
| `src/components/*.tsx` | Block parts, installed with their block: `app-shell` (app-shell, app-sidebar, nav-user, app-header, stat-card), `auth` (auth-layout, login-form, signup-form, verify-form), `settings` (settings-layout, settings-section), `marketing` (hero, feature-grid, faq, cta-section), `docs` (docs-layout, docs-toc, code-block, component-preview); shared: theme-toggle, command-menu, copy-button, site-header, site-footer. |
| `src/hooks/use-mobile.ts` | `useIsMobile()` — below 768px (`--breakpoint-md`) the sidebar turns into a sheet. Installed with `@coreloom/sidebar`. |
| `registry.json` → `public/r/*.json` | The registry. `pnpm registry:build` regenerates `public/r`. |
| `stories/`, `.storybook/` | Storybook 10 (React + Vite): a story for every component and block, the theme toolbar (dark / light) and the accessibility panel. Published at https://eldenn.github.io/coreloom-ui/. |
| `templates/` | The design system's starting points — docs page, landing page, app shell — as single HTML pages on the artifact bundle. Read them for layout patterns; in an app, rebuild them from the installed components. |
| `build/`, `preview/` | Builds the design-system artifact's bundle (all components on one global, React 19 as browser scripts, compiled Tailwind) from the same sources. |

The theme deliberately declares **no** shadcn variable names (`--background`, `--primary`…):
Coreloom already uses `--accent` (cyan), `--border` and `--radius-*` for its own tokens, so the
mapping lives in `@theme inline` instead. `bg-accent` is shadcn's hover surface
(`surface-hover`); Coreloom's cyan is `bg-primary`.

## Use it in an app

The registry is built and published to GitHub Pages on every push to `main`
(`.github/workflows/registry.yml`), at `https://eldenn.github.io/coreloom-ui/r/`.

1. In the consuming project (or the monorepo's shared `ui` package), add the namespace once:

   ```bash
   pnpm dlx shadcn@latest registry add @coreloom=https://eldenn.github.io/coreloom-ui/r/{name}.json
   ```

   which writes this to `components.json`:

   ```json
   "registries": { "@coreloom": "https://eldenn.github.io/coreloom-ui/r/{name}.json" }
   ```

2. Install:

   ```bash
   pnpm dlx shadcn@latest add @coreloom/all        # theme, utils and every component
   pnpm dlx shadcn@latest add @coreloom/dialog     # or one at a time (pulls its dependencies)
   ```

   Whole screens install as blocks:

   ```bash
   pnpm dlx shadcn@latest add @coreloom/app-shell   # or auth, settings, marketing, docs
   ```

3. In `globals.css`, after `@import "tailwindcss";`:

   ```css
   @import "tw-animate-css";
   @import "./coreloom/fonts.css";
   @import "./coreloom/tokens.css";
   @import "./coreloom/theme.css";
   ```

   and remove the default shadcn color block (`:root { --background: … }`, `.dark { … }`,
   `@theme inline { --color-… }`) if `shadcn init` created one.
4. Wrap the app once in `<TooltipProvider>` if you use tooltips, and render one `<Toaster />` at the root if you use toasts (`import { toast } from "@/components/ui/sonner"`). Toggle themes with
   `document.documentElement.dataset.theme = "light" | "dark"`.

In a monorepo, install into the shared `ui` package (its own `components.json` with the
`@coreloom` registry) and import from there, the way shadcn's monorepo template does.

## Conventions

- Layers float on the `z-*` ladder: `z-(--z-modal)` for dialogs and sheets, `z-(--z-popover)` for
  Select lists, popovers and dropdown menus (they open above dialogs), `z-(--z-toast)`, then `z-(--z-tooltip)` on
  top. Never a raw z-index.
- Focus is always the 3px `accent-ring` (`ring-[3px] ring-ring`, 3:1 on every surface); invalid fields use
  `aria-invalid`, which turns borders `danger`. Field outlines use `border-input` (`border-strong`, 3:1),
  placeholders `text-muted-foreground`; `text-faint-foreground` is for disabled text only.
- `theme.css` honors `prefers-reduced-motion`: transitions and enter / exit animations finish at once.
- Variant names follow shadcn (`default`, `secondary`, `outline`, `ghost`, `destructive`,
  `link`), plus Coreloom's `success` / `warning` on Badge and Alert and `accent` on Card.
- Components target React 19 (refs as props), like current shadcn.

Brand rules, token usage and per-component guidelines live in the Coreloom UI design system.

## Develop and release

The repo uses pnpm (version pinned in `package.json` → `packageManager`; `corepack enable` picks it up).
`pnpm-workspace.yaml` allows the two install scripts the build needs (esbuild, @parcel/watcher) and
only installs versions published at least 14 days ago.

```bash
pnpm install
pnpm typecheck           # library + stories
pnpm storybook           # http://localhost:6006
pnpm registry:build      # → public/r/*.json (not committed; CI builds it)
pnpm storybook:build     # → public/storybook (not committed; CI builds it)
```

The accessibility bar for a new component or story: no violations in the Accessibility panel, in both themes.

Push to `main` and the workflow republishes both to GitHub Pages: Storybook under `/storybook/`
(https://eldenn.github.io/coreloom-ui/ redirects there), the registry under `/r/`. Add a story in `stories/` for
every new component or block; the Theme toolbar switches `data-theme`, and the Accessibility panel
runs axe on the story. Tag releases (`git tag v0.1.0 && git push --tags`)
so projects can tell which version they installed — shadcn copies code, so updating a project
means running `pnpm dlx shadcn@latest add @coreloom/<name> --overwrite` (or `--diff` first to review).

## License

MIT — see `LICENSE`. The components are derived from shadcn/ui (MIT, © 2023 shadcn).
