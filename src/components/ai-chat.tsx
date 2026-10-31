"use client"

// Coreloom UI — AI chat (block). A conversation with a model, ready for the AI SDK's useChat:
//
//   const { messages, status, error, sendMessage, stop, regenerate, addToolApprovalResponse } = useChat()
//   <Chat messages={messages} status={status} error={error}
//     onSend={({ text, files }) => sendMessage({ text, files })} onStop={stop}
//     onRegenerate={() => regenerate()} onToolApprovalResponse={addToolApprovalResponse} />
//
// Parts: Chat (the whole thing), ChatMessages (the scrolling log), ChatMessage (one message: text in
// Markdown, reasoning, tool calls, files, sources), ChatEmpty (suggestions) and ConversationList (the
// history beside it).
import * as React from "react"
import { ArrowDownIcon, CheckIcon, CopyIcon, FileIcon, LinkIcon, MoreHorizontalIcon, PencilIcon, PlusIcon, RefreshCwIcon, SearchIcon, SparklesIcon, ThumbsDownIcon, ThumbsUpIcon, Trash2Icon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  isFilePart,
  isReasoningPart,
  isSourcePart,
  isTextPart,
  isToolPart,
  messageText,
  type AiChatStatus,
  type AiMessage,
  type AiSourceDocumentPart,
  type AiSourceUrlPart,
  type AiToolPart,
} from "@/lib/ai"
import { AppLink } from "@/lib/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Markdown } from "@/components/ui/markdown"
import { PromptInput } from "@/components/ui/prompt-input"
import { Reasoning } from "@/components/ui/reasoning"
import { ToolCall } from "@/components/ui/tool-call"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useCoreloomI18n } from "@/lib/i18n"

type Feedback = "good" | "bad"

type ToolOptions = {
  /** Human names for tools, by id: { searchDocs: "Search the docs" }. */
  toolLabels?: Record<string, React.ReactNode>
  /** Draw a tool's output yourself (by tool id); JSON otherwise. */
  renderToolOutput?: (toolName: string, output: unknown) => React.ReactNode | undefined
  onToolApprovalResponse?: (response: { id: string; approved: boolean }) => void
}

