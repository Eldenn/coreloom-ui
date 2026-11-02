---
'@coreloom/ui': minor
---

### Added

- `CodeEditorLanguageSelect` (`@coreloom/code-editor`): a language picker to put in a CodeEditor's
  header; `CODE_EDITOR_LANGUAGES` lists the built-in languages with their names.
- `Ide`: the language in the status bar, and the new command "Change the file’s language", open a
  list of languages; the choice sets the file's `language` through `onFilesChange`.
