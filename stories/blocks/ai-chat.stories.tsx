import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { Chat, ChatMessages, ConversationList, type Conversation } from "@/components/ai-chat"
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

function Frame({ children }: { children: React.ReactNode }) {
  return <div className="h-[760px] bg-background">{children}</div>
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
