# AI Artifact

A document or a piece of code a model wrote, opened in a panel beside the chat instead of buried in a message: every version it went through, a before / after view of what changed, Copy, Download and Restore. Three parts: `ArtifactPanel` (the panel), `ArtifactCard` (the chip a message shows to open it) and `ArtifactLayout` (the chat and the panel side by side). Front-end only: the app keeps the versions and decides what Restore does.

**The consumer provides**, on `ArtifactPanel`:

- `artifact` — `{ id, title, kind, language?, filename?, versions }`. `kind` is `markdown` (rendered in Preview, with a Source tab), `code` or `text`. `versions` is oldest first, each `{ id, content, label?, createdAt? }`; the last one is the latest. Build it from a tool's output (`writeDocument` returns the text) or from `data-*` parts, and append a version each time the model edits it;
- `version` / `defaultVersion` / `onVersionChange` — the version shown, by id. Uncontrolled, the panel follows the latest version, so a new one shows as it arrives;
- `view` / `defaultView` / `onViewChange` — `preview` (Markdown only, the default for it), `source` (the default otherwise) or `changes`;
- `streaming` — the latest version is still being written: a caret, "Writing…", and Restore waits;
- `onRestore(version)` — shown on older versions as "Restore this version". Append its content as a new version: history is never rewritten;
- `onClose` — shows the Close button; `actions` — more header buttons, before Copy.

`ArtifactCard` takes `title`, `kind`, `language`, `versions` (a count: "v3" from 2 on), `streaming`, `active` (the panel shows it now) and `onOpen`. Draw it from the Chat's `tools` with `display: 'inline'`, so the tool call reads as the document it produced.

`ArtifactLayout` takes `open`, `panel` (the `ArtifactPanel`), the chat as `children`, `defaultSize` (`"50%"`), `minSize` (`"30%"`) and `stackBelow` (720 px).

- **Changes** compares the version shown with the one before it, line by line: removed lines first, then the lines that replace them, with both line numbers. Unchanged lines keep three lines of context around each change; longer runs fold into "Show 12 unchanged lines". Added and removed lines say so in words for screen readers, not only in colour or with + and −. Very long texts (over four million line pairs) show as a full rewrite rather than freezing the page.
- **Download** saves the version shown as a file, built in the browser: `filename`, or the title in lowercase with dashes and an extension from `kind` or `language` (`tsx` → `.tsx`, `python` → `.py`, Markdown → `.md`, otherwise `.txt`). **Copy** copies the same text and confirms with a toast.
- The version arrows sit in a group named "Versions" and read "Version 2 of 3"; an older version shows a bar with **Restore this version** and **Show latest**.
- The layout keeps the chat mounted while the panel opens and closes, so the draft in the composer and the scroll position stay. The divider is the Resizable handle: drag it, or focus it and use the arrow keys.
- Narrower than `stackBelow`, the panel covers the chat (phones, a narrow column) and the chat behind it is inert until Close.
- Opening moves focus to the panel; closing gives it back to whatever opened it (the card) when focus was in the panel, and leaves it alone when the reader had moved on to the chat.
- Model content is untrusted: Markdown goes through the `Markdown` component (no raw HTML, safe links), code and text render as text.
- Use it for things people take away — a document, a file, a query. A short answer belongs in the message; a long one the reader will edit belongs in the editor with Review changes.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/ai-artifact` and import from `@/components/ai-artifact`.
