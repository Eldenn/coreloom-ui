# Docs layout

Documentation pages as one installable block: nav column, article, "On this page" rail, code blocks and Preview / Code tabs.

**Install** `pnpm dlx shadcn@latest add @coreloom/docs`. It writes `docs-layout.tsx`, `docs-toc.tsx`, `code-block.tsx` and `component-preview.tsx`, plus `site-header.tsx`, `site-footer.tsx` and `copy-button.tsx`.

**The consumer provides**:

- `<DocsLayout header nav toc>` around the article. `header` is usually a `SiteHeader` with a `CommandMenu` and the `ThemeToggle`. Give the `CommandMenu` `onAskAi(query)` and a typed question can go to your assistant: "Ask AI: “…”" comes first in the results. `nav` is `{ title, items: [{ title, href, active? }] }[]`, and `toc` is `{ id, title, depth? }[]` matching the headings' ids.
- `<DocsPageHeader eyebrow title lead>` to open the page.
- `<CodeBlock code title>` for code. Pass highlighted markup as children (Shiki, Prism); the copy button always copies `code`.
- `<ComponentPreview code>` around a live example.

- A 240px nav column, the article at 760px max and a 200px rail. Below 1024px the rail goes; below 768px the nav opens from a "Menu" button in a sheet.
- The rail marks the heading in view (scroll spy) with an `accent` rule. Give headings `scroll-mt-20` so anchors land below the sticky header.
- Write docs as the README says: second person, short declaratives, code as code.
