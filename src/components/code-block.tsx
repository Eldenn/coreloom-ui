// Coreloom UI — CodeBlock (docs block). A copyable code well with an optional file name.
// No syntax highlighting built in: pass highlighted children (Shiki, Prism) to color it.
import * as React from "react"

import { cn } from "@/lib/utils"
import { CopyButton } from "@/components/copy-button"

function CodeBlock({
  code,
  title,
  children,
  className,
}: {
  /** The source text, used for copying (and shown when there are no children). */
  code: string
  /** File name or language shown in the header bar. */
  title?: string
  /** Pre-highlighted markup to display instead of the plain code. */
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div data-slot="code-block" className={cn("overflow-hidden rounded-lg border border-border bg-inset", className)}>
      {title && (
        <div className="flex h-10 items-center justify-between border-b border-border-subtle pr-2 pl-4">
          <span className="font-mono text-[12px] text-muted-foreground">{title}</span>
          <CopyButton value={code} />
        </div>
      )}
      <div className="relative">
        <pre className={cn("m-0 overflow-x-auto px-4 py-3.5 font-mono text-[13px] leading-[1.7] text-foreground", !title && "pr-12")}>
          <code>{children ?? code}</code>
        </pre>
        {!title && <CopyButton value={code} className="absolute top-2.5 right-2.5" />}
      </div>
    </div>
  )
}

export { CodeBlock }
