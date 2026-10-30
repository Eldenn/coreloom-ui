# Markdown

A model's answer, rendered: headings, lists, tables, task lists, links, inline code and code blocks with their language and a Copy button (react-markdown with GitHub-flavoured Markdown).

**The consumer provides** the Markdown text as `children`, plus optionally `streaming` (shows a caret after the last character while the answer arrives) and `className`.

- Raw HTML in the text is skipped, never rendered: model output is untrusted.
- Links open in a new tab with `rel="noreferrer noopener"`.
- Code blocks are a figure captioned by their language; Copy announces "Copied".
- Task-list checkboxes are read-only and named "Done" or "To do".
- Use it for any text that came from a model; for text people write, use the rich text editor.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/markdown` and import from `@/components/ui/markdown`.
