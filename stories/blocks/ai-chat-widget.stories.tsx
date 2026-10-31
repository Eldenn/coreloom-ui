import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { ChatWidget } from '@/components/ai-chat-widget'
import type { AiChatStatus, AiMessage } from '@/lib/ai'
import { cn } from '@/lib/utils'

const meta = {
  title: 'Blocks/AI/Chat widget',
  component: ChatWidget,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          "The support bubble in a page's corner: a round launcher with an unread count and an optional greeting, opening the `Chat` in a card above it (a full-screen sheet below 640px). It takes the Chat's props as they are (`messages`, `status`, `onSend`, `onStop`, `suggestions`…), plus `open` / `defaultOpen` / `onOpenChange`, `title`, `subtitle`, `avatar`, `presence`, `unread`, `greeting`, `side`, `offset` and `zIndex`. Not modal on a desktop; Escape folds it back into the launcher.",
      },
    },
  },
  args: {
    messages: [],
    onSend: () => {},
    title: 'Chat with Coreloom',
    side: 'right',
    unread: 0,
    presence: 'online',
  },
  argTypes: {
    side: { control: 'inline-radio', options: ['right', 'left'] },
    presence: { control: 'inline-radio', options: ['online', 'away', 'offline'] },
    unread: { control: { type: 'number', min: 0 } },
    title: { control: 'text' },
    subtitle: { control: 'text' },
    greeting: { control: 'text' },
    offset: { control: 'number' },
    zIndex: { control: 'number' },
    defaultOpen: { control: 'boolean' },
    fullScreen: { control: 'boolean' },
    messages: { control: false },
    onSend: { control: false },
  },
} satisfies Meta<typeof ChatWidget>
export default meta
type Story = StoryObj<typeof meta>

/** A placeholder page behind the widget. `transform` makes it the widget's containing block, so the
 *  fixed launcher stays inside the frame (and inside each example on the docs page). */
function Page({ phone, children }: { phone?: boolean; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'relative h-[760px] [transform:translateZ(0)] overflow-hidden bg-background',
        phone && 'mx-auto w-[390px] border-x border-border-subtle',
      )}
    >
      <div className="flex items-center gap-3 border-b border-border-subtle px-6 py-3.5">
        <span className="font-display text-[15px] font-semibold text-foreground">Coreloom</span>
        <span className="text-[13px] text-muted-foreground">Deployments</span>
      </div>
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-8">
        <h1 className="m-0 font-display text-[26px] font-semibold tracking-[-0.015em] text-foreground">
          Deployments
        </h1>
        <p className="m-0 max-w-prose text-[14px] text-muted-foreground">
          Every push to a connected branch builds and deploys. The latest builds of your projects
          are listed here.
        </p>
        {[
          'coreloom-api · main · Ready',
          'coreloom-web · main · Ready',
          'coreloom-api · feat/billing · Failed',
          'docs · main · Ready',
        ].map((row) => (
          <div
            key={row}
            className="rounded-lg border border-border bg-card px-4 py-3 text-[13.5px] text-foreground"
          >
            {row}
          </div>
        ))}
      </div>
      {children}
    </div>
  )
}

const welcome: AiMessage[] = [
  {
    id: 'w1',
    role: 'assistant',
    parts: [{ type: 'text', text: "Hi! I'm the Coreloom assistant.", state: 'done' }],
  },
  {
    id: 'w2',
    role: 'assistant',
    parts: [
      {
        type: 'text',
        text: 'Ask me anything about **builds, deploys or billing**.',
        state: 'done',
      },
    ],
  },
]

const conversation: AiMessage[] = [
  { id: 'm1', role: 'user', parts: [{ type: 'text', text: 'Why did my last deploy fail?' }] },
  {
    id: 'm2',
    role: 'assistant',
    parts: [
      {
        type: 'text',
        text: 'The type check failed on **coreloom-api**: `slug` was renamed to `handle` in `Workspace`.\n\nUpdate the route, then push again:\n\n```tsx\nconst { handle } = useLoaderData()\n```',
        state: 'done',
      },
    ],
  },
  { id: 'm3', role: 'user', parts: [{ type: 'text', text: 'Thanks, that fixed it.' }] },
  {
    id: 'm4',
    role: 'assistant',
    parts: [{ type: 'text', text: 'Glad to hear it. Anything else?', state: 'done' }],
  },
]

const CANNED =
  "Thanks! I've looked it up: your last build of **coreloom-api** is ready, and nothing is queued. Anything else?"

/** Holds the conversation: a message gets a canned reply after a short wait (no API). Replies that
 *  arrive while the widget is closed add to the unread count. */
