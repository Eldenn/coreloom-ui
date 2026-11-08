---
'@coreloom/ui': minor
---

### Added

- **SuggestionList** (`@coreloom/suggestion-list`, also in `all`, experimental): suggestions reviewed one by one before they count, such as rules a model proposed.
  - Each suggestion has a `text`, and optionally a `label` above it and a `detail` under it. Its buttons are Accept, Edit (the text opens in a field, then Accept edit or Cancel) and Ignore.
  - `onAccept(suggestion, text)` and `onDismiss(suggestion)` may return a promise: a spinner shows while it runs, and a rejected one keeps the suggestion.
  - The app removes handled suggestions; focus moves to the next one, and one polite message says what happened and how many are left.
  - `renderText` draws the text (inline Markdown, for example), `editable={false}` hides Edit and `empty` replaces "No suggestions left."
