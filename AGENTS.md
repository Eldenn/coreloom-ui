# AGENTS.md

How to work on Coreloom UI. Written for coding agents (and useful to people). Read it before changing
anything; the rules here are what CI and review enforce.

## What this project is

A React design system on shadcn/ui, shipped as a **shadcn registry** (`@coreloom/<item>`), with
Storybook as its documentation and a Vite starter app that uses it.

- **Front-end only.** Nothing in `src/` calls an API, a model or the network. Async behaviour is a
  callback the app provides (`onSubmit`, `onSearch(query) => Promise`, `onRequest(req) => AsyncIterable`).
  Demo data lives in stories and in the starter's in-memory `src/lib/*api.ts`.
- **Installed code is the user's code.** `shadcn add` copies files into apps; every file must read well
  on its own, without this repo around it.
- Stack: React 19, Tailwind CSS v4, Radix (`radix-ui`), TanStack Form / Table / Virtual / Query /
  Router (starter), Tiptap 3, Storybook 10, Playwright, Vitest, pnpm (version pinned in `package.json`).

## Map

| Path                                     | What                                                                                                                   |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `src/components/ui/`                     | Components (`registry:ui`). shadcn's code and APIs, Coreloom's look.                                                   |
| `src/components/`                        | Block parts (`registry:component`), installed with their block.                                                        |
| `src/lib/`                               | `i18n.tsx` (en + fr), `i18n-es.tsx`, `i18n-de.tsx`, `ai.ts` (AI SDK-shaped types and helpers), `link.tsx`, `utils.ts`. |
| `src/styles/`                            | `tokens.css` (generated from the design system — don't edit by hand), `theme.css`, `fonts.css`, `accents.css`.         |
| `registry.json`                          | Every item: files, npm `dependencies`, `registryDependencies`. The source of truth for what ships.                     |
| `stories/components/`, `stories/blocks/` | One story file per component (or group) and per block.                                                                 |
| `stories/guidelines/`                    | A guide per component and block: `Name.md` (the text) + `Name.mdx` (the Storybook page).                               |
| `tests/`                                 | Playwright: `a11y`, `visual`, `interactions`, `docs`, `starter`, `ai-*` specs; `stories.ts` helpers.                   |
| `unit/`                                  | Vitest: pure helpers (formatters, parsers, token generation).                                                          |
| `starter/`                               | The starter app. Its `src/components/**` and `src/lib/{i18n,ai,link,utils}` are **copies** — see below.                |
| `build/`                                 | Scripts: starter sync, design-system bundle, `.d.ts` generation, DTCG tokens, release notes.                           |
| `brand/logo/`                            | The logo kit and its usage rules.                                                                                      |
| `preview/`, `templates/`                 | The design system's cards and page templates.                                                                          |

## Commands

```bash
pnpm install                 # only installs versions published ≥ 14 days ago (pnpm-workspace.yaml)
pnpm format                  # Prettier writes (format:check in CI)
pnpm lint                    # ESLint, type-aware (lint:fix applies the safe fixes)
pnpm typecheck               # tsc -b: library, stories and tests (TypeScript 7)
pnpm test:unit               # Vitest
pnpm registry:build          # validates registry.json, writes public/r/
pnpm llms                    # public/llms.txt, llms-full.txt and guides/ from registry.json + guides
pnpm brand "#ff5a1f" --name orange > brand.css   # an accent family from one brand colour
pnpm changeset               # describe a change for the next release (changeset:check in CI)
pnpm storybook               # dev server on :6006
pnpm storybook:build         # public/storybook — the Playwright specs run against this build
pnpm starter:sync            # copy registry items into starter/ (after any change to them)
pnpm --dir starter build     # include the starter in pnpm test
pnpm test                    # all Playwright specs (needs storybook:build first)
```

Targeted runs (much faster than the whole suite):

```bash
pnpm exec playwright test a11y docs interactions -g "Blocks/AI/Chat|Guidelines/AI"
SB_PORT=6201 pnpm exec playwright test ai-chat-messages   # SB_PORT when several checkouts test at once
```

- Rebuild Storybook before Playwright: tests read `public/storybook`, not your source.
- Locally the test server is reused if one is already running on the port (`reuseExistingServer`). If
  results look stale, kill it (`kill $(lsof -t -i:6106)`) — never `pkill -f`, which can kill your own shell.
- Visual baselines come only from CI's container (the **Visual baselines** workflow). Never commit
  screenshots taken on your machine; without baselines the visual specs skip themselves.

## Definition of done

A change is finished when all of this is true:

1. **`pnpm format:check`, `pnpm lint` (no errors, no warnings), typecheck, unit tests and the
   relevant Playwright specs pass** (a11y on your stories in dark,
   light and fr / es / de; interactions; docs; starter if touched). Fix violations in the component,
   never by weakening a test or tagging a story `no-test`.
2. **Every new component or block** has:
   - its file(s) in `src/components/ui/` or `src/components/`;
   - an item in `registry.json` (and in `all` for ui items), with exact `dependencies` and
     `registryDependencies` — derive them from the file's imports;
   - stories (states below), a guide (`.md` + `.mdx`), and tests for any behaviour;
   - exports in `build/artifact-entry.ts` and its name in `COMPONENTS` in `build/build-artifact.mjs`.
3. **Changed components** have their guide updated: every prop, default and behaviour a guide states
   must match the code. Re-read the guide after changing an API.
4. **A changeset** (`pnpm changeset`, or a file in `.changeset/`) says what changed for someone who
   installed the item, under Added / Changed / Fixed, and **Upgrading** when they must do something.
   Don't edit `CHANGELOG.md`: the release writes it from the changesets.
5. **`pnpm starter:sync`** has run if any item the starter uses changed (CI runs
   `node build/sync-starter.mjs --check` and fails otherwise). New npm dependencies go in both
   `package.json` files at the same version.
6. **You looked at it.** Screenshot your stories at 1280 and 390 px, dark and light, and fix overflow,
   truncation and misalignment. axe passing is not the same as looking right.

## Code style

**Prettier formats, ESLint checks quality** — never the other way round. Format on save (the repo's
`.vscode/` settings do it), or run `pnpm format` before committing; CI fails on unformatted files.

- Prettier: single quotes, no semicolons, 100 columns, Tailwind classes sorted by
  prettier-plugin-tailwindcss (also inside `cn()` and `cva()`). Don't fight it, don't hand-align.
- ESLint (`eslint.config.mjs`): typescript-eslint strict + stylistic **type-checked**, react-hooks
  (including the React Compiler rules), @eslint-react, jsx-a11y, react-refresh, sorted imports and
  exports. Named exports only in `src/`. `pnpm lint:fix` applies the safe fixes; review the diff.
- **Disabling a rule** is a last resort and always targeted: on the line, with the reason —
  `// eslint-disable-next-line <rule> -- <why>` (in JSX children:
  `{/* eslint-disable-next-line <rule> -- <why> */}`). Never a bare or file-wide disable. A rule that
  conflicts with an established shadcn/Radix pattern is turned off for a glob in `eslint.config.mjs`,
  with a comment saying why — don't rewrite shadcn code to please the linter.
- TypeScript: `tsc` is TypeScript 7; the `typescript` package is the TS 6 compatibility build that
  typescript-eslint needs (TS 7 has no JS API yet). The root `tsconfig.json` is a solution
  (`tsconfig.app.json`, `tsconfig.storybook.json`, `tsconfig.tests.json`); a new folder of TS files
  must be in one of them or the linter can't type it.
- Files start with `'use client'` (components) then a header comment:
  `// Coreloom UI — Name. What it is and when to use it, in plain words.`
- Named functions, exports gathered at the bottom: `export { A, B, type C }`.
- Comments explain _why_, in plain sentences. No commented-out code.
- Types: structural and exported when consumers need them. No `any`; `unknown` plus narrowing.
  `??` for defaults; `||` only where an empty string or 0 must fall back too (say so).
- React 19: refs as props, `React.use(Context)` and `<Context value>` in our own code, and
  `React.useId()` for every id — never a fixed string (two instances on a page must not clash).

## Design rules

- **Tokens only.** Colours through the semantic utilities: `text-foreground`, `text-muted-foreground`,
  `text-fg-secondary`, `bg-background`, `bg-card`, `bg-inset`, `bg-secondary`, `border-border`,
  `border-border-subtle`, `border-border-strong`, `bg-primary` / `text-primary-text` /
  `bg-primary-subtle`, `text-destructive` / `bg-destructive-subtle`, `text-success`, `text-warning`.
  No hex values, no raw Tailwind palette (`text-gray-500`).
- `text-faint-foreground` is for disabled text only — it fails contrast as readable text.
- `bg-primary` (cyan) is for the one main action per view. `bg-accent` is the hover surface.
- **Layers** use the z ladder (`z-(--z-modal)` 1300, popover 1400, toast 1500, tooltip 1600), never a
  raw z-index.
- **Focus** is always `outline-none focus-visible:ring-[3px] focus-visible:ring-ring`.
- **Motion** respects `prefers-reduced-motion`. Animations that loop forever (spinners, carets) are
  fine; everything else must finish.
- Type scale as in the existing code: `text-[13px]`, `text-[12.5px]`, mono labels
  `font-mono text-[11px] font-semibold tracking-[0.08em] uppercase`, display headings `font-display`.
- Reuse the ui components (`Button`, `Badge`, `Popover`, `HoverCard`, `Command`, `Tooltip`, `Select`,
  `Spinner`, `Kbd`…) instead of rebuilding them. `cn` from `@/lib/utils`.
- Variants follow shadcn's names, plus `success` / `warning` on Badge and Alert.

## Accessibility (a hard requirement)

- Every control has an accessible name; icon buttons use `aria-label`. State is exposed
  (`aria-expanded`, `aria-pressed`, `aria-current`, `aria-invalid`, `aria-busy`).
- Everything works with the keyboard; focus is always visible and never lost to `<body>` — when the
  focused element disappears (a dialog closes, a button hides, a panel resets), move focus somewhere
  meaningful on purpose.
- Things that appear (results, errors, streamed answers) are announced through **one** polite live
  region per area. Avoid live regions inside other live regions.
- Reusable components don't render headings (`h1`–`h6`) for their inner labels: they break the host
  page's heading order. Use `<p>` labels; let the consumer own headings.
- Information is never in colour alone: status has text (sr-only if needed).
- Hover-only UI also works on focus and on touch.

## Text and i18n

- No hard-coded user-facing string in a component: `const t = useCoreloomI18n().messages.<group>` and,
  where useful, a prop that overrides it.
- Add every key to **all four locales**: `en` and `fr` in `src/lib/i18n.tsx`, `src/lib/i18n-es.tsx`,
  `src/lib/i18n-de.tsx`. Interpolation is a function (`(n: number) => …`); plurals are handled in it.
- Sentences with punctuation live in the locale, not in code (French puts a space before `:` `?` `!`).
- French: typographic apostrophe `’`, « guillemets », "vous". German: "du". Spanish: "tú".
- Locale-aware formatting through `Intl` (`useCoreloomI18n().locale`, `formatNumber`), never by hand.
- Several agents working at once: add keys to **different groups or distinct spots** so the merges stay
  clean.

## Stories

- `title`: `Components/<Group>/<Name>` or `Blocks/<Area>/<Name>`; `tags: ["autodocs"]`; a
  `parameters.docs.description.component` that says what it is and what the consumer wires.
- `args` + `argTypes` so Controls work on component stories.
- One story per meaningful state: default, empty, loading, error, long content, French
  (`globals: { locale: "fr" }`), and phone width for blocks (visual tests also shoot blocks at 390 px).
- Deterministic: fixed dates (the clock is frozen on 2026-10-14 in tests), no `Math.random`, no network.
  Interactive stories keep their state with `useState` and fake async with `setTimeout`.
- Chats and composers: `autoFocus={false}` (docs pages must not scroll on load).
- A story that is deliberately busy (a frozen stream) wraps its content in an element with
  `data-frozen`; otherwise `openStory` waits for `aria-busy` to clear and times out.
- `tags: ["no-test"]` only for animated demos that can't be still; give them a frozen sibling story.
- Content inside popovers isn't checked by axe from the root: give lists and panels an inline story too.

## Guides (`stories/guidelines/`)

`Name.md` follows the existing guides: one paragraph on what it is; **The consumer provides** (props,
with defaults); rules as bullets (keyboard, screen readers, when not to use it); **In an app:**
`pnpm dlx shadcn@latest add @coreloom/<item>`. `Name.mdx` renders it with
`<Meta title="Guidelines/<Group>/<Title>" />`, `<Markdown>{guide}</Markdown>` (from `./Name.md?raw`) and
a `<Canvas of={Stories.X} />`. `tests/docs.spec.ts` checks every page renders.

## Tests

- Behaviour a user sees: roles and names (`getByRole`), keyboard paths, focus after actions, what is
  announced. Not implementation details or class names.
- New areas get their own spec file (`tests/<area>.spec.ts`) using `openStory` from `tests/stories.ts`.
- Pure logic (parsers, formatters) gets Vitest cases in `unit/`, including edge cases and hostile input.
- Wait for state, not for time: `expect(...).toBeVisible({ timeout })`, never `waitForTimeout` in specs.
- A test that only fails under load is still a bug in the test or the component — fix it, don't retry it.

## Security

- Model and user content is untrusted. Never render it as HTML: Markdown goes through react-markdown
  with `skipHtml`; editor insertions go in as text nodes or parsed marks.
- URLs from content are allowlisted (`http`, `https`, `mailto`); anything else renders as text.
- External links: `target="_blank" rel="noreferrer noopener"`. In-page `#` links stay in the tab.
- No secrets, keys or tokens in code, stories or the starter.

## AI components

- They read the AI SDK's `UIMessage` shapes (`parts`, tool states, sources) through structural types in
  `src/lib/ai.ts`. **Do not add `ai` or `@ai-sdk/*` as a dependency of any item**; `ai` is a
  devDependency only, for the compatibility test in `unit/ai.test.ts`.
- New SDK fields are optional additions to those types; unknown part types are skipped, never errors.
- The starter simulates models (`starter/src/lib/use-demo-chat.ts`, `ai-editor-demo.ts`) with the
  same shapes as the SDK hooks, so swapping in `useChat` is a one-line change.

## The starter

- `starter/src/components/**` and `starter/src/lib/{i18n*,ai,link,utils}` are written by
  `pnpm starter:sync` from the registry items listed in `starter/coreloom.json`. **Never edit those
  copies** — change `src/` and sync.
- The app's own code is `starter/src/routes/`, `starter/src/lib/*api.ts`, `queries.ts`, `messages.ts`
  (its strings, en + fr) and the `starter/src/components/` files that aren't registry items:
  `app-notifications`, `billing-settings`, `brand`, `members-settings`, `new-project-dialog`,
  `project-notes`, `router-link`, `status-badge`.
- `src/routeTree.gen.ts` is generated by the router plugin: run `pnpm --dir starter build` after adding
  a route and commit the result.
- Every screen is in the axe list at the end of `tests/starter.spec.ts`; add new routes there.

## Dependencies

- Pin new runtime dependencies to a version at least 14 days old (pnpm refuses newer ones). Add them
  to the item's `dependencies` in `registry.json`, and to the starter's `package.json` if it uses it.
- Prefer what's already installed. A new dependency for a small helper needs a strong reason.

## Git

- Small, focused commits with messages that say what changed and why. Don't commit `public/`,
  `dist/`, `test-results/`, local screenshots or `node_modules`.
- Don't bump `version`, edit `CHANGELOG.md` or run `version-packages` — releases go through the
  Version Packages PR that Changesets opens (see README → Release).

## Working in parallel (several agents)

- One checkout per agent; each gets its own `SB_PORT`.
- Agree on file ownership up front. Shared files (`registry.json`, `README.md`,
  `build/*`, `starter/*`, `tests/interactions.spec.ts`) are edited by one integrator; feature agents
  report the registry JSON they need instead of editing it, and add their own changeset file
  (one file per change, so they never conflict).
- i18n keys go in distinct groups or after distinct anchors so merges don't conflict.
- After merging, an independent review (by someone who didn't write the code) checks correctness,
  accessibility, API consistency and the guides against the code.
