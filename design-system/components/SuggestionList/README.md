# Suggestion List

Suggestions reviewed one by one before they count: rules a model proposed, tags, fixes. Each one is accepted, edited then accepted, or ignored.

**`SuggestionList` takes** `suggestions` (`id`, `text`, optional `label` and `detail`), `onAccept(suggestion, text)` and `onDismiss(suggestion)`, and optionally `editable` (default `true`), `renderText`, `empty`, `disabled`, `className`, `aria-label` / `aria-labelledby`.

- The app removes each handled suggestion; focus moves to the next one, or to the list when none are left.
- A promise from `onAccept` / `onDismiss` shows a spinner; a rejected one keeps the suggestion.
- Edit: Ctrl+Enter accepts, Escape cancels. One polite message per action says how many are left.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/suggestion-list`.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`._
