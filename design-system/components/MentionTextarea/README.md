# MentionTextarea

A textarea where typing "@" suggests people (or channels, files, with another `trigger`): a comment, a task description, a message.

**The consumer provides** `options` (`{ value, label, description?, icon? }`; `value` is the handle, without spaces), `value` + `onValueChange` (or `defaultValue`), an `id` for its `FieldLabel` (or an `aria-label`), and optionally `trigger` ("@"), `maxSuggestions` (6), `rows`, `placeholder` and `disabled`. `mentionsIn(text, options)` lists the handles a text mentions, each once.

- The list follows what is typed after the trigger, matching the handle's start or anywhere in the name. Arrows move, Enter or Tab inserts "@handle ", Escape closes it; the focus never leaves the textarea.
- The value stays plain text ("Thanks @ada!"), so it saves and diffs like any other. Use `mentionsIn` on submit to notify the people mentioned.
- For a server search, filter `options` yourself as the text changes and pass the result.

_On `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/mention-textarea` and import from `@/components/ui/mention-textarea`._
