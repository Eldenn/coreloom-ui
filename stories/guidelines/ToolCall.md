# ToolCall

One tool invocation in a conversation: its name, a status (preparing, running, done, failed, waiting for approval, denied), and — unfolded — the input and output as JSON, or the error.

**The consumer provides** the AI SDK tool `part` as is (`tool-<name>` or `dynamic-tool`), plus optionally:

- `label` — a human name ("Search the docs") instead of the tool's identifier;
- `renderOutput(output)` to show a result as UI (a table, a card) instead of JSON;
- `onApprovalResponse({ id, approved })` for tools that ask first — wire `addToolApprovalResponse` from `useChat`;
- `defaultOpen`.

- The status is text and an icon, never colour alone; failures open by themselves.
- A tool waiting for approval shows Allow and Deny; nothing runs until someone chooses.
- Mark tools that change things (send, delete, deploy, pay) as needing approval on the agent.
- JSON is shown in a scrollable code block; very long outputs stay inside the card.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/tool-call` and import from `@/components/ui/tool-call`.