function Demo({
  initial = [],
  unread: initialUnread = 0,
  ...props
}: Omit<React.ComponentProps<typeof ChatWidget>, 'messages' | 'onSend'> & {
  initial?: AiMessage[]
}) {
  const [messages, setMessages] = React.useState<AiMessage[]>(initial)
  const [status, setStatus] = React.useState<AiChatStatus>('ready')
  const [ownOpen, setOwnOpen] = React.useState(!!props.defaultOpen)
  // The app may hold the open state itself (see Controlled).
  const open = props.open ?? ownOpen
  const setOpen = (o: boolean) => {
    props.onOpenChange ? props.onOpenChange(o) : setOwnOpen(o)
  }
  const [unread, setUnread] = React.useState(initialUnread)
  const openRef = React.useRef(open)
  openRef.current = open
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  React.useEffect(
    () => () => {
      clearTimeout(timer.current)
    },
    [],
  )
  return (
    <ChatWidget
      {...props}
      defaultOpen={undefined}
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (o) setUnread(0)
      }}
      unread={unread}
      messages={messages}
      status={status}
      onStop={() => {
        clearTimeout(timer.current)
        setStatus('ready')
      }}
      onSend={({ text }) => {
        const id = String(messages.length)
        setMessages((m) => [...m, { id: `u${id}`, role: 'user', parts: [{ type: 'text', text }] }])
        setStatus('submitted')
        timer.current = setTimeout(() => {
          setMessages((m) => [
            ...m,
            {
              id: `a${id}`,
              role: 'assistant',
              parts: [{ type: 'text', text: CANNED, state: 'done' }],
            },
          ])
          setStatus('ready')
          if (!openRef.current) setUnread((n) => n + 1)
        }, 1200)
      }}
    />
  )
}

/** Closed, with a greeting next to the launcher and two unread messages. Open it and send something. */
export const Closed: Story = {
  args: { greeting: 'Hi! Questions about deploys?', unread: 2 },
  render: (args) => (
    <Page>
      <Demo {...args} initial={welcome} />
    </Page>
  ),
}

/** Open on a short conversation. Send a message: a canned reply comes back. */
export const Open: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <Page>
      <Demo {...args} initial={conversation} />
    </Page>
  ),
}

/** Open on an empty conversation: the suggestions. */
export const OpenEmpty: Story = {
  name: 'Open, empty',
  args: { defaultOpen: true, subtitle: 'Ask about builds, deploys and billing' },
  render: (args) => (
    <Page>
      <Demo
        {...args}
        suggestions={[
          'Why did my last deploy fail?',
          'How do I add a domain?',
          'Where is my invoice?',
        ]}
      />
    </Page>
  ),
}

/** In the left corner, away: the greeting sits on the launcher's right. */
export const LeftSide: Story = {
  name: 'Left side',
  args: {
    side: 'left',
    presence: 'away',
    greeting: "We're away — leave a message and we'll answer by email.",
    unread: 0,
  },
  render: (args) => (
    <Page>
      <Demo {...args} initial={welcome} />
    </Page>
  ),
}

/** On a phone (390px wide), the chat takes the whole screen. `fullScreen` forces it here; in an app it
 *  switches by itself below 640px. */
export const OnPhone: Story = {
  name: 'Open on phone',
  args: { defaultOpen: true, fullScreen: true },
  render: (args) => (
    <Page phone>
      <Demo {...args} initial={conversation} />
    </Page>
  ),
}

/** The same, in French: longer labels, same layout. */
export const French: Story = {
  globals: { locale: 'fr' },
  args: { defaultOpen: true, title: 'Discuter avec Coreloom', subtitle: undefined },
  render: (args) => (
    <Page>
      <Demo
        {...args}
        initial={[
          {
            id: 'f1',
            role: 'user',
            parts: [{ type: 'text', text: 'Pourquoi mon dernier déploiement a-t-il échoué ?' }],
          },
          {
            id: 'f2',
            role: 'assistant',
            parts: [
              {
                type: 'text',
                text: "La vérification des types a échoué sur **coreloom-api** : `slug` s'appelle désormais `handle`.",
                state: 'done',
              },
            ],
          },
        ]}
      />
    </Page>
  ),
}

const cited: AiMessage[] = [
  {
    id: 'c1',
    role: 'user',
    parts: [{ type: 'text', text: 'How long can I wait before rolling back?' }],
  },
  {
    id: 'c2',
    role: 'assistant',
    parts: [
      {
        type: 'text',
        state: 'done',
        text: "Roll back to the last green build: it replaces what's live in about a minute [1]. You have **7 days** before older builds are pruned [2].",
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
    ],
  },
]

/** An answer with citations. Escape on an open citation closes only its card; a second Escape closes the chat. */
export const WithCitations: Story = {
  name: 'With citations',
  args: { defaultOpen: true },
  render: (args) => (
    <Page>
      <Demo {...args} initial={cited} />
    </Page>
  ),
}

/** The app holds the open state: "Ask AI" in the page opens it (the cursor goes to the composer), and
 *  Ctrl + / toggles it from anywhere — closing it from the keyboard gives focus back to the launcher. */
export const Controlled: Story = {
  render: (args) => {
    const [open, setOpen] = React.useState(false)
    React.useEffect(() => {
      const onKey = (e: KeyboardEvent) => {
        if (e.key === '/' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault()
          setOpen((o) => !o)
        }
      }
      window.addEventListener('keydown', onKey)
      return () => {
        window.removeEventListener('keydown', onKey)
      }
    }, [])
    return (
      <Page>
        <div className="absolute top-2 right-6">
          <button
            type="button"
            onClick={() => {
              setOpen(true)
            }}
            className="cursor-pointer rounded-md border border-border bg-card px-3 py-1.5 text-[13px] text-foreground outline-none hover:border-border-strong focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            Ask AI
          </button>
        </div>
        <Demo {...args} open={open} onOpenChange={setOpen} initial={conversation} />
      </Page>
    )
  },
}
