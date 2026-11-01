# AI Chat

A conversation with an assistant: messages with their reasoning, tool calls, sources and actions, the composer, an empty state with suggestions, and the list of past conversations. It reads the AI SDK's `UIMessage` as is, so `useChat` plugs in directly — but it needs no SDK and no server: any state that produces messages works.

**The consumer provides** `messages`, `status` and `onSend({ text, files })`, plus optionally:

- `onStop`, `onRegenerate` and `error` (shows an alert with Retry) — `stop`, `regenerate` and `error` from `useChat`;
- `feedback` and `onFeedback(id, "good" | "bad")` for thumbs on answers;
- `tools` to draw tool calls as your own components (generative UI: a map from tool name to `{ render, label, display }`, see Generative UI), plus `onToolApprovalResponse`, `toolLabels` and `renderToolOutput`;
- `onToolOutput` for tools that ask the person with a form (`formTool()`, see Tool Form) — wire `addToolOutput`;
- `renderData(part)` to draw your own `data-*` parts. Without it, `data-plan` parts show as a live Agent Plan and other data parts are skipped; return `null` to hide one;
- `suggestions`, `emptyTitle` and `emptyDescription` for the empty state;
- `header`, `toolbar`, `allowAttachments`, `accept` and `placeholder`;
- `onEdit(id, text)` to let people edit a message they sent;
- `branches` and `onBranchChange(id, index)` to show the other versions of a message.

**Citations.** An answer's `source-url` / `source-document` parts are its sources, numbered in order. The model's `[1]` markers in the text become inline citations that show the source, and the chips under the answer carry the same numbers. Nothing to wire: ask the model to cite as `[1]`, `[2]` and send sources (`sendSources` with the AI SDK).

**Editing.** With `onEdit`, a user message offers Edit (on hover and focus; always on touch screens). The bubble becomes a text box with Save and Cancel. Escape (or Cancel) closes it and puts focus back on Edit; Ctrl or ⌘ + Enter (or Save) saves it, and focus moves to the edited message — Edit itself hides while the reply is on its way. An open box belongs to its message: if that message is swapped (another version shown above it), the box closes. Save calls `onEdit(messageId, text)`; with the AI SDK, drop the messages from that one on and ask again:

```tsx
onEdit={(id, text) => {
  const at = chat.messages.findIndex((m) => m.id === id)
  chat.setMessages(chat.messages.slice(0, at))
  void chat.sendMessage({ text })
}}
```

(or keep the message, `setMessages` with its text replaced and the rest cut, then `chat.regenerate()`). Files sent with the message aren't part of the edit: keep its file parts if you rebuild it.

**Versions (branches).** The AI SDK keeps one thread, so versions are yours to store: after Regenerate or an edit, keep the old message as a sibling instead of dropping it (a tree of messages, each parent remembering which child is shown). Pass `messages` as the path on screen and `branches` keyed by the id of each message shown: `{ index, count }`, `index` from 0. A message with `count` above 1 gets "‹ 2 / 3 ›" in its action row; Previous version and Next version call `onBranchChange(messageId, index)`, and you swap that message — and what follows it — for the chosen branch. Messages are keyed by id, so the swapped one starts fresh (its reasoning folded, no copied tick); focus stays on the arrow that was pressed. The same shape works for an answer's versions (after Regenerate) and a question's (after an edit). The Edit and branches story keeps such a tree in its own state.

`ConversationList` takes `conversations` (id, title, updatedAt), `activeId`, `onSelect` or `href`, and optionally `onNew`, `onRename` and `onDelete`. It groups by Today, Yesterday, Previous 7 days and Older, and searches titles.

- The message list is a log: new messages are announced politely, without re-reading the whole thread.
- It follows the newest message while you are at the bottom; scroll up and it stays put, with a "Scroll to the latest message" button.
- Three dots (named "Waiting for the answer") show while waiting for the first token; Send becomes Stop while waiting and streaming.
- Copy, Regenerate (last answer only) and feedback buttons are labelled and say when they are pressed.
- Deleting a conversation asks first; renaming happens in place and Escape cancels.
- Using the version arrows announces the new "Version 2 of 3" once, from a single polite status region beside the log (not one per message). The arrows stay focusable at either end (marked unavailable, not removed), so the cursor never drops.
- Source chips link only `http`, `https` and `mailto` addresses; anything else shows the title without a link.
- Keep one assistant voice per chat; switch agents with a new conversation.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/ai-chat`. The starter's Assistant page shows it with a simulated stream.
