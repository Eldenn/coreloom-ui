---
'@coreloom/ui': minor
---

### Added

- `RichTextEditor`: **Review changes** in the AI panel. A rewrite of existing text (improve, fix,
  shorten, lengthen, or an instruction) shows as changes in the text itself, removed words struck
  through and new ones underlined, compared word by word. A bar under the text steps through them
  (Previous / Next) and accepts or rejects each one, or all at once. Nothing changes in the document
  or in `value` until a change is accepted; each Accept is one undo step. New file
  `rich-text-review.tsx`, installed with the editor; new `ai.review` option (`false` removes it).

### Changed

- `RichTextEditor`: for a rewrite, **Review changes** is now the main (focused) button in the AI
  panel, and Replace is next to it. Translations, summaries, continuations and answers at the `/`
  spot keep their main action.

### Upgrading

- The editor reads new strings: re-install `@coreloom/i18n` (and `@coreloom/i18n-es` /
  `@coreloom/i18n-de` if you use them) with `--overwrite` first, then
  `@coreloom/rich-text-editor` with `--overwrite`.
- To keep Replace as the main action, pass `ai={{ onRequest, review: false }}`. Tests that press
  Enter on the panel's focused button after a rewrite now start a review instead of replacing.
