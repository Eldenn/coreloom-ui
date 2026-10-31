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
"registries": { "@coreloom": "https://github.com/Eldenn/coreloom-ui/releases/download/v0.8.0/{name}.json" }
```

## [0.8.0] - 2026-10-31

### Added

- AI components: `PromptInput` (Enter sends, Shift + Enter breaks the line, Send becomes Stop while
  streaming, attachments), `Markdown` (model output with GFM tables, task lists and code blocks
  with Copy; raw HTML skipped), `Reasoning` (thinking folded under "Thought for N s") and
  `ToolCall` (a tool's state, input, output or error, and Allow / Deny when it needs approval).
- AI blocks: `ai-chat` (`Chat` with reasoning, tool calls, sources, copy, regenerate, feedback,
  a live log and stick-to-bottom scrolling; `ConversationList` with search, day groups, rename and
  delete), `ai-agents` (`AgentList`, `AgentEditor` with `{{variables}}` and ask-first tools),
  `ai-runs` (`RunList`, `RunTrace` waterfall), `ai-playground` and `ai-knowledge`
  (`KnowledgeBase`, `RetrievalTest`). `@coreloom/ai` types read the AI SDK's `UIMessage` parts as
  they are (checked against `ai` 7 in the unit tests); nothing depends on the SDK or calls an API.
- Starter: Assistant, Agents, Runs, Playground and Knowledge pages on in-memory data, with a
  simulated `useChat` (the `@coreloom/demo-chat` item, `src/hooks/use-demo-chat.ts`); the README
  shows the swap to `@ai-sdk/react`.
- `InlineCitation`: numbered source pills in a model's text; hover or focus shows the source,
  click, tap or Enter keeps it open. `Markdown` takes `sources` and turns `[1]` markers into
  citations (not in code or links, and safe while streaming).
- AI chat: edit a sent message (`onEdit`; Escape cancels, ⌘/Ctrl + Enter saves) and switch between
  versions of a message (`branches` + `onBranchChange`, "‹ 2 / 3 ›", announced).
- `ModelPicker` (with `ModelList`, and `ModelField` for the form kit as its own item): a searchable list of models
  grouped by provider, with context window, price per million tokens and capabilities.
  `ContextMeter`: how full the context window is, as a ring or bar with the token breakdown and
  estimated cost. `AiModel` gains optional `contextWindow`, `pricing`, `capabilities`, `disabled`;
  new `AiUsage` and helpers (`formatTokens`, `estimateCost`, `contextLevel`…).
- `ai-chat-widget` block: the support bubble in a page's corner — a launcher with an unread count
  and a greeting, opening the Chat in a card (a full-screen sheet on phones).
- `RichTextEditor` takes an optional `ai` prop: an AI button and ⌘/Ctrl + J open a panel to rewrite
  or write with your own `onRequest` (quick actions, streamed preview with Stop, Replace / Insert
  below / Try again). Answers are inserted as text, never HTML.
- `CommandMenu` and `AppShell` take `onAskAi(query)`: "Ask AI: “…”" comes first in the ⌘K results.
  `CommandDialog` takes a cmdk `filter`.
- Starter: the assistant has a model picker, a context meter, inline citations and editable
  messages; "Ask AI" in ⌘K opens it with the question; project notes have the editor's AI panel.
- Storybook: a page per AI component with Controls, frozen streaming states (waiting, thinking,
  answering), attachments and document sources, a tool result drawn as UI, empty states, a failing
  playground variant, a running trace, French versions, and a "With the AI SDK" guide.
- New logo: Coreloom's ginger cat, redrawn on a 256 grid from three shapes (head, eyes cut out, cyan
  slit pupils) so it holds at 16 px and in one colour; dark, light, one-colour, small-size and tile
  versions with lockups. Storybook's sidebar and tab and the starter's brand and favicon use it.
- `DataTable` `virtual`: thousands of rows in a fixed-height box, only the visible ones rendered
  (TanStack Virtual), header pinned, `aria-rowcount` / `aria-rowindex` for screen readers.
- `VirtualList`: a long list with measured item heights and load-more at the end, made for
  `useInfiniteQuery`.
- Guidelines in Storybook: a page per component and block (when to use it, what it takes, its
  rules, a live example), from the design system's guides; CI checks each one renders.
- Design tokens in the DTCG format (2025.10) at https://eldenn.github.io/coreloom-ui/tokens/ and on
  each release: base, dark and light files plus a resolver, for Figma, Style Dictionary or native
  apps. `pnpm tokens:dtcg` writes them; unit tests check every colour against `tokens.css`.
- `ForgotPasswordForm` and `ResetPasswordForm` in the `auth` block. The first confirms without
  saying whether the account exists and moves focus to its new heading; the second checks the two
  passwords against each other and hands the account's email to password managers.
- `AccentPicker` and `useAccent()` in `@coreloom/theme-toggle`: one swatch per preset, a radio
  group, saved in `localStorage("accent")`. `accents.css` gains a `cyan` preset that brings the
  default back inside an element with another accent.
- Starter: sign-up with an emailed code, forgot / reset password, Settings → Appearance (theme and
  accent, applied before the first paint), and project notes in the rich text editor, loaded with
  `React.lazy` so Tiptap downloads only on project pages.
- `@coreloom/demo-chat`: `useDemoChat`, a stand-in for the AI SDK's `useChat` that simulates a
  model in the browser (reasoning, a tool call, an approval, a streamed answer citing a source), to
  prototype AI screens with the Chat block before there is a backend. Configurable `script` (tool,
  source, approval tool, speed). The starter now installs it from the registry.
- For AI assistants: `llms.txt` (every item with its install name and guide), `llms-full.txt`
  (all guides in one file) and `guides/*.md`, published with the site; the README shows how to turn
  on shadcn's MCP server so Claude Code, Cursor or VS Code can install `@coreloom/*` items. The
  starter ships `.mcp.json`.
- `RichTextEditor`: with `ai` set, typing `/` at the start of a line or after a space opens a menu of AI commands
  (Ask AI…, Continue writing and the quick actions), filtered as you type, keyboard-driven and
  announced to screen readers. Choosing opens the AI panel where the slash was; **Insert here**
  puts the answer there (and is the focused button; **Replace all** stays a click away). The menu
  works inside dialogs and sheets; Enter right after a lone `/` is a plain new line. Turn it off
  with `ai.slashCommand: false`. Continue writing sends the `'continue'` action, whose `text` is the
  document before the cursor: handle it in your `onRequest`.
- Theme generator: from one brand colour, `generateAccent(hex)` (`@coreloom/accent`) builds the
  whole accent family for both themes, checks every contrast pairing (adjusting lightness when a
  check fails) and writes a `brand.css` to import after `accents.css` (`data-accent="<name>"`).
  Try it on the Storybook page Foundations → Theme generator, or run
  `pnpm brand "#ff5a1f" --name orange > brand.css`.
- Repository: unit tests (Vitest, `pnpm test:unit`) for the parsers and formatters (money, phone,
  typed dates, file sizes, emails); visual tests of every block at phone width (390 px); weekly
  Renovate pull requests, nothing younger than 14 days; and the **Visual baselines** workflow now
  starts **Registry & Storybook** after committing the screenshots.

### Changed

- Light theme: `accent` `#009f96` → `#00968d` and `accent-fg` `#007270` → `#006f6c`. The accent
  fill was 2.9:1 on `surface-inset`, under the 3:1 non-text minimum; it is now 3.1:1 or more on
  every surface. The change is barely visible.

### Fixed

- AI blocks: `KnowledgeBase` with no documents says so instead of showing an empty table; ids in
  `AgentEditor`, `RunTrace`, `Playground` and `RetrievalTest` come from `useId`, so two on a page
  don't clash; a running trace step says "Running" to screen readers.
- `ToolCall`: a `renderOutput` that returns `undefined` falls back to JSON (the chat used to show
  nothing), a drawn result shows unfolded, long tool names wrap, and its Input / Output / Error
  labels are no longer headings (they broke the page's heading order).
- `Markdown`: a code block that scrolls sideways takes focus, so keyboard users can scroll it;
  footnotes are translated, labelled with a paragraph instead of a heading, get ids of their own per
  block, and in-page links no longer open a new tab.
- AI chat: source links are limited to http(s) and mailto (others show as text).
- Starter: the French workspace URL hint was in English.

### Upgrading

- The new items read new strings in every locale: re-install `@coreloom/i18n` (and
  `@coreloom/i18n-es` / `@coreloom/i18n-de` if you use them) with `--overwrite` first, then add them.
- Re-install `@coreloom/theme` with `--overwrite` for the new light accent and the `cyan` preset,
  then update your own visual baselines if you keep screenshots.

## [0.7.0] - 2026-10-30

### Added

- `MultiSelect`: several values from a list, chips in the trigger, a searchable checklist with
  select all / clear and an optional maximum. Form field: `MultiSelectField`.
- `MoneyInput`: an amount typed the locale's way ("1 234,50"), the currency symbol where the locale
  puts it, a `number | null` value rounded to the currency's decimals. Form field: `MoneyField`.
- `PhoneInput`: a searchable country picker and the national number in its usual grouping; the
  value is E.164, `isValidPhone()` checks it. Form field: `PhoneField`.
- `DatePicker` `typing`: a text input that reads dates in the locale's order, with the calendar a
  button away; impossible dates are refused with the expected format. `DateField` passes it on.
- `DataTable` `server`: the API sorts, searches and pages; `query` / `onQueryChange` / `rowCount`
  / `loading`. Starter: a Deployments page keeps that query in the URL and fetches it with
  TanStack Query.
- `RichTextEditor`: Tiptap with a Coreloom toolbar (marks, headings, lists, quote, code, links,
  undo), Markdown shortcuts, an HTML value; `RichTextField` for the form kit lives beside it so
  `@coreloom/form` doesn't pull in Tiptap. The form kit now exports `useFieldMeta`,
  `VerticalShell` and `describedBy` for custom fields.
- Blocks: `notifications` (bell, unread count, all / unread, mark read), `team` (members, roles,
  invites with checked emails, confirmed removal), `billing` (plan, usage meters, payment method,
  invoices), `kanban` (drag and drop with pointer or keyboard, announced, plus a Move to menu; WIP
  limits) and `event-calendar` (month grid, agenda on phones, locale week start).
- Starter: notifications in the header (TanStack Query, optimistic mark-as-read), and Members and
  Billing settings sections.
- Accent presets: `accents.css` (part of `@coreloom/theme`) adds blue, violet, amber and rose,
  set with `<html data-accent>`; every pairing is checked in both themes by `build/gen-accents.py`
  and by axe in CI. Storybook has an Accent toolbar.
- Spanish and German: `@coreloom/i18n-es` and `@coreloom/i18n-de`, passed as `messages`. Storybook's
  Language toolbar has them, and CI runs axe in both.
- The starter runs as a live demo at https://eldenn.github.io/coreloom-ui/starter/, deployed with
  Storybook. It honours Vite's `base` as the router's basepath, so it also works under a sub-path.
- `CardTitle` takes `asChild` to render your own heading element with the card title's style.

### Fixed

- `LoginForm`, `SignupForm` and `VerifyForm` title the page with an `<h1>` (it was a `<div>`), so
  screen-reader users can find it from the headings list.
- Starter: the dashboard's demo activity follows the app's language.

### Upgrading

- The new components read new strings: re-install `@coreloom/i18n` with `--overwrite` first
  (it holds English and French), then add them.
- Re-install `@coreloom/auth` with `--overwrite` for the `<h1>` titles, and `@coreloom/card` for
  `CardTitle asChild`.

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

[0.8.0]: https://github.com/Eldenn/coreloom-ui/releases/tag/v0.8.0
[0.7.0]: https://github.com/Eldenn/coreloom-ui/releases/tag/v0.7.0
[0.6.0]: https://github.com/Eldenn/coreloom-ui/releases/tag/v0.6.0
