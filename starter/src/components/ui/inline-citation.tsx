"use client"

// Coreloom UI — InlineCitation. The little numbered pill a model leaves in its answer ("…since v0.8 [1]"),
// pointing at one of the message's sources. Hover it, focus it or tap it and a card shows the source: its
// title, where it comes from (the site, or the file) and, for a web page, a link to open it. Takes an AI SDK
// source part (`source-url` or `source-document`) as it is; Markdown places them for you when given `sources`.
import * as React from "react"
import { ExternalLinkIcon, FileTextIcon, GlobeIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import type { AiSourceDocumentPart, AiSourceUrlPart } from "@/lib/ai"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useCoreloomI18n } from "@/lib/i18n"

/** A source a citation points at: the AI SDK's `source-url` and `source-document` parts. */
type CitationSource = AiSourceUrlPart | AiSourceDocumentPart

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

/** The source's address if it's safe to link to (http, https or mailto); undefined for anything else (javascript:, data:…). */
function safeSourceUrl(url: string | undefined) {
  if (!url) return undefined
  try {
    return ["http:", "https:", "mailto:"].includes(new URL(url.trim()).protocol) ? url.trim() : undefined
  } catch {
    return undefined
  }
}

/** The source's name: its title, else the site (web page) or the file name. */
function sourceTitle(source: CitationSource) {
  return source.type === "source-url" ? (source.title ?? hostOf(source.url)) : source.title || source.filename || source.sourceId
}

/** Where the source comes from: the site for a web page, the file name (or type) for a document. */
function sourceOrigin(source: CitationSource) {
  return source.type === "source-url" ? hostOf(source.url) : (source.filename ?? source.mediaType)
}

/**
 * Splits text on citation markers: "Fixed in v0.8 [1][2]." → ["Fixed in v0.8 ", 1, 2, "."]. Only numbers
 * from 1 to `count` become citations; "[0]", "[7]" with 3 sources, and a half-written "[1" stay text. A
 * marker right after a letter, digit or backslash isn't one: `items[1]`, `x[2]`, `\[1]`. `before` is the
 * character in front of `text`, when the text is a piece of something longer.
 */
