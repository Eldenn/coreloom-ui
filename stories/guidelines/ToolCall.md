# ToolCall

One tool invocation in a conversation: its name, a status (preparing, running, done, failed, waiting for approval, denied), and — unfolded — the input and output as JSON, or the error.

**The consumer provides** the AI SDK tool `part` as is (`tool-<name>` or `dynamic-tool`), plus optionally:

- `label` — a human name ("Search the docs") instead of the tool's identifier;
- `tool` — generative UI: `{ render(call), label?, display? }` draws the call as your own component in any state, inside the card (`display: 'card'`, default) or in place of it (`'inline'`); `render` returning `undefined` keeps the card's view. Type it with `ToolComponent<Input, Output>`; see Generative UI;
- `renderOutput(output)` to show a result as UI (a table, a card) instead of JSON — return `undefined` to keep the JSON; a drawn result shows unfolded (`tool` takes precedence);
- `onApprovalResponse({ id, approved })` for tools that ask first — wire `addToolApprovalResponse` from `useChat`;
- `onOutput({ tool, toolCallId, output })` (or `{ …, state: 'output-error', errorText }`) for tools that wait for the person (`tool.awaitsInput`, such as `formTool()`) — wire `addToolOutput` from `useChat`;
- `defaultOpen`.

- The status is text and an icon, never colour alone; failures open by themselves.
- A tool waiting for approval shows Allow and Deny; nothing runs until someone chooses.
- A tool with `awaitsInput` reads "Waiting for you" instead of "Running" while its state is `input-available`, and isn't marked busy; see Tool Form.
- Mark tools that change things (send, delete, deploy, pay) as needing approval on the agent.
- JSON is shown in a scrollable code block; very long outputs stay inside the card.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/tool-call` and import from `@/components/ui/tool-call`.
