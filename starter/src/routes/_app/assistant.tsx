// A chat with an assistant, beside the history of conversations. The answers are simulated by
// useDemoChat (@coreloom/demo-chat), which has useChat's shape: swap in @ai-sdk/react's
// useChat with your own endpoint and the page stays the same. The URL holds the conversation
// (/assistant?c=c1), so a conversation can be linked to and the Back button works. "Ask AI" in the
// ⌘K palette lands here with ?q=…, which starts a new conversation with that question.
import { useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { MessagesSquareIcon } from 'lucide-react'
import * as React from 'react'
import { z } from 'zod'

import { Chat, ConversationList, type Feedback } from '@/components/ai-chat'
import { PageHeader } from '@/components/app-shell'
import { Button } from '@/components/ui/button'
import { ContextMeter } from '@/components/ui/context-meter'
import { ModelPicker } from '@/components/ui/model-picker'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useDemoChat } from '@/hooks/use-demo-chat'
import { type AiMessage, messageText } from '@/lib/ai'
import { deleteConversation, models, renameConversation, saveConversation } from '@/lib/ai-api'
import { useT } from '@/lib/locale'
import { conversationsQuery, messagesQuery } from '@/lib/queries'

export const Route = createFileRoute('/_app/assistant')({
  validateSearch: z.object({
    c: z.string().optional().catch(undefined),
    q: z.string().optional().catch(undefined),
  }),
  staticData: { crumb: (t) => t.nav.assistant },
  loaderDeps: ({ search }) => ({ c: search.c }),
  loader: ({ context, deps }) =>
    Promise.all([
      context.queryClient.query({ ...conversationsQuery, staleTime: 'static' }),
      deps.c ? context.queryClient.query({ ...messagesQuery(deps.c), staleTime: 'static' }) : null,
    ]),
  component: AssistantPage,
})

const newId = () => `c${Date.now().toString(36)}`

function AssistantPage() {
  const t = useT()
  const { c, q } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const queryClient = useQueryClient()
  const { data: conversations } = useSuspenseQuery(conversationsQuery)
  // A new conversation gets its id up front; it joins the list once it has an answer.
  const [draft, setDraft] = React.useState(newId)
  const id = c ?? draft
  const [listOpen, setListOpen] = React.useState(false)

  const open = (next?: string) => {
    if (!next) setDraft(newId())
    setListOpen(false)
    void navigate({ search: next ? { c: next } : {} })
  }

  const list = (
    <ConversationList
      conversations={conversations}
      activeId={c}
      onSelect={open}
      onNew={() => {
        open()
      }}
      onRename={async (cid, title) => {
        await renameConversation(cid, title)
        await queryClient.invalidateQueries({ queryKey: conversationsQuery.queryKey })
      }}
      onDelete={async (cid) => {
        await deleteConversation(cid)
        queryClient.removeQueries({ queryKey: messagesQuery(cid).queryKey })
        await queryClient.invalidateQueries({ queryKey: conversationsQuery.queryKey })
        if (cid === c) open()
      }}
    />
  )

  return (
    <>
      <PageHeader
        title={t.ai.assistant.title}
        description={
          <>
            {t.ai.assistant.description} {t.ai.demo}
          </>
        }
        actions={
          <Sheet open={listOpen} onOpenChange={setListOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <MessagesSquareIcon />
                {t.ai.assistant.conversations}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-4">
              <SheetHeader className="p-0">
                <SheetTitle>{t.ai.assistant.conversations}</SheetTitle>
                <SheetDescription className="sr-only">
                  {t.ai.assistant.description}
                </SheetDescription>
              </SheetHeader>
              {list}
            </SheetContent>
          </Sheet>
        }
      />
      <div className="flex h-[calc(100svh-16rem)] min-h-[440px] gap-6 lg:h-[calc(100svh-13rem)]">
        <aside className="hidden w-64 shrink-0 flex-col lg:flex">{list}</aside>
        <section
          aria-label={t.ai.assistant.title}
          className="min-w-0 flex-1 overflow-hidden rounded-lg border border-border bg-card"
        >
          <Conversation
            key={q ? `q-${q}` : id}
            id={id}
            saved={!!c}
            ask={c ? undefined : q}
            onSaved={() => !c && void navigate({ search: { c: id }, replace: true })}
          />
        </section>
      </div>
    </>
  )
}

// A rough count for the demo's context meter: about four characters per token.
const estimateTokens = (messages: AiMessage[]) =>
  Math.round(messages.reduce((n, m) => n + messageText(m).length, 0) / 4) + 1800

function Conversation({
  id,
  saved,
  ask,
  onSaved,
}: {
  id: string
  saved: boolean
  ask?: string
  onSaved: () => void
}) {
  const t = useT()
  const queryClient = useQueryClient()
  // Loaded by the route for saved conversations; a new one starts empty.
  const { data: initialMessages } = useQuery({ ...messagesQuery(id), enabled: saved })
  const [feedback, setFeedback] = React.useState<Record<string, Feedback | undefined>>({})
  const [model, setModel] = React.useState('claude-sonnet')

  const save = async (messages: AiMessage[]) => {
    const first = messages.find((m) => m.role === 'user')?.parts.find((p) => p.type === 'text') as
      { text: string } | undefined
    const title = first ? first.text.slice(0, 60) : t.ai.assistant.newTitle
    await saveConversation(id, title, messages)
    queryClient.setQueryData(messagesQuery(id).queryKey, messages)
    await queryClient.invalidateQueries({ queryKey: conversationsQuery.queryKey, exact: true })
    onSaved()
  }

  const chat = useDemoChat({
    initialMessages: initialMessages ?? [],
    script: {
      ...t.ai.script,
      tool: {
        name: 'searchDocs',
        input: (q) => ({ query: q.slice(0, 60) }),
        output: { hits: 3, top: 'Deployments guide.md' },
      },
      source: { url: 'https://eldenn.github.io/coreloom-ui/', title: 'Deployments guide' },
    },
    onFinish: (messages) => void save(messages),
  })

  // A question from the ⌘K palette is sent once, as soon as the conversation opens.
  const asked = React.useRef(false)
  React.useEffect(() => {
    if (ask && !asked.current) {
      asked.current = true
      chat.sendMessage({ text: ask })
    }
  }, [ask, chat])

  return (
    <Chat
      messages={chat.messages}
      status={chat.status}
      error={chat.error}
      onSend={chat.sendMessage}
      onStop={chat.stop}
      onRegenerate={chat.regenerate}
      onEdit={chat.edit}
      onToolApprovalResponse={chat.addToolApprovalResponse}
      feedback={feedback}
      onFeedback={(mid, f) => {
        setFeedback((all) => ({ ...all, [mid]: f }))
      }}
      suggestions={t.ai.suggestions}
      allowAttachments
      toolbar={
        <>
          <ModelPicker models={models} value={model} onValueChange={setModel} />
          <ContextMeter
            used={estimateTokens(chat.messages)}
            model={models.find((m) => m.id === model)}
          />
        </>
      }
    />
  )
}
