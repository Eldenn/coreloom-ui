# design-system/

Sources of the Coreloom UI design system published on claude.ai. These files are copied into the
design-system project as they are; nothing in the registry, Storybook or the starter reads them.

| Here                                 | In the design system                         |
| ------------------------------------ | -------------------------------------------- |
| `components/<Name>/preview.html`     | `project/components/<Name>/preview.html`     |
| `components/<Name>/README.md`        | `project/components/<Name>/README.md`        |
| `templates/<name>/`                  | `project/templates/<name>/`                  |

- **Cards.** Each `preview.html` starts with a `<!-- @dsCard … -->` line (group, size, subtitle) and
  renders from the bundle global `window.CoreloomUIDesignSystem_ff5f32`, with React from
  `components/lib/`. Use semantic tokens (`var(--bg-1)`, `text-muted-foreground`), never hex.
- **Bundle.** `node build/build-artifact.mjs` writes `bundle.js`, `bundle.css` and `index.d.ts` from
  `build/artifact-entry.ts`. Tailwind scans this folder (`build/artifact.css`), so classes used only in
  a card or a template end up in `bundle.css`.
- **A new component** gets a card here (see AGENTS.md, "Done means"). Keep the README short: what the
  consumer provides, the behaviour worth knowing, and the install command.
- The files are standalone HTML and Markdown: Prettier and ESLint skip this folder.
