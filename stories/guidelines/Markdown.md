# Markdown

A model's answer, rendered: headings, lists, tables, task lists, links, inline code and code blocks with their language and a Copy button (react-markdown with GitHub-flavoured Markdown).

**The consumer provides** the Markdown text as `children`, plus optionally `streaming` (shows a caret after the last character while the answer arrives), `sources` and `className`.

`sources` takes the message's AI SDK source parts (`source-url`, `source-document`) in order. The model's markers — `[1]`, `[1][2]` — then become inline citations that show the source on hover, focus or tap. Markers inside code and links stay as written, and so do escaped ones (`\[1\]`) and ones right after a letter or digit (`items[1]`); a number with no source stays plain text, and a half-written `[1` while streaming is just text until it closes. A bracketed number never links anywhere: if the text defines it (`[1]: https://…`), it is still a citation of source 1 — or plain `[1]` when there is no such source.

- Raw HTML in the text is skipped, never rendered: model output is untrusted.
- Links open in a new tab with `rel="noreferrer noopener"`; jumps within the answer (footnotes) stay in the page. Addresses go through react-markdown's safe-URL filter (`javascript:` and the like are dropped).
- Code blocks are a figure captioned by their language, with Copy (it shows a tick once copied). A block whose lines don't fit scrolls sideways and then takes focus, so the keyboard can scroll it; one that fits isn't a tab stop.
- Footnotes (`[^1]`) are listed under a translated "Footnotes" label — a paragraph, not a heading, so the page's outline stays yours — with translated "Back to reference" links. Their ids are unique to each block.
- Task-list checkboxes are read-only and named "Done" or "To do".
- Citations are numbered buttons named after their source ("Source 1: Deployments guide"); see Inline Citation.
- Use it for any text that came from a model; for text people write, use the rich text editor.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/markdown` and import from `@/components/ui/markdown`.
