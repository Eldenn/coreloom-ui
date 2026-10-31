# With the AI SDK

The AI blocks read the message shape of the [AI SDK](https://ai-sdk.dev) (`UIMessage`: an id, a role and `parts`), so `useChat()` plugs in without glue. They don't depend on the SDK and never call a model: any state that produces those messages works — your own fetch, a WebSocket, a mock.

**On the page:**

```tsx
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Chat } from "@/components/ai-chat"

export function Assistant({ id, initialMessages }: { id: string; initialMessages: UIMessage[] }) {
  const chat = useChat({ id, messages: initialMessages, transport: new DefaultChatTransport({ api: "/api/chat" }) })

  // The composer hands over File[]; the SDK takes a FileList.
  const onSend = ({ text, files }: { text: string; files: File[] }) => {
    const list = new DataTransfer()
    files.forEach((file) => list.items.add(file))
    void chat.sendMessage({ text, files: list.files })
  }

  return (
    <Chat
      messages={chat.messages}
      status={chat.status}
      error={chat.error}
      onSend={onSend}
      onStop={chat.stop}
      onRegenerate={chat.regenerate}
      onToolApprovalResponse={chat.addToolApprovalResponse}
    />
  )
}
```

**On the server**, your route runs `streamText` and returns its UI message stream (the AI SDK's chatbot guide has the route for your version). Turn on `sendReasoning` to show the model's thinking and `sendSources` for sources.

**What each part becomes:**

| Part | Rendered as |
|---|---|
| `text` | `Markdown`, with a caret while `state` is `streaming` |
| `reasoning` | `Reasoning`, open while it streams, then folded |
| `tool-<name>`, `dynamic-tool` | `ToolCall`; `toolLabels` names them, `renderToolOutput` draws results as UI |
| `approval-requested` state | Allow / Deny, wired to `addToolApprovalResponse` |
| `file` | An image, or a file chip that links to it |
| `source-url`, `source-document` | The numbered sources under the answer |
| `step-start`, `data-*`, others | Skipped |

- Tools that change things (send, delete, deploy, pay) should need approval on the server (the AI SDK's tool approval); the chat then shows Allow / Deny and waits for the user.
- Keep provider keys on the server. The playground and agent screens edit settings; your backend decides what they may do.
- No backend yet? The starter's `useDemoChat` (`src/lib/use-demo-chat.ts`) has `useChat`'s shape and simulates answers in the browser.
