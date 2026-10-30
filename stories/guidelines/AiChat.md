# AI Chat

A conversation with an assistant: messages with their reasoning, tool calls, sources and actions, the composer, an empty state with suggestions, and the list of past conversations. It reads the AI SDK's `UIMessage` as is, so `useChat` plugs in directly — but it needs no SDK and no server: any state that produces messages works.

**The consumer provides** `messages`, `status` and `onSend({ text, files })`, plus optionally:

- `onStop`, `onRegenerate` and `error` (shows an alert with Retry) — `stop`, `regenerate` and `error` from `useChat`;
- `feedback` and `onFeedback(id, "good" | "bad")` for thumbs on answers;
- `onToolApprovalResponse`, `toolLabels` and `renderToolOutput` for tool calls;
- `suggestions`, `emptyTitle` and `emptyDescription` for the empty state;
- `header`, `toolbar`, `allowAttachments`, `accept` and `placeholder`.

`ConversationList` takes `conversations` (id, title, updatedAt), `activeId`, `onSelect` or `href`, and optionally `onNew`, `onRename` and `onDelete`. It groups by Today, Yesterday, This week and Older, and searches titles.

- The message list is a log: new messages are announced politely, without re-reading the whole thread.
- It follows the newest message while you are at the bottom; scroll up and it stays put, with a "Scroll to the latest message" button.
- "Typing…" shows while waiting for the first token; Send becomes Stop while streaming.
- Copy, Regenerate (last answer only) and feedback buttons are labelled and say when they are pressed.
- Deleting a conversation asks first; renaming happens in place and Escape cancels.
- Keep one assistant voice per chat; switch agents with a new conversation.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/ai-chat`. The starter's Assistant page shows it with a simulated stream.
