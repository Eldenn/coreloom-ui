# Changelog

What changed in the `@coreloom` registry, release by release. Versions follow
[Semantic Versioning](https://semver.org): while the major is 0, a minor can change a
component's API; each entry says what to do under **Upgrading**.

Installed components are your code: `shadcn add` won't touch them unless you pass
`--overwrite`. Read the release before overwriting, and diff with `git` afterwards.

The `@coreloom` namespace (`https://eldenn.github.io/coreloom-ui/r/{name}.json`) serves the
latest `main`. Every release is also tagged `vX.Y.Z` and published on GitHub Releases with its
registry attached, so a project can pin one by pointing the namespace there in
`components.json` (dependencies between items resolve through the same namespace):

```json
"registries": { "@coreloom": "https://github.com/Eldenn/coreloom-ui/releases/download/v0.6.0/{name}.json" }
```

## [Unreleased]

### Added

- The starter runs as a live demo at https://eldenn.github.io/coreloom-ui/starter/, deployed with
  Storybook. It honours Vite's `base` as the router's basepath, so it also works under a sub-path.
- `CardTitle` takes `asChild` to render your own heading element with the card title's style.

### Fixed

- `LoginForm`, `SignupForm` and `VerifyForm` title the page with an `<h1>` (it was a `<div>`), so
  screen-reader users can find it from the headings list.
- Starter: the dashboard's demo activity follows the app's language.

## [0.6.0] - 2026-10-29

### Added

- **Starter** (`starter/`): a Vite + React app on TanStack Router (file routes), TanStack Query
  and TanStack Form, with the Coreloom components, providers, theme script, English and French,
  and these screens wired: sign in, dashboard, projects (filters in the route's search params),
  project detail, settings, 404 and error. Demo data is local; no API. Start one with
  `pnpm dlx degit Eldenn/coreloom-ui/starter my-app`.
- **Interaction tests** in CI (`tests/interactions.spec.ts`): keyboard and pointer behaviour of
  the inputs, the form kit, the data list's URL state, the onboarding wizard, the theme menu,
  dialogs and menus, run against the built Storybook next to the a11y and visual tests. The
  starter is built in CI and tested end to end, with axe on every screen in both themes.
- `@coreloom/link`: `CoreloomLinkProvider` hands the blocks your router's link, so the sidebar,
  breadcrumbs, settings nav, auth and error pages navigate client-side (TanStack Router, Next.js…).
  Without a provider they render a plain `<a>`, as before.
- `CHANGELOG.md` and the **Release** workflow: pushing a `v*` tag checks the version, then
  publishes a GitHub release with this file's notes and the registry JSON attached.

### Changed

- `FileUpload` sizes read "78 B" / "2.3 MB" ("78 o" / "2,3 Mo" in French) instead of "78 byte".

### Fixed

- Next.js: a server component passing the same icon element twice (two nav items with
  `<HomeIcon />`) made the build fail with "Element type is invalid". The blocks now render any
  icon that isn't a component as a node.

### Upgrading

- Blocks now import `@/lib/link`: re-install them with `--overwrite` (or
  `pnpm dlx shadcn@latest add @coreloom/link`). Next.js: `<CoreloomLinkProvider component={Link}>`
  with `Link` from `next/link`, in your client providers.

<!-- 0.1.0 to 0.5.0 predate the release workflow and have no tags. -->

## [0.5.0] - 2026-10-29

### Added

- Components: `DateRangePicker` (two months, shortcuts), `TagsInput`, `FileUpload` (drop zone,
  thumbnails, progress, type / size / count checks) and `Stepper`.
- Form kit fields: `DateRangeField`, `TagsField`, `FileField`.
- Blocks: `dashboard` (stat grid, trend chart, activity feed), `data-list` (search, faceted
  filters, pagination, state in the URL), `pricing` (monthly / yearly), `onboarding`
  (multi-step wizard) and `error-pages` (404, 500, maintenance).
- `ThemeMenu`: Light, Dark or System; System follows `prefers-color-scheme` live.

### Changed

- The app shell's header uses `ThemeMenu` instead of `ThemeToggle`.
- `useTheme()` returns `{ theme, preference, setTheme, toggleTheme }`; `preference` can be
  `"system"`.

### Upgrading

- Replace the anti-flash script in `index.html` / the root layout with the new one from the
  getting-started guide, which also handles `"system"`.

## [0.4.0] - 2026-10-29

### Added

- `@coreloom/i18n`: `CoreloomI18nProvider` and `useCoreloomI18n()`. Every built-in string
  (labels, placeholders, screen-reader text, validation messages) in English and French,
  overridable per string; dates follow the date-fns locale.
- Next.js App Router support, verified with a production build: blocks accept icons as elements
  (`icon: <HomeIcon />`) so server components can pass them.

### Upgrading

- Components now read their strings from the i18n context; English is used without a provider.
  Re-install with `--overwrite` to get `src/lib/i18n.tsx`.

## [0.3.0] - 2026-10-29

### Added

- `@coreloom/form`: TanStack Form kit (`useAppForm`) with text, textarea, select, combobox,
  date, radio, checkbox, switch and one-time-code fields, a submit button and form-level errors;
  Standard Schema validation (zod).
- CI tests: axe on every story (dark, light, French) and screenshots of every story compared
  with baselines from the **Visual baselines** workflow. Pages deploy only when they pass.

### Changed

- The `auth` and `settings` blocks use the form kit, with validation and a submitting state.

## [0.2.0] - 2026-10-29

### Changed

- Accessibility pass: token contrasts raised to WCAG AA (muted text, strong borders, focus ring,
  accent and status colours in light), every story axe-clean.

## [0.1.0] - 2026-10-29

### Added

- The registry: theme (tokens, fonts, Tailwind mapping), 54 components on shadcn/ui (Radix) and
  the blocks `app-shell`, `auth`, `settings`, `marketing` and `docs`.
- Storybook with a theme switch and the accessibility panel, published on GitHub Pages.

[Unreleased]: https://github.com/Eldenn/coreloom-ui/compare/v0.6.0...HEAD
[0.6.0]: https://github.com/Eldenn/coreloom-ui/releases/tag/v0.6.0
