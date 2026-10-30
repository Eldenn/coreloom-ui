"use client"

// Coreloom UI — Markdown. Renders model output (or any Markdown) in Coreloom type: headings,
// lists, tables, quotes, links, inline code and code blocks with a copy button. GitHub-flavoured
// (tables, task lists, strikethrough). Raw HTML in the text is dropped, never rendered, so output
// from a model can't inject markup. Safe to re-render on every streamed token.
import * as React from "react"
import ReactMarkdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import { CheckIcon, CopyIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { useCoreloomI18n } from "@/lib/i18n"

function CodeCopy({ code }: { code: string }) {
  const t = useCoreloomI18n().messages.ai.code
  const [copied, setCopied] = React.useState(false)
  React.useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 1400)
    return () => clearTimeout(timer)
  }, [copied])
  return (
    <button
      type="button"
      aria-label={t.copy}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code)
          setCopied(true)
        } catch {
          /* clipboard unavailable: nothing to confirm */
        }
      }}
      className="inline-flex size-7 cursor-pointer items-center justify-center rounded-sm text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring [&_svg]:size-3.5"
    >
      {copied ? <CheckIcon className="text-success" /> : <CopyIcon />}
    </button>
  )
}

function textOf(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(textOf).join("")
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) return textOf(node.props.children)
  return ""
}

function useComponents(): Components {
  const t = useCoreloomI18n().messages.ai.code
  return React.useMemo<Components>(
    () => ({
      h1: ({ node: _n, ...p }) => <h3 className="mt-5 mb-2 font-display text-[19px] font-semibold tracking-[-0.015em] text-foreground first:mt-0" {...p} />,
      h2: ({ node: _n, ...p }) => <h4 className="mt-5 mb-2 font-display text-[17px] font-semibold text-foreground first:mt-0" {...p} />,
      h3: ({ node: _n, ...p }) => <h5 className="mt-4 mb-1.5 text-[15px] font-semibold text-foreground first:mt-0" {...p} />,
      h4: ({ node: _n, ...p }) => <h6 className="mt-4 mb-1.5 text-[14px] font-semibold text-foreground first:mt-0" {...p} />,
      p: ({ node: _n, ...p }) => <p className="my-2.5 first:mt-0 last:mb-0" {...p} />,
      ul: ({ node: _n, className, ...p }) => (
        <ul className={cn("my-2.5 list-disc space-y-1 pl-5 marker:text-muted-foreground", className?.includes("contains-task-list") && "list-none pl-1")} {...p} />
      ),
      ol: ({ node: _n, ...p }) => <ol className="my-2.5 list-decimal space-y-1 pl-5 marker:text-muted-foreground" {...p} />,
      li: ({ node: _n, ...p }) => <li className="pl-1 [&>input]:mr-2 [&>input]:align-middle" {...p} />,
      // Task list boxes: read-only, named for screen readers.
      input: ({ node: _n, type, checked, ...p }) =>
        type === "checkbox" ? (
          <input type="checkbox" checked={checked} readOnly aria-label={checked ? t.done : t.todo} className="accent-primary" {...p} />
        ) : (
          <input type={type} {...p} />
        ),
      a: ({ node: _n, href, ...p }) => (
        <a href={href} target="_blank" rel="noreferrer noopener" className="text-primary-text underline underline-offset-4 hover:no-underline" {...p} />
      ),
      blockquote: ({ node: _n, ...p }) => <blockquote className="my-3 border-l-2 border-border-strong pl-4 text-muted-foreground" {...p} />,
      hr: () => <hr className="my-4 border-border-subtle" />,
      strong: ({ node: _n, ...p }) => <strong className="font-semibold text-foreground" {...p} />,
      table: ({ node: _n, ...p }) => (
        <div className="my-3 overflow-x-auto rounded-md border border-border-subtle">
          <table className="w-full text-[13px]" {...p} />
        </div>
      ),
      thead: ({ node: _n, ...p }) => <thead className="bg-secondary" {...p} />,
      th: ({ node: _n, ...p }) => <th className="border-b border-border-subtle px-3 py-2 text-left font-semibold text-foreground" {...p} />,
      td: ({ node: _n, ...p }) => <td className="border-b border-border-subtle px-3 py-2 align-top [tr:last-child_&]:border-0" {...p} />,
      // Fenced blocks arrive as <pre><code class="language-x">; inline code as <code> alone.
      pre: ({ node: _n, children }) => {
        const child = React.Children.only(children) as React.ReactElement<{ className?: string; children?: React.ReactNode }>
        const lang = /language-([\w-]+)/.exec(child.props.className ?? "")?.[1]
        const code = textOf(child.props.children).replace(/\n$/, "")
        return (
          <figure data-slot="markdown-code" className="my-3 overflow-hidden rounded-md border border-border bg-inset">
            <figcaption className="flex h-9 items-center justify-between border-b border-border-subtle pr-1 pl-3">
              <span className="font-mono text-[11.5px] text-muted-foreground">{lang ? t.language(lang) : " "}</span>
              <CodeCopy code={code} />
            </figcaption>
            <pre className="m-0 overflow-x-auto px-3.5 py-3 font-mono text-[12.5px] leading-[1.65] text-foreground">
              <code>{code}</code>
            </pre>
          </figure>
        )
      },
      code: ({ node: _n, className, ...p }) => (
        <code className={cn("rounded-[5px] bg-secondary px-1.5 py-0.5 font-mono text-[0.88em] text-foreground", className)} {...p} />
      ),
    }),
    [t]
  )
}

function Markdown({
  children,
  streaming = false,
  className,
}: {
  /** The Markdown text. */
  children: string
  /** Shows a blinking caret after the text while a model is still writing it. */
  streaming?: boolean
  className?: string
}) {
  const components = useComponents()
  return (
    <div
      data-slot="markdown"
      data-streaming={streaming || undefined}
      className={cn(
        "min-w-0 text-[14.5px] leading-[1.65] text-fg-secondary break-words",
        // The caret follows the last block's text while streaming.
        "data-[streaming]:[&>*:last-child]:after:ml-0.5 data-[streaming]:[&>*:last-child]:after:inline-block data-[streaming]:[&>*:last-child]:after:h-[1.05em] data-[streaming]:[&>*:last-child]:after:w-[7px] data-[streaming]:[&>*:last-child]:after:translate-y-[3px] data-[streaming]:[&>*:last-child]:after:animate-pulse data-[streaming]:[&>*:last-child]:after:rounded-[1px] data-[streaming]:[&>*:last-child]:after:bg-primary data-[streaming]:[&>*:last-child]:after:content-['']",
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components} skipHtml>
        {children}
      </ReactMarkdown>
    </div>
  )
}

export { Markdown }
