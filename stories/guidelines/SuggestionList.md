# Suggestion List

> **Experimental.** This item may still change in a minor release, with an **Upgrading** note in the changelog. See [VERSIONING.md](https://github.com/Eldenn/coreloom-ui/blob/main/VERSIONING.md).

Suggestions someone reviews one by one before they count: rules a model proposed from a project's notes, tags to add, fixes a check found. Each one is accepted as it is, edited then accepted, or ignored. The list only asks; the app saves what was accepted and decides what is left.

**The consumer provides** `suggestions` (each with an `id`, its `text`, and optionally a `label` above it, such as where it would go, and a `detail` under it, such as where it comes from), `onAccept(suggestion, text)` (`text` is the suggestion's text, or the edited one, trimmed) and `onDismiss(suggestion)`. Optionally `editable` (default `true`, shows Edit), `renderText` (how the text is drawn; plain text by default, `(text) => <Markdown inline>{text}</Markdown>` for inline code and emphasis), `empty` (what shows once nothing is left; default "No suggestions left."), `disabled`, `className`, and `aria-label` or `aria-labelledby` (default name "Suggestions").

- **The app removes each handled suggestion** from `suggestions`, after Accept and after Ignore. Focus then moves to the suggestion that took its place (or the last one), and to the list itself once none are left, so it never falls to the page.
- `onAccept` and `onDismiss` may return a promise: the clicked button shows a spinner and the suggestion's buttons are disabled until it settles. A rejected promise keeps the suggestion as it was (an open edit stays open) and announces that it didn't go through; show the reason yourself (a toast) if there is one.
- Edit opens the text in a field, focused, with Accept edit and Cancel. Ctrl+Enter (⌘+Enter) accepts, Escape cancels without closing a dialog around the list, and focus goes back to Edit. An empty text can't be accepted.
- Screen readers hear one polite message per action, with how many are left ("Suggestion accepted. 2 left."). Each Accept, Edit and Ignore button is described by its suggestion's text, so the three buttons of a row are told apart.
- Labels and details are short and secondary; long text wraps, it's never cut.
- Not for changes inside a text (use RichTextEditor's review) or for a tool call waiting for approval (use ToolCall).

**In an app:** `pnpm dlx shadcn@latest add @coreloom/suggestion-list` and import from `@/components/ui/suggestion-list`.
