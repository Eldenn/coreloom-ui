# ToolForm

A tool that asks before it goes on: the agent needs a date, a name or a choice, and the person fills them in right in the conversation. The answer goes back as the tool's output (`addToolOutput`) and the form then shows what was sent.

**The consumer provides** an entry in `Chat`'s `tools` built with `formTool({ fields?, title?, description?, label?, submitLabel?, display?, cancellable?, toOutput? })`, and `onToolOutput` wired to `addToolOutput`. Without `fields`, the model writes the form as the tool's input: `{ title?, description?, fields: [...] }`. Field types: `text`, `email`, `url`, `textarea`, `number`, `date`, `select`, `checkbox`.

- Send checks every field, writes the errors under them and focuses the first one to fix; optional fields say so.
- Once sent, the form becomes a read-only summary (or "Cancelled") and focus moves to the call.
- Fields written by a model are read defensively (`readToolFormFields`) and render as text.
- Ask for a few things the agent can't guess; for a plain yes or no, use an approval.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/tool-form` and import from `@/components/ui/tool-form`.