function IconAction({ label, onClick, pressed, children }: { label: string; onClick: () => void; pressed?: boolean; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={label}
          aria-pressed={pressed}
          onClick={onClick}
          className={cn("text-muted-foreground aria-pressed:text-primary-text", pressed && "bg-primary-subtle")}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function Sources({ sources }: { sources: (AiSourceUrlPart | AiSourceDocumentPart)[] }) {
  const t = useCoreloomI18n().messages.ai.chat
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">{t.sources}</span>
      <ol className="m-0 flex list-none flex-wrap gap-1.5 p-0">
        {sources.map((s, i) => (
          <li key={s.sourceId}>
            {s.type === "source-url" ? (
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex max-w-64 items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[12px] text-foreground outline-none hover:border-border-strong focus-visible:ring-[3px] focus-visible:ring-ring"
              >
                <span className="font-mono text-[11px] text-muted-foreground">{i + 1}</span>
                <span className="truncate">{s.title ?? new URL(s.url).hostname}</span>
                <LinkIcon className="size-3 shrink-0 text-muted-foreground" aria-hidden />
              </a>
            ) : (
              <span className="inline-flex max-w-64 items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[12px] text-foreground">
                <span className="font-mono text-[11px] text-muted-foreground">{i + 1}</span>
                <span className="truncate">{s.title}</span>
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}

function Attachment({ part }: { part: { mediaType: string; url: string; filename?: string } }) {
  if (part.mediaType.startsWith("image/"))
    return <img src={part.url} alt={part.filename ?? ""} className="max-h-48 max-w-64 rounded-md border border-border object-cover" />
  return (
    <a
      href={part.url}
      target="_blank"
      rel="noreferrer noopener"
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-[12.5px] text-foreground outline-none hover:border-border-strong focus-visible:ring-[3px] focus-visible:ring-ring"
    >
      <FileIcon className="size-3.5 text-muted-foreground" aria-hidden />
      {part.filename ?? part.mediaType}
    </a>
  )
}

/** One message. Assistant messages render their parts in order; user messages are a bubble. */
function ChatMessage({
  message,
  streaming = false,
  isLast = false,
  feedback,
  onFeedback,
  onRegenerate,
  toolLabels,
  renderToolOutput,
  onToolApprovalResponse,
  className,
}: {
  message: AiMessage
  /** This message is the one being written. */
  streaming?: boolean
  /** The last message (only it offers Regenerate). */
  isLast?: boolean
  feedback?: Feedback
  onFeedback?: (messageId: string, feedback: Feedback | undefined) => void
  onRegenerate?: () => void
  className?: string
} & ToolOptions) {
  const t = useCoreloomI18n().messages.ai.chat
  const [copied, setCopied] = React.useState(false)
  React.useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 1400)
    return () => clearTimeout(timer)
  }, [copied])

  if (message.role === "system") return null

  if (message.role === "user") {
    return (
      <article data-slot="chat-message" data-role="user" aria-label={t.you} className={cn("flex flex-col items-end gap-2", className)}>
        {message.parts.filter(isFilePart).length > 0 && (
          <div className="flex flex-wrap justify-end gap-2">
            {message.parts.filter(isFilePart).map((p, i) => (
              <Attachment key={i} part={p} />
            ))}
          </div>
        )}
        {messageText(message) && (
          <div className="max-w-[85%] rounded-2xl rounded-br-md bg-secondary px-4 py-2.5 text-[14.5px] leading-[1.6] whitespace-pre-wrap text-foreground">
            {messageText(message)}
          </div>
        )}
      </article>
    )
  }

  const textParts = message.parts.filter(isTextPart)
  const lastText = textParts[textParts.length - 1]
  const sources = message.parts.filter(isSourcePart)
  return (
    <article data-slot="chat-message" data-role="assistant" aria-label={t.assistant} aria-busy={streaming || undefined} className={cn("flex gap-3", className)}>
      <div aria-hidden className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary-text">
        <SparklesIcon className="size-3.5" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {message.parts.map((part, i) => {
          if (isTextPart(part))
            return part.text ? (
              <Markdown key={i} streaming={streaming && part === lastText && part.state !== "done"}>
                {part.text}
              </Markdown>
            ) : null
          if (isReasoningPart(part))
            return <Reasoning key={i} text={part.text} streaming={streaming && part.state === "streaming"} />
          if (isToolPart(part)) {
            const tool = part as AiToolPart
            const name = tool.type === "dynamic-tool" ? (tool.toolName ?? "") : tool.type.slice(5)
            return (
              <ToolCall
                key={tool.toolCallId}
                part={tool}
                label={toolLabels?.[name]}
                renderOutput={renderToolOutput ? (output) => renderToolOutput(name, output) : undefined}
                onApprovalResponse={onToolApprovalResponse}
              />
            )
          }
          if (isFilePart(part)) return <Attachment key={i} part={part} />
          return null
        })}
        {sources.length > 0 && <Sources sources={sources} />}
        {!streaming && (
          <div className="-ml-1.5 flex items-center gap-0.5">
            <IconAction
              label={t.copy}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(messageText(message))
                  setCopied(true)
                } catch {
                  /* clipboard unavailable */
                }
              }}
            >
              {copied ? <CheckIcon className="text-success" /> : <CopyIcon />}
            </IconAction>
            {isLast && onRegenerate && (
              <IconAction label={t.regenerate} onClick={onRegenerate}>
                <RefreshCwIcon />
              </IconAction>
            )}
            {onFeedback && (
              <>
                <IconAction label={t.good} pressed={feedback === "good"} onClick={() => onFeedback(message.id, feedback === "good" ? undefined : "good")}>
                  <ThumbsUpIcon />
                </IconAction>
                <IconAction label={t.bad} pressed={feedback === "bad"} onClick={() => onFeedback(message.id, feedback === "bad" ? undefined : "bad")}>
                  <ThumbsDownIcon />
                </IconAction>
              </>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

/**
 * Keeps a scroll box pinned to the bottom while content grows, unless the reader scrolled up.
 * Returns the box's ref, whether it's pinned, and a function to jump back down.
 */
function useStickToBottom<T extends HTMLElement>() {
  const ref = React.useRef<T>(null)
  const [pinned, setPinned] = React.useState(true)
  const pinnedRef = React.useRef(true)
  React.useEffect(() => {
    const box = ref.current
    if (!box) return
    const onScroll = () => {
      const atBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 48
      pinnedRef.current = atBottom
      setPinned(atBottom)
    }
    const follow = () => {
      if (pinnedRef.current) box.scrollTop = box.scrollHeight
    }
    box.addEventListener("scroll", onScroll, { passive: true })
    const observer = new ResizeObserver(follow)
    for (const child of Array.from(box.children)) observer.observe(child)
    follow()
    return () => {
      box.removeEventListener("scroll", onScroll)
      observer.disconnect()
    }
  }, [])
  const scrollToBottom = React.useCallback(() => {
    const box = ref.current
    if (!box) return
    pinnedRef.current = true
    setPinned(true)
    box.scrollTo({ top: box.scrollHeight, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })
  }, [])
  return { ref, pinned, scrollToBottom }
}

function TypingIndicator() {
  const t = useCoreloomI18n().messages.ai.chat
  return (
    <div data-slot="chat-typing" className="flex gap-3">
      <div aria-hidden className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary-text">
        <SparklesIcon className="size-3.5" />
      </div>
      <div className="flex h-7 items-center gap-1" role="status" aria-label={t.waiting}>
        {[0, 150, 300].map((d) => (
          <span key={d} className="size-1.5 animate-bounce rounded-full bg-muted-foreground motion-reduce:animate-none" style={{ animationDelay: `${d}ms` }} />
        ))}
      </div>
    </div>
  )
}

/** The scrolling log of messages, kept at the latest one while it streams. */
function ChatMessages({
  messages,
  status = "ready",
  error,
  onRetry,
  onRegenerate,
  feedback,
  onFeedback,
  className,
  ...tools
}: {
  messages: ReadonlyArray<AiMessage>
  status?: AiChatStatus
  /** useChat's error; shown with Try again. */
  error?: Error | string | null
  onRetry?: () => void
  onRegenerate?: () => void
  /** Feedback given so far, by message id. */
  feedback?: Record<string, Feedback | undefined>
  onFeedback?: (messageId: string, feedback: Feedback | undefined) => void
  className?: string
} & ToolOptions) {
  const t = useCoreloomI18n().messages.ai.chat
  const { ref, pinned, scrollToBottom } = useStickToBottom<HTMLDivElement>()
  const last = messages[messages.length - 1]
  const streaming = status === "streaming"
  const visible = messages.filter((m) => m.role !== "system")

  return (
    <div className={cn("relative flex min-h-0 flex-1 flex-col", className)}>
      <div
        ref={ref}
        data-slot="chat-messages"
        role="log"
        aria-label={t.log}
        aria-live="polite"
        aria-relevant="additions"
        tabIndex={0}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-inset"
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
          {visible.map((m) => (
            <ChatMessage
              key={m.id}
              message={m}
              streaming={streaming && m === last && m.role === "assistant"}
              isLast={m === last}
              feedback={feedback?.[m.id]}
              onFeedback={onFeedback}
              onRegenerate={onRegenerate}
              {...tools}
            />
          ))}
          {status === "submitted" && <TypingIndicator />}
          {(status === "error" || error) && (
            <Alert variant="destructive">
              <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
                <span>{typeof error === "string" ? error : t.error}</span>
                {onRetry && (
                  <Button size="sm" variant="outline" onClick={onRetry}>
                    <RefreshCwIcon />
                    {t.retry}
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
      {!pinned && (
        <Button
          type="button"
          size="icon-sm"
          variant="secondary"
          aria-label={t.scrollToLatest}
          onClick={scrollToBottom}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full shadow-md"
        >
          <ArrowDownIcon />
        </Button>
      )}
    </div>
  )
}

/** The empty state: a greeting and a few suggested prompts. */
function ChatEmpty({
  title,
  description,
  suggestions = [],
  onSuggestion,
  className,
}: {
  title?: React.ReactNode
  description?: React.ReactNode
  suggestions?: string[]
  onSuggestion?: (text: string) => void
  className?: string
}) {
  const t = useCoreloomI18n().messages.ai.chat
  return (
    <div data-slot="chat-empty" className={cn("flex flex-1 flex-col items-center justify-center gap-6 px-4 py-10 text-center", className)}>
      <div className="flex size-11 items-center justify-center rounded-full bg-primary-subtle text-primary-text">
        <SparklesIcon className="size-5" aria-hidden />
      </div>
      <div className="flex flex-col gap-1.5">
        <h2 className="m-0 font-display text-[22px] font-semibold tracking-[-0.015em] text-foreground">{title ?? t.emptyTitle}</h2>
        <p className="m-0 text-[14px] text-muted-foreground">{description ?? t.emptyDescription}</p>
      </div>
      {suggestions.length > 0 && (
        <ul className="m-0 grid w-full max-w-2xl list-none grid-cols-1 gap-2 p-0 sm:grid-cols-2">
          {suggestions.map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => onSuggestion?.(s)}
                className="w-full cursor-pointer rounded-lg border border-border bg-card px-4 py-3 text-left text-[13.5px] text-foreground outline-none transition-colors duration-120 hover:border-border-strong hover:bg-accent/50 focus-visible:ring-[3px] focus-visible:ring-ring"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** The whole chat: messages (or suggestions when empty) above the prompt. */
function Chat({
  messages,
  status = "ready",
  error,
  onSend,
  onStop,
  onRegenerate,
  feedback,
  onFeedback,
  suggestions,
  emptyTitle,
  emptyDescription,
  toolbar,
  allowAttachments,
  accept,
  placeholder,
  header,
  autoFocus = true,
  className,
  ...tools
}: {
  messages: ReadonlyArray<AiMessage>
  status?: AiChatStatus
  error?: Error | string | null
  onSend: (message: { text: string; files: File[] }) => void
  onStop?: () => void
  /** Regenerate the last answer (and retry after an error). */
  onRegenerate?: () => void
  feedback?: Record<string, Feedback | undefined>
  onFeedback?: (messageId: string, feedback: Feedback | undefined) => void
  /** Prompts offered while the conversation is empty. */
  suggestions?: string[]
  emptyTitle?: React.ReactNode
  emptyDescription?: React.ReactNode
  /** Controls in the prompt's bottom bar (a model picker). */
  toolbar?: React.ReactNode
  allowAttachments?: boolean
  accept?: string
  placeholder?: string
  /** A bar above the messages (the conversation's title, a menu). */
  header?: React.ReactNode
  /** Put the cursor in the prompt on mount (default true: a chat page is for writing). */
  autoFocus?: boolean
  className?: string
} & ToolOptions) {
  const empty = messages.filter((m) => m.role !== "system").length === 0
  return (
    <section data-slot="chat" className={cn("flex h-full min-h-0 flex-col", className)}>
      {header}
      {empty ? (
        <ChatEmpty
          title={emptyTitle}
          description={emptyDescription}
          suggestions={suggestions}
          onSuggestion={(text) => onSend({ text, files: [] })}
        />
      ) : (
        <ChatMessages
          messages={messages}
          status={status}
          error={error}
          onRetry={onRegenerate}
          onRegenerate={onRegenerate}
          feedback={feedback}
          onFeedback={onFeedback}
          {...tools}
        />
      )}
      <div className="mx-auto w-full max-w-3xl px-4 pb-4">
        <PromptInput
          status={status}
          onSubmit={onSend}
          onStop={onStop}
          toolbar={toolbar}
          allowAttachments={allowAttachments}
          accept={accept}
          placeholder={placeholder}
          autoFocus={autoFocus}
        />
      </div>
    </section>
  )
}

type Conversation = { id: string; title: string; updatedAt: Date | string }

function groupConversations(conversations: Conversation[], now: Date) {
  const day = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const today = day(now)
  const groups = { today: [] as Conversation[], yesterday: [] as Conversation[], week: [] as Conversation[], older: [] as Conversation[] }
  for (const c of [...conversations].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))) {
    const diff = Math.round((today - day(new Date(c.updatedAt))) / 86_400_000)
    groups[diff <= 0 ? "today" : diff === 1 ? "yesterday" : diff < 7 ? "week" : "older"].push(c)
  }
  return groups
}

/** The history of conversations: search, grouped by day, rename and delete from each row's menu. */
function ConversationList({
  conversations,
  activeId,
  onSelect,
  href,
  onNew,
  onRename,
  onDelete,
  now,
  className,
}: {
  conversations: Conversation[]
  activeId?: string
  /** Called when a row is chosen (or give `href` to make rows links). */
  onSelect?: (id: string) => void
  href?: (id: string) => string
  onNew?: () => void
  onRename?: (id: string, title: string) => void
  onDelete?: (id: string) => void
  /** "Today" is relative to this date (default: now). */
  now?: Date
  className?: string
}) {
  const all = useCoreloomI18n().messages
  const t = all.ai.conversations
  const [query, setQuery] = React.useState("")
  const [renaming, setRenaming] = React.useState<string>()
  const [deleting, setDeleting] = React.useState<Conversation>()
  const filtered = conversations.filter((c) => c.title.toLowerCase().includes(query.trim().toLowerCase()))
  const groups = groupConversations(filtered, now ?? new Date())

  const row = (c: Conversation) => {
    const active = c.id === activeId
    const rowClass = cn(
      "flex min-w-0 flex-1 items-center rounded-md px-2.5 py-1.5 text-left text-[13.5px] outline-none focus-visible:ring-[3px] focus-visible:ring-ring",
      active ? "bg-primary-subtle font-medium text-foreground" : "text-fg-secondary hover:bg-accent hover:text-foreground"
    )
    return (
      <li key={c.id} className="group/row relative flex items-center">
        {renaming === c.id ? (
          <Input
            autoFocus
            defaultValue={c.title}
            aria-label={t.renameLabel}
            className="h-8 text-[13.5px]"
            onBlur={() => setRenaming(undefined)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setRenaming(undefined)
              if (e.key === "Enter") {
                const title = e.currentTarget.value.trim()
                if (title) onRename?.(c.id, title)
                setRenaming(undefined)
              }
            }}
          />
        ) : (
          <>
            {href ? (
              <AppLink href={href(c.id)} aria-current={active ? "page" : undefined} className={rowClass}>
                <span className="truncate pr-6">{c.title}</span>
              </AppLink>
            ) : (
              <button type="button" aria-current={active ? "true" : undefined} onClick={() => onSelect?.(c.id)} className={cn(rowClass, "cursor-pointer")}>
                <span className="truncate pr-6">{c.title}</span>
              </button>
            )}
            {(onRename || onDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t.actions(c.title)}
                    className="absolute right-1 size-6 opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
                  >
                    <MoreHorizontalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onRename && (
                    <DropdownMenuItem onSelect={() => setTimeout(() => setRenaming(c.id))}>
                      <PencilIcon />
                      {t.rename}
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem variant="destructive" onSelect={() => setDeleting(c)}>
                      <Trash2Icon />
                      {t.delete}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </>
        )}
      </li>
    )
  }

  const sections = (["today", "yesterday", "week", "older"] as const).filter((g) => groups[g].length)
  return (
    <nav data-slot="conversation-list" aria-label={t.title} className={cn("flex min-h-0 flex-col gap-3", className)}>
      {onNew && (
        <Button variant="outline" className="w-full justify-start" onClick={onNew}>
          <PlusIcon />
          {t.new}
        </Button>
      )}
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.search} aria-label={t.search} className="h-8 pl-8 text-[13px]" />
      </div>
      <div className="-mx-1 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-1">
        {sections.length === 0 && <p className="m-0 px-2.5 text-[13px] text-muted-foreground">{conversations.length ? t.noResults : t.empty}</p>}
        {sections.map((g) => (
          <section key={g} className="flex flex-col gap-1">
            <h3 className="m-0 px-2.5 font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">{t[g]}</h3>
            <ul className="m-0 flex list-none flex-col gap-0.5 p-0">{groups[g].map(row)}</ul>
          </section>
        ))}
      </div>
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              <strong className="text-foreground">{deleting?.title}</strong> — {t.deleteText}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{all.common.cancel}</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => deleting && onDelete?.(deleting.id)}>
              {t.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </nav>
  )
}

export { Chat, ChatEmpty, ChatMessage, ChatMessages, ConversationList, type Conversation, type Feedback }
