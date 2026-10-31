# useDemoChat

A stand-in for the AI SDK's `useChat` that simulates a model in the browser: it thinks (a reasoning part), calls a tool, cites a source and streams its answer word by word; a question matching `sensitive` asks for approval first. Use it to prototype an AI screen with the `Chat` block before there is a backend, in a demo, or in a story. Nothing leaves the page.

**The consumer provides** a `script`:

- `reasoning` and `answer(question)` (Markdown; `[1]` cites the first source) — required;
- `tool` (`{ name, input(question), output }`, default: a docs search) and `source` (`{ url, title }`);
- `sensitive` (a RegExp), `sensitiveTool`, `approved` and `denied` for the approval path;
- `speed` (`{ word, firstToken }` in ms) to stream faster or slower;

plus optionally `messages` (the conversation to start from) and `onFinish({ messages, isAbort })` (called when a reply ends or is stopped, to save the conversation) — the same option names as `useChat`.

It returns `useChat`'s shape — `messages`, `status`, `error`, `sendMessage`, `stop`, `regenerate`, `addToolApprovalResponse` — plus `edit(messageId, text)` for `Chat`'s `onEdit`. So moving to a real model is a swap: replace `useDemoChat({ script })` with `useChat({ transport })` and keep the other `Chat` props; `edit` has no `useChat` counterpart (truncate with `setMessages`, then `sendMessage`, as the Chat guide shows).

- Stop cuts the stream and closes whatever was streaming, as an aborted request does.
- Unmounting stops the simulation; no timer outlives the component.
- It is a prototype tool: never ship it where users expect a real answer.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/demo-chat` and import from `@/hooks/use-demo-chat`.

_On `window.CoreloomUIDesignSystem_ff5f32` as `useDemoChat`, with `Chat` from the ai-chat block._
