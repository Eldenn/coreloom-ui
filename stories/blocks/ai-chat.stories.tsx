/* eslint-disable jsx-a11y/no-autofocus -- every autoFocus here is autoFocus={false}: it turns Chat's own focus off. */
import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { Chat, ChatMessages, type Conversation, ConversationList } from '@/components/ai-chat'
import { Badge, BadgeDot } from '@/components/ui/badge'
import { ContextMeter } from '@/components/ui/context-meter'
import { ModelPicker } from '@/components/ui/model-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type AiChatStatus, type AiMessage, messageText } from '@/lib/ai'

import { catalog, usage } from './ai-models'

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
  {
    id: 'm1',
    role: 'user',
    parts: [{ type: 'text', text: 'Why do my coreloom-api deployments keep failing?' }],
  },
  {
    id: 'm2',
    role: 'assistant',
    parts: [
      {
        type: 'reasoning',
        text: 'The user asks about failing deployments. I should look up the latest builds of coreloom-api, then read the error.',
        state: 'done',
      },
      {
        type: 'tool-searchDeployments',
        toolCallId: 'call_1',
        state: 'output-available',
        input: { project: 'coreloom-api', status: 'failed', limit: 3 },
        output: [
          { id: 'dpl_8f2k', branch: 'main', error: 'TS2339' },
          { id: 'dpl_7c1x', branch: 'feat/billing', error: 'TS2339' },
        ],
      },
      { type: 'text', text: answer, state: 'done' },
      {
        type: 'source-url',
        sourceId: 's1',
        url: 'https://coreloom.dev/docs/deployments',
        title: 'Deployments guide',
      },
      {
        type: 'source-url',
        sourceId: 's2',
        url: 'https://coreloom.dev/changelog',
        title: 'Changelog: Workspace.handle',
      },
    ],
  },
  {
    id: 'm3',
    role: 'user',
    parts: [{ type: 'text', text: 'Roll back production to the last green build.' }],
  },
  {
    id: 'm4',
    role: 'assistant',
    parts: [
      {
        type: 'text',
        text: "The last green build is **dpl_5t3q** (2 days ago). Rolling back replaces what's live now.",
        state: 'done',
      },
      {
        type: 'tool-rollback',
        toolCallId: 'call_2',
        state: 'approval-requested',
        input: { project: 'coreloom-api', deployment: 'dpl_5t3q' },
        approval: {
          id: 'appr_1',
          requestReason: 'Rolling back production changes what your users see. Allow it?',
        },
      },
    ],
  },
]

const toolLabels = { searchDeployments: 'Search deployments', rollback: 'Roll back production' }

const meta = {
  title: 'Blocks/AI/Chat',
  component: Chat,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
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
    <div className="h-[760px] bg-background" data-frozen={frozen ? true : undefined}>
      {children}
    </div>
  )
}

