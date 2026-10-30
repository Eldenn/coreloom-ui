# PromptInput

The composer at the bottom of a chat: a text box that grows with its content, optional attachments, a toolbar slot (model picker, tools) and Send — which becomes Stop while a reply is on its way.

**The consumer provides** `onSubmit({ text, files })` and `status` (`ready`, `submitted`, `streaming` or `error` — the AI SDK's `useChat` status as is), plus optionally:

- `onStop` (shows Stop while submitted or streaming — wire `stop` from `useChat`);
- `value`, `defaultValue` and `onValueChange` to control the text;
- `allowAttachments` and `accept` for files, shown as chips with a remove button;
- `toolbar`, `placeholder`, `disabled` and `autoFocus`.

- Enter sends, Shift + Enter breaks the line; Enter while composing with an input method (Japanese, Chinese…) never sends.
- The shortcut is written out for screen readers and linked to the box with `aria-describedby`.
- Empty or whitespace-only text never sends; the box clears after sending and keeps focus.
- Keep the toolbar to a few compact controls; put settings in the agent, not the composer.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/prompt-input` and import from `@/components/ui/prompt-input`.
