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
| `src/styles/accents.css` | Accent presets (blue, violet, amber, rose) on `<html data-accent>`, generated and contrast-checked by `build/gen-accents.py`. |
| `src/components/ui/*.tsx` | 62 components: accordion, alert, alert-dialog, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, combobox, command, context-menu, data-table, date-picker, date-range-picker, dialog, drawer, dropdown-menu, empty, field, file-upload, form (TanStack Form), hover-card, icon, input, input-otp, item, kbd, label, menubar, money-input, multi-select, navigation-menu, pagination, phone-input, popover, progress, radio-group, resizable, rich-text-editor (+ rich-text-field), scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner (Toaster), spinner, stepper, switch, table, tabs, tags-input, textarea, toggle, toggle-group, tooltip. shadcn's code and APIs, Coreloom's look. |
| `src/components/*.tsx` | Block parts, installed with their block: `app-shell` (app-shell, app-sidebar, nav-user, app-header, stat-card), `auth` (auth-layout, login-form, signup-form, verify-form), `settings` (settings-layout, settings-section), `marketing` (hero, feature-grid, faq, cta-section), `docs` (docs-layout, docs-toc, code-block, component-preview), `dashboard` (dashboard, stat-card), `data-list`, `pricing`, `onboarding`, `error-pages` (error-page), `notifications`, `team`, `billing`, `kanban`, `event-calendar`; shared: theme-toggle, command-menu, copy-button, site-header, site-footer. |
| `src/lib/i18n.tsx`, `i18n-es.tsx`, `i18n-de.tsx` | `CoreloomI18nProvider` and `useCoreloomI18n()`: every built-in string (labels, placeholders, screen-reader text, validation messages) in English and French, overridable per string; Spanish and German as separate items. Installed with the components that use it. |
| `src/hooks/use-mobile.ts` | `useIsMobile()` — below 768px (`--breakpoint-md`) the sidebar turns into a sheet. Installed with `@coreloom/sidebar`. |
| `registry.json` → `public/r/*.json` | The registry. `pnpm registry:build` regenerates `public/r`. |
| `starter/` | A Vite + TanStack Router / Query / Form app built with the registry (see below). Its copies of the components are refreshed by `pnpm starter:sync`; CI fails if they drift, then builds and tests it. |
| `CHANGELOG.md` | What changed per release. Tag `vX.Y.Z` (matching `package.json`) to publish a GitHub release with the registry attached. |
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
   pnpm dlx shadcn@latest add @coreloom/app-shell   # or auth, settings, marketing, docs, dashboard,
                                                   # data-list, pricing, onboarding, error-pages,
                                                   # notifications, team, billing, kanban, event-calendar
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
4. Wrap the app once in `<TooltipProvider>` if you use tooltips, and render one `<Toaster />` at the root if you use toasts (`import { toast } from "@/components/ui/sonner"`). Themes: `<ThemeMenu />` /
   `<ThemeToggle />` from `@coreloom/theme-toggle` (Light, Dark or System, saved in `localStorage`),
   or set `document.documentElement.dataset.theme = "light"` yourself. The getting-started guide has
   the one-line `<head>` script that applies the saved choice before the first paint.

### Or start from the starter

