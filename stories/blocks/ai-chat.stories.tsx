import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { Chat, ChatMessages, ConversationList, type Conversation } from "@/components/ai-chat"
import { Badge, BadgeDot } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { AiChatStatus, AiMessage } from "@/lib/ai"

const answer = `Your last three deployments of **coreloom-api** failed at the same step: the type check.

| Deployment | Branch | Error |
|---|---|---|
| dpl_8f2k | main | \`TS2339\` in \`settings.tsx\` |
| dpl_7c1x | feat/billing | same |
| dpl_6a9m | feat/billing | same |

The property \`slug\` was renamed to \`handle\` in \`Workspace\`. Update the route:

\`\`\`tsx
const { handle } = Route.useLoaderData()
\`\`\`

Then push again; the build should pass.`

const conversation: AiMessage[] = [
  { id: "m1", role: "user", parts: [{ type: "text", text: "Why do my coreloom-api deployments keep failing?" }] },
  {
    id: "m2",
    role: "assistant",
    parts: [
      { type: "reasoning", text: "The user asks about failing deployments. I should look up the latest builds of coreloom-api, then read the error.", state: "done" },
      {
        type: "tool-searchDeployments",
        toolCallId: "call_1",
        state: "output-available",
        input: { project: "coreloom-api", status: "failed", limit: 3 },
        output: [{ id: "dpl_8f2k", branch: "main", error: "TS2339" }, { id: "dpl_7c1x", branch: "feat/billing", error: "TS2339" }],
      },
      { type: "text", text: answer, state: "done" },
      { type: "source-url", sourceId: "s1", url: "https://coreloom.dev/docs/deployments", title: "Deployments guide" },
      { type: "source-url", sourceId: "s2", url: "https://coreloom.dev/changelog", title: "Changelog: Workspace.handle" },
    ],
  },
  { id: "m3", role: "user", parts: [{ type: "text", text: "Roll back production to the last green build." }] },
  {
    id: "m4",
    role: "assistant",
    parts: [
      { type: "text", text: "The last green build is **dpl_5t3q** (2 days ago). Rolling back replaces what's live now.", state: "done" },
      {
        type: "tool-rollback",
        toolCallId: "call_2",
        state: "approval-requested",
        input: { project: "coreloom-api", deployment: "dpl_5t3q" },
        approval: { id: "appr_1", requestReason: "Rolling back production changes what your users see. Allow it?" },
      },
    ],
  },
]

const toolLabels = { searchDeployments: "Search deployments", rollback: "Roll back production" }

const meta = {
  title: "Blocks/AI/Chat",
  component: Chat,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A conversation with a model, shaped for the AI SDK: pass `useChat()`'s `messages` and `status`, and wire `onSend`, `onStop`, `onRegenerate` and `onToolApprovalResponse`. Text renders as Markdown, reasoning folds away, tool calls show their input, output and approval.",
      },
    },
  },
  args: { messages: [], onSend: () => {} },
} satisfies Meta<typeof Chat>
export default meta
type Story = StoryObj<typeof meta>

/** `frozen`: a still of a streaming state, so the tests don't wait for it to settle. */
function Frame({ children, frozen }: { children: React.ReactNode; frozen?: boolean }) {
  return (
    <div className="h-[760px] bg-background" data-frozen={frozen || undefined}>
      {children}
    </div>
  )
}

export const ConversationStory: Story = {
  name: "Conversation",
  render: () => {
    const [feedback, setFeedback] = React.useState<Record<string, "good" | "bad" | undefined>>({ m2: "good" })
    return (
      <Frame>
        <Chat
          autoFocus={false}
          messages={conversation}
          onSend={() => {}}
          onRegenerate={() => {}}
          feedback={feedback}
          onFeedback={(id, f) => setFeedback((s) => ({ ...s, [id]: f }))}
          toolLabels={toolLabels}
          onToolApprovalResponse={() => {}}
          allowAttachments
        />
      </Frame>
    )
  },
}

export const Empty: Story = {
  render: () => (
    <Frame>
      <Chat
          autoFocus={false}
        messages={[]}
        onSend={() => {}}
        suggestions={["Why did my last deployment fail?", "Summarise this week's incidents", "Draft release notes for v0.8", "Which projects use the most build minutes?"]}
      />
    </Frame>
  ),
}

const reply = "Here's a short summary.\n\n- **3 deployments** failed this week, all on `coreloom-api`.\n- Build minutes are up **12%**, mostly from `docs`.\n- No open incidents.\n\nWant the details for one of them?"

