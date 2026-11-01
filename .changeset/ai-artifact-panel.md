---
'@coreloom/ui': minor
---

### Added

- `ai-artifact`: a document or a piece of code a model wrote, opened in a panel beside the chat.
  `ArtifactPanel` shows its versions (‹ v2 ›, labels and times), Preview and Source for Markdown,
  **Changes** against the previous version (a line diff with both line numbers and folded unchanged
  lines), Copy, Download (a file built in the browser) and **Restore this version**.
  `ArtifactCard` is the chip a message shows to open it, drawn with the Chat's `tools`;
  `ArtifactLayout` puts the chat and the panel side by side, resizable, and lays the panel over the
  chat when the space is narrow, keeping the chat mounted. `diffLines` and `artifactFilename` are
  exported for apps that need the same diff or file names.

### Upgrading

- The panel reads new strings (`ai.artifact`): re-install `@coreloom/i18n` (and
  `@coreloom/i18n-es` / `@coreloom/i18n-de` if you use them) with `--overwrite` before adding
  `@coreloom/ai-artifact`.