function splitCitations(text: string, count: number, before = ""): (string | number)[] {
  const out: (string | number)[] = []
  let last = 0
  for (const match of text.matchAll(/\[(\d{1,3})\]/g)) {
    const n = Number(match[1])
    const previous = match.index > 0 ? text[match.index - 1] : before
    if (n < 1 || n > count || /[\w\\]/.test(previous)) continue
    if (match.index > last) out.push(text.slice(last, match.index))
    out.push(n)
    last = match.index + match[0].length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

const OPEN_DELAY = 250
const CLOSE_DELAY = 200

function InlineCitation({
  index,
  source,
  className,
}: {
  /** The number shown, from 1: the source's place in the message. */
  index: number
  /** The AI SDK source part it points at. */
  source: CitationSource
  className?: string
}) {
  const t = useCoreloomI18n().messages.ai.chat
  const [open, setOpenState] = React.useState(false)
  // The handlers read the latest value, not the one from their render: timers and keys can outrun React.
  const openRef = React.useRef(false)
  const setOpen = (next: boolean) => {
    openRef.current = next
    setOpenState(next)
  }
  // "peek": opened by hovering or tabbing onto it, focus stays put. "pinned": clicked or tapped, stays until dismissed.
  const mode = React.useRef<"peek" | "pinned">("peek")
  const byKeyboard = React.useRef(false)
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  const contentRef = React.useRef<HTMLDivElement>(null)
  // Focus goes back to the citation only when it was in the card (Escape); a peek closing never moves it.
  const returnFocus = React.useRef(false)
  React.useEffect(() => () => clearTimeout(timer.current), [])

  const close = () => {
    clearTimeout(timer.current)
    returnFocus.current = !!contentRef.current?.contains(document.activeElement)
    mode.current = "peek"
    setOpen(false)
  }

  const peek = (delay: number) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      if (openRef.current) return
      mode.current = "peek"
      setOpen(true)
    }, delay)
  }
  const leave = () => {
    clearTimeout(timer.current)
    if (mode.current === "pinned") return
    timer.current = setTimeout(close, CLOSE_DELAY)
  }
  const stay = () => clearTimeout(timer.current)

  const title = sourceTitle(source)
  const origin = sourceOrigin(source)
  const href = source.type === "source-url" ? safeSourceUrl(source.url) : undefined
  const label = t.citation(index, title)

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (!next) return close()
        clearTimeout(timer.current)
        setOpen(true)
      }}
    >
      <PopoverTrigger
        data-slot="inline-citation"
        aria-label={label}
        onPointerEnter={(e) => e.pointerType !== "touch" && peek(OPEN_DELAY)}
        onPointerLeave={(e) => e.pointerType !== "touch" && leave()}
        // Tabbing onto it peeks; a mouse click focuses it too, but the click decides then.
        onFocus={(e) => {
          // …except when focus comes back from the card on Escape: that closes it, it doesn't peek again.
          if (returnFocus.current) returnFocus.current = false
          else if (e.currentTarget.matches(":focus-visible")) peek(0)
        }}
        onBlur={(e) => {
          if (contentRef.current?.contains(e.relatedTarget as Node | null)) return
          if (mode.current === "peek") leave()
        }}
        onClick={(e) => {
          // Clicking, tapping or pressing Enter pins the card; on a peeking card it keeps it open.
          e.preventDefault()
          clearTimeout(timer.current)
          byKeyboard.current = e.detail === 0
          if (openRef.current && mode.current === "pinned") return close()
          mode.current = "pinned"
          if (openRef.current) {
            if (byKeyboard.current) (contentRef.current?.querySelector<HTMLElement>("a[href]") ?? contentRef.current)?.focus()
          } else setOpen(true)
        }}
        className={cn(
          "mx-[0.15em] inline-flex h-[1.45em] min-w-[1.45em] cursor-pointer items-center justify-center rounded-full border border-border bg-card px-[0.35em] align-[0.3em] font-mono text-[11px] leading-none font-semibold text-fg-secondary outline-none",
          "transition-colors duration-120 hover:border-border-strong hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring data-[state=open]:border-primary data-[state=open]:bg-primary-subtle data-[state=open]:text-primary-text",
          className
        )}
      >
        {index}
      </PopoverTrigger>
      <PopoverContent
        ref={contentRef}
        side="top"
        aria-label={label}
        data-slot="inline-citation-card"
        className="flex w-72 max-w-[calc(100vw-32px)] flex-col gap-2 p-3.5"
        onPointerEnter={(e) => e.pointerType !== "touch" && stay()}
        onPointerLeave={(e) => e.pointerType !== "touch" && leave()}
        onBlur={(e) => {
          const to = e.relatedTarget as Node | null
          if (mode.current === "peek" && !contentRef.current?.contains(to) && !e.currentTarget.contains(to)) leave()
        }}
        // A peek leaves focus where it is; Enter on the citation moves it into the card (to the link).
        onOpenAutoFocus={(e) => {
          if (!(mode.current === "pinned" && byKeyboard.current)) e.preventDefault()
        }}
        onCloseAutoFocus={(e) => {
          if (!returnFocus.current) e.preventDefault()
        }}
      >
        <p className="m-0 font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">{t.sourceNumber(index)}</p>
        <p className="m-0 text-[13.5px] leading-[1.45] font-medium break-words text-foreground">{title}</p>
        {origin && (
          <p className="m-0 flex min-w-0 items-center gap-1.5 text-[12.5px] text-muted-foreground">
            {source.type === "source-url" ? <GlobeIcon className="size-3.5 shrink-0" aria-hidden /> : <FileTextIcon className="size-3.5 shrink-0" aria-hidden />}
            <span className="truncate">{origin}</span>
          </p>
        )}
        {href && (
          <a
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 self-start rounded-sm text-[13px] text-primary-text underline underline-offset-4 outline-none hover:no-underline focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            {t.openSource}
            <ExternalLinkIcon className="size-3.5" aria-hidden />
          </a>
        )}
      </PopoverContent>
    </Popover>
  )
}

export { InlineCitation, safeSourceUrl, splitCitations, sourceTitle, type CitationSource }