/** Try it: send a message — the reply streams in token by token, and Stop cuts it short. */
export const Streaming: Story = {
  tags: ["no-test"],
  render: () => {
    const [messages, setMessages] = React.useState<AiMessage[]>([])
    const [status, setStatus] = React.useState<AiChatStatus>("ready")
    const timer = React.useRef<ReturnType<typeof setInterval>>(undefined)
    const stop = () => {
      clearInterval(timer.current)
      setStatus("ready")
    }
    return (
      <Frame>
        <Chat
          autoFocus={false}
          messages={messages}
          status={status}
          onStop={stop}
          suggestions={["Summarise this week"]}
          onSend={({ text }) => {
            const id = String(Date.now())
            setMessages((m) => [...m, { id: `u${id}`, role: "user", parts: [{ type: "text", text }] }])
            setStatus("submitted")
            setTimeout(() => {
              setStatus("streaming")
              let i = 0
              timer.current = setInterval(() => {
                i += 3
                setMessages((m) => [
                  ...m.filter((x) => x.id !== `a${id}`),
                  { id: `a${id}`, role: "assistant", parts: [{ type: "text", text: reply.slice(0, i), state: i >= reply.length ? "done" : "streaming" }] },
                ])
                if (i >= reply.length) stop()
              }, 30)
            }, 700)
          }}
        />
      </Frame>
    )
  },
}

export const ErrorState: Story = {
  name: "Error",
  render: () => (
    <Frame>
      <ChatMessages messages={conversation.slice(0, 1)} status="error" onRetry={() => {}} />
    </Frame>
  ),
}

/** Sent, nothing back yet: the typing indicator. */
export const Waiting: Story = {
  render: () => (
    <Frame>
      <Chat autoFocus={false} messages={conversation.slice(0, 1)} status="submitted" onSend={() => {}} onStop={() => {}} />
    </Frame>
  ),
}

/** Still thinking: the reasoning is open and the composer offers Stop. Frozen, so it can be tested. */
export const Thinking: Story = {
  render: () => (
    <Frame frozen>
      <Chat
        autoFocus={false}
        status="streaming"
        onSend={() => {}}
        onStop={() => {}}
        messages={[
          conversation[0],
          { id: "m2", role: "assistant", parts: [{ type: "reasoning", text: "The user asks about failing deployments. Look up the latest builds of coreloom-api", state: "streaming" }] },
        ]}
      />
    </Frame>
  ),
}

/** Mid-answer: a tool has run, another is starting, and the text arrives with its caret. Frozen, so it can be tested. */
export const Answering: Story = {
  render: () => (
    <Frame frozen>
      <Chat
        autoFocus={false}
        status="streaming"
        onSend={() => {}}
        onStop={() => {}}
        toolLabels={toolLabels}
        messages={[
          conversation[0],
          {
            id: "m2",
            role: "assistant",
            parts: [
              { type: "reasoning", text: "Look up the latest builds, then read the error.", state: "done" },
              { type: "tool-searchDeployments", toolCallId: "call_1", state: "output-available", input: { project: "coreloom-api", status: "failed", limit: 3 }, output: { hits: 3 } },
              { type: "tool-readLogs", toolCallId: "call_2", state: "input-streaming", input: { deployment: "dpl_8f2k" } },
              { type: "text", text: "Your last three deployments of **coreloom-api** failed at the same step: the", state: "streaming" },
            ],
          },
        ]}
      />
    </Frame>
  ),
}