[`starter/`](./starter) is a ready app on Vite + TanStack Router, Query and Form with every
component installed, the providers wired, English and French, and sign-in, dashboard, projects,
settings and error screens. No backend needed (live demo: https://eldenn.github.io/coreloom-ui/starter/):

```bash
pnpm dlx degit Eldenn/coreloom-ui/starter my-app && cd my-app && pnpm install && pnpm dev
```

### Router links

Blocks render their links with `AppLink` (`@coreloom/link`). Give them your router's link once and
they navigate without reloading: `<CoreloomLinkProvider component={Link}>` (Next.js `Link` as is;
TanStack Router: see `starter/src/components/router-link.tsx`).

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
- No hard-coded user-facing text: read it from `useCoreloomI18n().messages`, add the key to both `en`
  and `fr` in `src/lib/i18n.tsx`, and let a prop override it. Storybook's Language toolbar switches
  the stories to French; the a11y tests run in French too.
- Forms use [TanStack Form](https://tanstack.com/form) through `@coreloom/form`: `useAppForm` comes with
  Coreloom field components (`field.TextField`, `SelectField`, `ComboboxField`, `DateField`,
  `RadioGroupField`, `TextareaField`, `CheckboxField`, `SwitchField`, `OTPField`) and `form.SubmitButton` /
  `form.FormErrors`. Validate with any Standard Schema (zod, valibot) on change; errors show once a field
  has been left or the form submitted.

Brand rules, token usage and per-component guidelines live in the Coreloom UI design system.

## Develop and release

The repo uses pnpm (version pinned in `package.json` → `packageManager`; `corepack enable` picks it up).
`pnpm-workspace.yaml` allows the two install scripts the build needs (esbuild, @parcel/watcher) and
only installs versions published at least 14 days ago.

```bash
pnpm install
pnpm typecheck           # library, stories and tests
pnpm storybook           # http://localhost:6006
pnpm registry:build      # → public/r/*.json (not committed; CI builds it)
pnpm storybook:build     # → public/storybook (not committed; CI builds it)
pnpm test:a11y           # axe on every story, dark and light (needs the Storybook build)
pnpm test:visual         # screenshots of every story, compared with tests/__screenshots__
```

### Tests

Every push and pull request runs `pnpm test` in the Playwright container (`.github/workflows/registry.yml`);
`main` only deploys when it passes.

- **Accessibility:** axe (WCAG 2.0–2.2 A / AA and best practices) on every story in both themes. A new
  component or story must come with no violations.
- **Visual:** a full-page screenshot of every story in both themes, with a frozen clock and no outside
  network. Screenshots depend on the OS's font rendering, so the baselines in `tests/__screenshots__` come
  from CI, not from a laptop: after an intended visual change (or to create them the first time), run the
  **Visual baselines** workflow on your branch (Actions → Visual baselines → Run workflow). It commits the
  new PNGs; review them in the PR diff. Until baselines exist, the visual tests are skipped.
- **Interactions:** `tests/interactions.spec.ts` drives components and blocks with the keyboard and pointer
  (focus traps, filtering, tags, file checks, form errors and busy states, URL state, theme). Add a case when a
  component gains behaviour.
- **Starter:** `tests/starter.spec.ts` runs the built starter end to end (sign-in, navigation, filters, forms,
  404, language, theme) and axe on every screen in both themes. CI builds the starter first; locally,
  `pnpm --dir starter build` before `pnpm test`, or the starter tests are skipped.
- A failed run uploads the Playwright report (diffs, traces) as the `playwright-report` artifact.
- Tag a story `no-test` to leave it out (for stories that can't be deterministic).

Push to `main` and the workflow republishes both to GitHub Pages: Storybook under `/storybook/`
(https://eldenn.github.io/coreloom-ui/ redirects there), the registry under `/r/`. Add a story in `stories/` for
every new component or block; the Theme toolbar switches `data-theme`, and the Accessibility panel
runs axe on the story.

### Releases

1. Move the `[Unreleased]` notes in `CHANGELOG.md` under a new `## [x.y.z] - date` heading and set
   `"version"` in `package.json` to match.
2. Commit, push `main`, then `git tag vx.y.z && git push origin vx.y.z`.

The **Release** workflow checks that the tag, `package.json` and the CHANGELOG agree, then publishes a
GitHub release with the notes and the registry's JSON files. Projects can pin it in `components.json`
(`"@coreloom": "https://github.com/Eldenn/coreloom-ui/releases/download/vx.y.z/{name}.json"`) and update
with `pnpm dlx shadcn@latest add @coreloom/<name> --overwrite` (or `--diff` first to review).

## License

MIT — see `LICENSE`. The components are derived from shadcn/ui (MIT, © 2023 shadcn).
