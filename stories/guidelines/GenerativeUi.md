# Generative UI

A tool call drawn as your own component: `getWeather` shows a weather card, `searchDocs` a list of results, `bookMeeting` a booking to confirm — instead of the input and output as JSON. The model picks the tool; your app owns the component. It's the AI SDK's tool-part pattern, without writing the `switch` over `part.type` yourself.

**The consumer provides** `tools` on `Chat` (and `ChatWidget`, `ChatMessages`, `ChatMessage`), a map from tool name to:

- `render(call)` — returns the component for the call as it stands, or `undefined` to keep the card's own view for that state. `call` has `state`, `input`, `output` (once the state is `output-available`), `errorText` (on `output-error`), `toolCallId`, the raw `part`, and `respond(approved)` while the call waits for approval;
- `label` — the tool's human name, on the card and for screen readers (wins over `toolLabels`);
- `display` — `'card'` (default): inside the folded card, unfolded, in place of the JSON; `'inline'`: in place of the card, with no frame around it;
- `awaitsInput` — the tool runs in the browser and waits for the person (no `execute` on the server). While its state is `input-available`, `render` also gets `submit(output)` and `cancel(reason?)`, wired to `onToolOutput` (`addToolOutput`), and the card says "Waiting for you". `formTool()` builds such an entry with a form; see Tool Form.

A single `ToolCall` takes the same object as `tool`.

```tsx
import type { InferUITools } from 'ai'
import { Chat } from '@/components/ai-chat'
import type { ToolComponents } from '@/components/ui/tool-call'
import type { tools as serverTools } from '@/server/tools' // a type-only import

const tools: ToolComponents<InferUITools<typeof serverTools>> = {
  getWeather: {
    label: 'Weather',
    display: 'inline',
    render: (call) =>
      call.state === 'output-available' ? (
        <WeatherCard weather={call.output} /> // typed from the tool's output
      ) : call.state === 'output-error' ? undefined : (
        <WeatherSkeleton city={call.input?.city} /> // the input is partial while it streams
      ),
  },
  searchDocs: {
    render: (call) => (call.state === 'output-available' ? <DocResults hits={call.output} /> : undefined),
  },
}

<Chat messages={chat.messages} tools={tools} onToolApprovalResponse={chat.addToolApprovalResponse} … />
```

- **Every state.** `render` is called while the input streams in (`input-streaming`), while the tool runs (`input-available`, `approval-responded`), when it asks (`approval-requested`), and when it answers, fails or is denied. Draw a skeleton the size of the result while it runs, so the answer doesn't jump.
- **`undefined` falls back.** Return `undefined` for a state you don't draw and the call shows as a normal card: a spinner while it runs, the error when it fails, Allow / Deny when it asks.
- **Approvals.** In the card, Allow / Deny stay under your component. Inline, draw your own buttons and call `respond(true | false)`; it is wired to `onToolApprovalResponse` (`addToolApprovalResponse`). Nothing runs until someone answers.
- **Screen readers.** An inline component is a group named by the tool's `label` and is busy until the tool answers. Write a short sr-only sentence in skeletons ("Getting the weather in Lyon…"); the result itself is read with the rest of the answer.
- **Your component, your rules.** It's app code: tokens for colours, `useCoreloomI18n().locale` and `Intl` for dates, numbers and units, no headings (use `<p>` labels), links with `rel="noreferrer noopener"`. Output comes from the model's tool: render it as data, never as HTML.
- Tools without an entry keep the card (`toolLabels` and `renderToolOutput` still work; `tools` takes precedence for the tools it lists).
- Don't use it for tools whose output only the model reads (a lookup it summarises in text): the card, folded, is the right weight for those.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/ai-chat` (or `@coreloom/tool-call` alone) and type the map with `ToolComponents` from `@/components/ui/tool-call`.