export const ConversationStory: Story = {
  name: 'Conversation',
  render: () => {
    const [feedback, setFeedback] = React.useState<Record<string, 'good' | 'bad' | undefined>>({
      m2: 'good',
    })
    return (
      <Frame>
        <Chat
          autoFocus={false}
          messages={conversation}
          onSend={() => {}}
          onRegenerate={() => {}}
          feedback={feedback}
          onFeedback={(id, f) => {
            setFeedback((s) => ({ ...s, [id]: f }))
          }}
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
        suggestions={[
          'Why did my last deployment fail?',
          "Summarise this week's incidents",
          'Draft release notes for v0.8',
          'Which projects use the most build minutes?',
        ]}
      />
    </Frame>
  ),
}

const reply =
  "Here's a short summary.\n\n- **3 deployments** failed this week, all on `coreloom-api`.\n- Build minutes are up **12%**, mostly from `docs`.\n- No open incidents.\n\nWant the details for one of them?"

/** Try it: send a message — the reply streams in token by token, and Stop cuts it short. */
export const Streaming: Story = {
  tags: ['no-test'],
  render: () => {
    const [messages, setMessages] = React.useState<AiMessage[]>([])
    const [status, setStatus] = React.useState<AiChatStatus>('ready')
    const timer = React.useRef<ReturnType<typeof setInterval>>(undefined)
    const stop = () => {
      clearInterval(timer.current)
      setStatus('ready')
    }
    return (
      <Frame>
        <Chat
          autoFocus={false}
          messages={messages}
          status={status}
          onStop={stop}
          suggestions={['Summarise this week']}
          onSend={({ text }) => {
            const id = String(Date.now())
            setMessages((m) => [
              ...m,
              { id: `u${id}`, role: 'user', parts: [{ type: 'text', text }] },
            ])
            setStatus('submitted')
            setTimeout(() => {
              setStatus('streaming')
              let i = 0
              timer.current = setInterval(() => {
                i += 3
                setMessages((m) => [
                  ...m.filter((x) => x.id !== `a${id}`),
                  {
                    id: `a${id}`,
                    role: 'assistant',
                    parts: [
                      {
                        type: 'text',
                        text: reply.slice(0, i),
                        state: i >= reply.length ? 'done' : 'streaming',
                      },
                    ],
                  },
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
  name: 'Error',
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
      <Chat
        autoFocus={false}
        messages={conversation.slice(0, 1)}
        status="submitted"
        onSend={() => {}}
        onStop={() => {}}
      />
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
          {
            id: 'm2',
            role: 'assistant',
            parts: [
              {
                type: 'reasoning',
                text: 'The user asks about failing deployments. Look up the latest builds of coreloom-api',
                state: 'streaming',
              },
            ],
          },
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
            id: 'm2',
            role: 'assistant',
            parts: [
              {
                type: 'reasoning',
                text: 'Look up the latest builds, then read the error.',
                state: 'done',
              },
              {
                type: 'tool-searchDeployments',
                toolCallId: 'call_1',
                state: 'output-available',
                input: { project: 'coreloom-api', status: 'failed', limit: 3 },
                output: { hits: 3 },
              },
              {
                type: 'tool-readLogs',
                toolCallId: 'call_2',
                state: 'input-streaming',
                input: { deployment: 'dpl_8f2k' },
              },
              {
                type: 'text',
                text: 'Your last three deployments of **coreloom-api** failed at the same step: the',
                state: 'streaming',
              },
            ],
          },
        ]}
      />
    </Frame>
  ),
}

// A small chart as an image attachment (an SVG data URL, so the story needs no network).
const chart = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="160" viewBox="0 0 320 160"><rect width="320" height="160" fill="#101418"/><polyline fill="none" stroke="#00c2b8" stroke-width="4" points="10,130 60,110 110,118 160,70 210,84 260,40 310,52"/></svg>',
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
            id: 'u1',
            role: 'user',
            parts: [
              { type: 'file', mediaType: 'image/svg+xml', url: chart, filename: 'error-rate.svg' },
              { type: 'file', mediaType: 'application/pdf', url: '#', filename: 'incident-42.pdf' },
              { type: 'text', text: 'Does this spike match what the incident report says?' },
            ],
          },
          {
            id: 'a1',
            role: 'assistant',
            parts: [
              {
                type: 'text',
                text: 'Yes. The error rate jumps at **10:42**, the minute `dpl_8f2k` went live, and falls back after the rollback at 11:05 — the report gives the same times.',
                state: 'done',
              },
              {
                type: 'source-document',
                sourceId: 'd1',
                title: 'Incident 42 — postmortem',
                filename: 'incident-42.pdf',
                mediaType: 'application/pdf',
              },
              {
                type: 'source-document',
                sourceId: 'd2',
                title: 'Runbook — rollbacks',
                filename: 'rollbacks.pdf',
                mediaType: 'application/pdf',
              },
            ],
          },
        ]}
      />
    </Frame>
  ),
}

interface Deployment {
  id: string
  branch: string
  status: 'ready' | 'failed'
}

/** A header with the agent, a model picker in the composer, and a tool result drawn as UI (`renderToolOutput`). */
export const WithHeaderAndGenerativeUi: Story = {
  render: () => {
    const [model, setModel] = React.useState('claude-sonnet')
    return (
      <Frame>
        <Chat
          autoFocus={false}
          onSend={() => {}}
          toolLabels={{ listDeployments: 'Latest deployments' }}
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
              <SelectTrigger
                size="sm"
                aria-label="Model"
                className="h-7 w-auto gap-1.5 border-transparent bg-transparent text-[12.5px] shadow-none"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="claude-sonnet">Claude Sonnet</SelectItem>
                <SelectItem value="claude-haiku">Claude Haiku</SelectItem>
              </SelectContent>
            </Select>
          }
          renderToolOutput={(name, output) =>
            name === 'listDeployments' ? (
              <ul className="m-0 flex list-none flex-col divide-y divide-border-subtle rounded-md border border-border p-0">
                {(output as Deployment[]).map((d) => (
                  <li key={d.id} className="flex items-center gap-3 px-3 py-2">
                    <span className="font-mono text-[12px] text-foreground">{d.id}</span>
                    <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-muted-foreground">
                      {d.branch}
                    </span>
                    <Badge variant={d.status === 'ready' ? 'success' : 'destructive'}>
                      <BadgeDot />
                      {d.status === 'ready' ? 'Ready' : 'Failed'}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : undefined
          }
          messages={[
            {
              id: 'u1',
              role: 'user',
              parts: [{ type: 'text', text: 'Show me the latest deployments of coreloom-api.' }],
            },
            {
              id: 'a1',
              role: 'assistant',
              parts: [
                {
                  type: 'tool-listDeployments',
                  toolCallId: 'c1',
                  state: 'output-available',
                  input: { project: 'coreloom-api', limit: 3 },
                  output: [
                    { id: 'dpl_8f2k', branch: 'main', status: 'failed' },
                    { id: 'dpl_5t3q', branch: 'main', status: 'ready' },
                    { id: 'dpl_4m1x', branch: 'feature/auth', status: 'ready' },
                  ],
                },
                {
                  type: 'text',
                  text: 'The latest one failed; the two before it are ready. Want the logs of `dpl_8f2k`?',
                  state: 'done',
                },
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
  globals: { locale: 'fr' },
  render: () => (
    <Frame>
      <Chat
        autoFocus={false}
        messages={conversation}
        onSend={() => {}}
        onRegenerate={() => {}}
        onFeedback={() => {}}
        toolLabels={toolLabels}
        onToolApprovalResponse={() => {}}
      />
    </Frame>
  ),
}

const cited: AiMessage[] = [
  {
    id: 'c1',
    role: 'user',
    parts: [{ type: 'text', text: 'How do I undo a bad deployment, and how long can I wait?' }],
  },
  {
    id: 'c2',
    role: 'assistant',
    parts: [
      {
        type: 'text',
        state: 'done',
        text: "Roll back to the last green build: it replaces what's live in about a minute and keeps the failed build for inspection [1].\n\nYou have **7 days**: older builds are pruned, after which you redeploy from the branch instead [1][2]. The postmortem of incident 42 recommends rolling back first and debugging after [3].\n\nIn a script, `deployments[1]` is the previous build.",
      },
      {
        type: 'source-url',
        sourceId: 's1',
        url: 'https://coreloom.dev/docs/deployments',
        title: 'Deployments guide',
      },
      {
        type: 'source-url',
        sourceId: 's2',
        url: 'https://coreloom.dev/docs/retention',
        title: 'Retention of builds',
      },
      {
        type: 'source-document',
        sourceId: 'd1',
        title: 'Incident 42 — postmortem',
        filename: 'incident-42.pdf',
        mediaType: 'application/pdf',
      },
    ],
  },
]

/** An answer citing its sources: "[1]" in the text becomes a pill that shows the source on hover, focus or tap; the chips below carry the same numbers. */
export const Citations: Story = {
  render: () => (
    <Frame>
      <Chat
        autoFocus={false}
        messages={cited}
        onSend={() => {}}
        onRegenerate={() => {}}
        onFeedback={() => {}}
      />
    </Frame>
  ),
}

/** Mid-answer: the citations already known are pills, and a half-written "[2" stays text until it closes. Frozen, so it can be tested. */
export const CitationsWhileStreaming: Story = {
  render: () => (
    <Frame frozen>
      <Chat
        autoFocus={false}
        status="streaming"
        onSend={() => {}}
        onStop={() => {}}
        messages={[
          cited[0],
          {
            id: 'c2',
            role: 'assistant',
            parts: [
              {
                type: 'source-url',
                sourceId: 's1',
                url: 'https://coreloom.dev/docs/deployments',
                title: 'Deployments guide',
              },
              {
                type: 'source-url',
                sourceId: 's2',
                url: 'https://coreloom.dev/docs/retention',
                title: 'Retention of builds',
              },
              {
                type: 'text',
                state: 'streaming',
                text: 'Roll back to the last green build [1]. You have **7 days** before older builds are pruned [2',
              },
            ],
          },
        ]}
      />
    </Frame>
  ),
}

// A tiny conversation tree for EditAndBranches: each message has a parent, and the parent remembers which
// of its children is shown. The thread on screen is the path that follows those choices.
interface Node {
  message: AiMessage
  parent?: string
  children: string[]
  active: number
}

const alternatives: Record<string, string[]> = {
  rollback: [
    'Run `coreloom rollback coreloom-api --to dpl_5t3q`. It swaps the live build in about a minute.',
    'Open **Deployments**, pick the last green build (**dpl_5t3q**) and choose *Promote to production*. Same result as the CLI, no terminal needed.',
    "Roll back with the CLI, then pin the build so the next push doesn't replace it before the fix lands:\n\n```bash\ncoreloom rollback coreloom-api --to dpl_5t3q --pin\n```",
  ],
  other: [
    "Here's what I'd do: check the last green deployment, roll back to it, then fix forward on a branch.",
    'Short version: roll back first, investigate second. The build logs of the failed deployment stay available.',
  ],
}

function seed(): Record<string, Node> {
  const user: AiMessage = {
    id: 'u1',
    role: 'user',
    parts: [{ type: 'text', text: 'How do I roll back coreloom-api?' }],
  }
  const answers = alternatives.rollback.slice(0, 2).map((text, i): AiMessage => ({
    id: `a1-${i}`,
    role: 'assistant',
    parts: [{ type: 'text', text, state: 'done' }],
  }))
  return {
    root: { message: { id: 'root', role: 'system', parts: [] }, children: ['u1'], active: 0 },
    u1: { message: user, parent: 'root', children: answers.map((a) => a.id), active: 1 },
    ...Object.fromEntries(
      answers.map((a) => [a.id, { message: a, parent: 'u1', children: [], active: 0 }]),
    ),
  }
}

/**
 * Try it: edit your message (Escape cancels, Ctrl or ⌘ + Enter saves) — the old wording stays as version 1.
 * Regenerate the answer, then flip between versions with ‹ ›. State lives in the story; the answers are canned.
 */
export const EditAndBranches: Story = {
  render: () => {
    const [tree, setTree] = React.useState(seed)
    const [status, setStatus] = React.useState<AiChatStatus>('ready')
    const counter = React.useRef(0)

    const thread: Node[] = []
    for (let node = tree.root; node.children.length;) {
      node = tree[node.children[node.active]]
      thread.push(node)
    }
    const branches = Object.fromEntries(
      thread.map((n) => [
        n.message.id,
        { index: tree[n.parent!].active, count: tree[n.parent!].children.length },
      ]),
    )

    // Adds an answer under `parentId` after a short wait, picking a canned text the parent hasn't shown yet.
    const answer = (parentId: string, topic: string) => {
      setStatus('submitted')
      setTimeout(() => {
        setTree((t) => {
          const parent = t[parentId]
          const pool = alternatives[topic]
          const text = pool[parent.children.length % pool.length]
          const id = `answer${++counter.current}`
          const message: AiMessage = {
            id,
            role: 'assistant',
            parts: [{ type: 'text', text, state: 'done' }],
          }
          return {
            ...t,
            [id]: { message, parent: parentId, children: [], active: 0 },
            [parentId]: {
              ...parent,
              children: [...parent.children, id],
              active: parent.children.length,
            },
          }
        })
        setStatus('ready')
      }, 500)
    }
    const add = (parentId: string, text: string) => {
      const id = `edit${++counter.current}`
      setTree((t) => {
        const parent = t[parentId]
        const message: AiMessage = { id, role: 'user', parts: [{ type: 'text', text }] }
        return {
          ...t,
          [id]: { message, parent: parentId, children: [], active: 0 },
          [parentId]: {
            ...parent,
            children: [...parent.children, id],
            active: parent.children.length,
          },
        }
      })
      answer(id, /roll ?back/i.test(text) ? 'rollback' : 'other')
    }

    return (
      <Frame>
        <Chat
          autoFocus={false}
          messages={thread.map((n) => n.message)}
          status={status}
          branches={branches}
          onBranchChange={(id, index) => {
            setTree((t) => ({ ...t, [t[id].parent!]: { ...t[t[id].parent!], active: index } }))
          }}
          // An edit is a new sibling of the edited message, answered afresh.
          onEdit={(id, text) => {
            add(tree[id].parent!, text)
          }}
          onRegenerate={() => {
            const last = thread.at(-1)
            if (last?.message.role === 'assistant')
              answer(
                last.parent!,
                /roll ?back/i.test(messageText(tree[last.parent!].message)) ? 'rollback' : 'other',
              )
          }}
          onSend={({ text }) => {
            add(thread[thread.length - 1]?.message.id ?? 'root', text)
          }}
        />
      </Frame>
    )
  },
}

const NOW = new Date('2026-10-14T10:00:00+02:00')
const daysAgo = (d: number) => new Date(NOW.getTime() - d * 86_400_000)
const history: Conversation[] = [
  { id: 'c1', title: 'Why do my deployments fail?', updatedAt: daysAgo(0) },
  { id: 'c2', title: 'Release notes for v0.8', updatedAt: daysAgo(0.2) },
  { id: 'c3', title: 'Build minutes by project', updatedAt: daysAgo(1) },
  { id: 'c4', title: 'Rename the billing workspace', updatedAt: daysAgo(3) },
  { id: 'c5', title: 'Incident 42 postmortem', updatedAt: daysAgo(5) },
  { id: 'c6', title: 'Onboarding checklist', updatedAt: daysAgo(20) },
]

/** The history beside the chat: search, rename and delete from each row's menu. */
export const WithHistory: Story = {
  render: () => {
    const [items, setItems] = React.useState(history)
    const [active, setActive] = React.useState('c1')
    return (
      <div className="flex h-[760px] bg-background">
        <aside className="w-72 shrink-0 border-r border-border-subtle p-3">
          <ConversationList
            conversations={items}
            activeId={active}
            now={NOW}
            onSelect={setActive}
            onNew={() => {}}
            onRename={(id, title) => {
              setItems((all) => all.map((c) => (c.id === id ? { ...c, title } : c)))
            }}
            onDelete={(id) => {
              setItems((all) => all.filter((c) => c.id !== id))
            }}
          />
        </aside>
        <div className="min-w-0 flex-1">
          <Chat
            autoFocus={false}
            messages={conversation.slice(0, 2)}
            onSend={() => {}}
            onRegenerate={() => {}}
            toolLabels={toolLabels}
          />
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

/** A model picker and the context meter in the composer's toolbar. Switch to GPT mini (128K): the same conversation fills more of its window. */
export const WithModelPicker: Story = {
  render: () => {
    const [model, setModel] = React.useState('claude-sonnet')
    const current = catalog.find((m) => m.id === model)
    return (
      <Frame>
        <Chat
          autoFocus={false}
          messages={conversation.slice(0, 2)}
          onSend={() => {}}
          onRegenerate={() => {}}
          toolLabels={toolLabels}
          allowAttachments
          toolbar={
            <>
              <ModelPicker models={catalog} value={model} onValueChange={setModel} />
              <ContextMeter used={usage} model={current} />
            </>
          }
        />
      </Frame>
    )
  },
}