// A small chart as an image attachment (an SVG data URL, so the story needs no network).
const chart = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="160" viewBox="0 0 320 160"><rect width="320" height="160" fill="#101418"/><polyline fill="none" stroke="#00c2b8" stroke-width="4" points="10,130 60,110 110,118 160,70 210,84 260,40 310,52"/></svg>'
)}`

/** A user's attachments (an image and a file) and an answer citing uploaded documents. */
export const AttachmentsAndDocuments: Story = {
  render: () => (
    <Frame>
      <Chat
        autoFocus={false}
        onSend={() => {}}
        allowAttachments
        messages={[
          {
            id: "u1",
            role: "user",
            parts: [
              { type: "file", mediaType: "image/svg+xml", url: chart, filename: "error-rate.svg" },
              { type: "file", mediaType: "application/pdf", url: "#", filename: "incident-42.pdf" },
              { type: "text", text: "Does this spike match what the incident report says?" },
            ],
          },
          {
            id: "a1",
            role: "assistant",
            parts: [
              { type: "text", text: "Yes. The error rate jumps at **10:42**, the minute `dpl_8f2k` went live, and falls back after the rollback at 11:05 — the report gives the same times.", state: "done" },
              { type: "source-document", sourceId: "d1", title: "Incident 42 — postmortem", filename: "incident-42.pdf", mediaType: "application/pdf" },
              { type: "source-document", sourceId: "d2", title: "Runbook — rollbacks", filename: "rollbacks.pdf", mediaType: "application/pdf" },
            ],
          },
        ]}
      />
    </Frame>
  ),
}

type Deployment = { id: string; branch: string; status: "ready" | "failed" }

/** A header with the agent, a model picker in the composer, and a tool result drawn as UI (`renderToolOutput`). */
export const WithHeaderAndGenerativeUi: Story = {
  render: () => {
    const [model, setModel] = React.useState("claude-sonnet")
    return (
      <Frame>
        <Chat
          autoFocus={false}
          onSend={() => {}}
          toolLabels={{ listDeployments: "Latest deployments" }}
          header={
            <div className="flex items-center gap-3 border-b border-border-subtle px-5 py-3">
              <h2 className="m-0 text-[15px] font-semibold text-foreground">Deploy doctor</h2>
              <Badge variant="success">
                <BadgeDot />
                Active
              </Badge>
            </div>
          }
          toolbar={
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger size="sm" aria-label="Model" className="h-7 w-auto gap-1.5 border-transparent bg-transparent text-[12.5px] shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="claude-sonnet">Claude Sonnet</SelectItem>
                <SelectItem value="claude-haiku">Claude Haiku</SelectItem>
              </SelectContent>
            </Select>
          }
          renderToolOutput={(name, output) =>
            name === "listDeployments" ? (
              <ul className="m-0 flex list-none flex-col divide-y divide-border-subtle rounded-md border border-border p-0">
                {(output as Deployment[]).map((d) => (
                  <li key={d.id} className="flex items-center gap-3 px-3 py-2">
                    <span className="font-mono text-[12px] text-foreground">{d.id}</span>
                    <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-muted-foreground">{d.branch}</span>
                    <Badge variant={d.status === "ready" ? "success" : "destructive"}>
                      <BadgeDot />
                      {d.status === "ready" ? "Ready" : "Failed"}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : undefined
          }
          messages={[
            { id: "u1", role: "user", parts: [{ type: "text", text: "Show me the latest deployments of coreloom-api." }] },
            {
              id: "a1",
              role: "assistant",
              parts: [
                {
                  type: "tool-listDeployments",
                  toolCallId: "c1",
                  state: "output-available",
                  input: { project: "coreloom-api", limit: 3 },
                  output: [
                    { id: "dpl_8f2k", branch: "main", status: "failed" },
                    { id: "dpl_5t3q", branch: "main", status: "ready" },
                    { id: "dpl_4m1x", branch: "feature/auth", status: "ready" },
                  ],
                },
                { type: "text", text: "The latest one failed; the two before it are ready. Want the logs of `dpl_8f2k`?", state: "done" },
              ],
            },
          ]}
        />
      </Frame>
    )
  },
}

/** The same conversation in French: longer labels, same layout. */
export const French: Story = {
  globals: { locale: "fr" },
  render: () => (
    <Frame>
      <Chat autoFocus={false} messages={conversation} onSend={() => {}} onRegenerate={() => {}} onFeedback={() => {}} toolLabels={toolLabels} onToolApprovalResponse={() => {}} />
    </Frame>
  ),
}

const NOW = new Date("2026-10-14T10:00:00+02:00")
const daysAgo = (d: number) => new Date(NOW.getTime() - d * 86_400_000)
const history: Conversation[] = [
  { id: "c1", title: "Why do my deployments fail?", updatedAt: daysAgo(0) },
  { id: "c2", title: "Release notes for v0.8", updatedAt: daysAgo(0.2) },
  { id: "c3", title: "Build minutes by project", updatedAt: daysAgo(1) },
  { id: "c4", title: "Rename the billing workspace", updatedAt: daysAgo(3) },
  { id: "c5", title: "Incident 42 postmortem", updatedAt: daysAgo(5) },
  { id: "c6", title: "Onboarding checklist", updatedAt: daysAgo(20) },
]

/** The history beside the chat: search, rename and delete from each row's menu. */
export const WithHistory: Story = {
  render: () => {
    const [items, setItems] = React.useState(history)
    const [active, setActive] = React.useState("c1")
    return (
      <div className="flex h-[760px] bg-background">
        <aside className="w-72 shrink-0 border-r border-border-subtle p-3">
          <ConversationList
            conversations={items}
            activeId={active}
            now={NOW}
            onSelect={setActive}
            onNew={() => {}}
            onRename={(id, title) => setItems((all) => all.map((c) => (c.id === id ? { ...c, title } : c)))}
            onDelete={(id) => setItems((all) => all.filter((c) => c.id !== id))}
          />
        </aside>
        <div className="min-w-0 flex-1">
          <Chat autoFocus={false} messages={conversation.slice(0, 2)} onSend={() => {}} onRegenerate={() => {}} toolLabels={toolLabels} />
        </div>
      </div>
    )
  },
}

/** No conversations yet. */
export const EmptyHistory: Story = {
  render: () => (
    <div className="bg-background p-4">
      <aside className="w-72">
        <ConversationList conversations={[]} onNew={() => {}} onSelect={() => {}} />
      </aside>
    </div>
  ),
}
