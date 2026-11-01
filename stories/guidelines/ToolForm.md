# Tool Form

A tool that asks before it goes on. The agent needs a date, a name or a choice, and the person fills them in right in the conversation; the answer goes back as the tool's output and the agent carries on. It's the AI SDK's pattern for tools without an `execute` function: the call stops at `input-available` and waits for `addToolOutput`.

**The consumer provides** an entry in `Chat`'s `tools`, built with `formTool()`, and `onToolOutput` wired to `addToolOutput` from `useChat`:

```tsx
import { formTool } from '@/components/ui/tool-form'

const tools: ToolComponents<InferUITools<typeof serverTools>> = {
  // The app's own questions:
  scheduleCall: formTool({
    label: 'Schedule a call',
    title: (input) => `When should we talk about “${input.topic}”?`,
    fields: [
      { name: 'day', label: 'Day', type: 'date', required: true, min: '2026-10-15' },
      { name: 'time', label: 'Time', type: 'select', options: [{ value: '14:00', label: '2:00 PM' }] },
      { name: 'remind', label: 'Remind me', type: 'checkbox', defaultValue: true },
    ],
  }),
  // Or questions the model writes: its input is { title?, description?, fields: [...] }
  askUser: formTool(),
}

<Chat messages={messages} tools={tools} onToolOutput={addToolOutput} … />
```

`formTool` takes, all optional:

- `fields` — an array, or a function of the tool's input. Each field has a `name` (its key in the answer), a `label`, an optional `description` and `required`, and a `type`: `text` (default), `email`, `url`, `textarea`, `number` (`min`, `max`, `step`), `date` (`min`, `max` as `YYYY-MM-DD`), `select` (`options: [{ value, label }]`) or `checkbox`; plus `defaultValue` and, for text, `placeholder` and `maxLength`. Left out, the fields come from the input's `fields`;
- `title` and `description` — text or a function of the input; by default the input's own, then "The agent needs a few details";
- `label`, `submitLabel` (default "Send"), `display` (`'inline'` by default; `'card'` puts the form in the folded card, whose header then says "Waiting for you");
- `cancellable` (default `true`) — Cancel answers with an error ("The user cancelled the form.") the model can read;
- `toOutput(values, input)` — shape the answer into the tool's output. By default it is the values by name: dates as `YYYY-MM-DD`, numbers as numbers, checkboxes as booleans, empty optional fields as `null`.

`ToolForm` is the form itself, for your own `render`: `fields`, `title`, `description`, `submitLabel`, `onSubmit(values)`, `onCancel`, and `values` or `cancelled` to show the answer afterwards.

- **Sent, then shown.** Once answered, the form becomes a read-only summary of what was sent (or "Cancelled"), and focus moves to the call so it isn't lost.
- **Errors on Send.** Nothing is checked while the person types. Send checks every field, writes what's wrong under each one (linked with `aria-describedby`, `aria-invalid`), and focuses the first one to fix. Optional fields say so in their label.
- **Fields from a model are untrusted.** `formTool()` reads them with `readToolFormFields`: unknown types become text, fields without a usable name are dropped, names are unique, at most 20. Labels render as text, never HTML. Check the answer again where you use it.
- **Ask for little.** A few fields the agent can't guess. For a yes or no before something happens, use an approval (`needsApproval`) instead; for long forms, link to a page.
- Without `onToolOutput`, the call keeps its card: a form that can't send isn't shown.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/tool-form` and import from `@/components/ui/tool-form`.
