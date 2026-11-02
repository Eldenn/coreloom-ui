# TruncatedText

A long text cut after a few lines, with "Show more" to read the rest: a product description, a review, a commit message, a ticket's body. With it, `Highlight` marks the terms someone searched for.

**The consumer provides** the text as `children`, and optionally `lines` (3), `expanded` + `onExpandedChange` or `defaultExpanded`. For Highlight: `text` and `query` (a search string, split on spaces, or a list of terms), and optionally `markClassName`. `findMatches(text, query)` returns the matched ranges.

- The button appears only when the text is actually cut, and it follows the width as the layout changes. It says whether the text is expanded and which text it controls.
- Cut prose, not data: don't truncate a number, a name or an error people need whole.
- Highlight ignores case and accents ("ecole" marks "École"), marks several terms at once, and draws each match as a `<mark>`.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/truncated-text @coreloom/highlight` and import from `@/components/ui/truncated-text` and `@/components/ui/highlight`.
