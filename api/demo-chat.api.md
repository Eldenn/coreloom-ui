# @coreloom/demo-chat

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/hooks/use-demo-chat.ts

```ts
type DemoFinish = (event: { messages: AiMessage[]; isAbort: boolean; }) => void
type DemoScript = {}
DemoScript.reasoning: string
DemoScript.answer: (question: string) => string
DemoScript.tool?: DemoTool | undefined
DemoScript.source?: {}
DemoScript.source.url: string
DemoScript.source.title: string
DemoScript.sensitive?: RegExp | undefined
DemoScript.sensitiveTool?: DemoTool | undefined
DemoScript.approved?: string | undefined
DemoScript.denied?: string | undefined
DemoScript.speed?: {}
DemoScript.speed.word?: number | undefined
DemoScript.speed.firstToken?: number | undefined
type DemoTool = {}
DemoTool.name: string
DemoTool.input: (question: string) => unknown
DemoTool.output: unknown
function useDemoChat({ messages: initialMessages, script, onFinish, }: { messages?: AiMessage[]; script: DemoScript; onFinish?: DemoFinish; }) => { messages: AiMessage[]; status: AiChatStatus; error: Error | undefined; sendMessage: ({ text }: { text: string; files?: File[]; }) => void; stop: () => void; regenerate: () => void; edit: (messageId: string, text: string) => void; addToolApprovalResponse: ({ id: approvalId, approved, }: { id: string; approved: boolean; }) => Promise<void>; }
```
