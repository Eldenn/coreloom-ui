"use client"

// Coreloom UI — AI knowledge (block). KnowledgeBase: the documents agents search — totals, upload,
// each file's indexing status (queued, processing with progress, indexed, failed), re-index and
// remove. RetrievalTest: ask a question and see the passages retrieval returns, with their scores,
// to check the knowledge before an agent relies on it.
import * as React from "react"
import { FileTextIcon, MoreHorizontalIcon, RefreshCwIcon, SearchIcon, Trash2Icon, UploadIcon } from "lucide-react"

import { cn } from "@/lib/utils"
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
import { Badge, BadgeDot } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatBytes } from "@/components/ui/file-upload"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useCoreloomI18n } from "@/lib/i18n"

type KnowledgeStatus = "queued" | "processing" | "indexed" | "failed"

type KnowledgeDocument = {
  id: string
  name: string
  size: number
  status: KnowledgeStatus
  /** 0–100 while processing. */
  progress?: number
  chunks?: number
  updatedAt: Date | string
  error?: string
}

const STATUS_VARIANT = { queued: "secondary", processing: "default", indexed: "success", failed: "destructive" } as const

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">{label}</span>
      <span className="text-[20px] font-semibold text-foreground tabular-nums">{value}</span>
    </div>
  )
}

function KnowledgeBase({
  documents,
  onUpload,
  onReindex,
  onRemove,
  accept = ".pdf,.md,.txt,.docx,.html,.csv",
  className,
}: {
  documents: KnowledgeDocument[]
  /** Files picked with "Add documents". */
  onUpload?: (files: File[]) => void
  onReindex?: (id: string) => void
  onRemove?: (id: string) => void
  accept?: string
  className?: string
}) {
  const { messages, locale, formatNumber } = useCoreloomI18n()
  const t = messages.ai.knowledge
  const input = React.useRef<HTMLInputElement>(null)
  const [removing, setRemoving] = React.useState<KnowledgeDocument>()
  const chunks = documents.reduce((n, d) => n + (d.chunks ?? 0), 0)
  const indexed = documents.filter((d) => d.status === "indexed").map((d) => +new Date(d.updatedAt))
  const last = indexed.length ? new Date(Math.max(...indexed)) : undefined

  return (
    <div data-slot="knowledge-base" className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-wrap items-end justify-between gap-4 rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap gap-8">
          <Stat label={t.documents} value={formatNumber(documents.length)} />
          <Stat label={t.chunks} value={formatNumber(chunks)} />
          <Stat label={t.lastIndexed} value={last ? last.toLocaleDateString(locale, { month: "short", day: "numeric" }) : "—"} />
        </div>
        {onUpload && (
          <>
            <input
              ref={input}
              type="file"
              multiple
              hidden
              accept={accept}
              onChange={(e) => {
                const files = Array.from(e.target.files ?? [])
                if (files.length) onUpload(files)
                e.target.value = ""
              }}
            />
            <Button onClick={() => input.current?.click()}>
              <UploadIcon />
              {t.add}
            </Button>
          </>
        )}
      </div>

      {documents.length === 0 ? (
        <p className="m-0 rounded-lg border border-dashed border-border px-4 py-10 text-center text-[13.5px] text-muted-foreground">{t.empty}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.name}</TableHead>
              <TableHead>{messages.ai.runs.state}</TableHead>
              <TableHead className="text-right">{t.chunks}</TableHead>
              <TableHead className="text-right">{t.size}</TableHead>
              <TableHead>{t.updated}</TableHead>
              <TableHead className="w-10">
                <span className="sr-only">{messages.common.menu}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((d) => (
              <TableRow key={d.id}>
                <TableCell>
                  <span className="flex min-w-0 items-center gap-2">
                    <FileTextIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                    <span className="truncate font-medium text-foreground">{d.name}</span>
                  </span>
                </TableCell>
                <TableCell>
                  <span className="flex flex-col gap-1">
                    <Badge variant={STATUS_VARIANT[d.status]} className="w-fit">
                      {d.status === "processing" ? <Spinner className="size-3 text-current" aria-hidden role="presentation" /> : <BadgeDot />}
                      {t.status[d.status]}
                      {d.status === "processing" && d.progress !== undefined && ` · ${d.progress} %`}
                    </Badge>
                    {d.status === "failed" && d.error && <span className="max-w-64 text-[12px] whitespace-normal text-destructive">{d.error}</span>}
                  </span>
                </TableCell>
                <TableCell className="text-right font-mono text-[12px]">{d.chunks !== undefined ? formatNumber(d.chunks) : "—"}</TableCell>
                <TableCell className="text-right font-mono text-[12px]">{formatBytes(d.size, locale)}</TableCell>
                <TableCell className="font-mono text-[12px]">{new Date(d.updatedAt).toLocaleDateString(locale, { month: "short", day: "numeric" })}</TableCell>
                <TableCell>
                  {(onReindex || onRemove) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" aria-label={t.actions(d.name)}>
                          <MoreHorizontalIcon />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onReindex && (
                          <DropdownMenuItem onSelect={() => onReindex(d.id)} disabled={d.status === "processing" || d.status === "queued"}>
                            <RefreshCwIcon />
                            {t.reindex}
                          </DropdownMenuItem>
                        )}
                        {onRemove && (
                          <DropdownMenuItem variant="destructive" onSelect={() => setRemoving(d)}>
                            <Trash2Icon />
                            {t.remove}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <AlertDialog open={!!removing} onOpenChange={(o) => !o && setRemoving(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{removing ? t.removeTitle(removing.name) : ""}</AlertDialogTitle>
            <AlertDialogDescription>{t.removeText}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{messages.common.cancel}</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => removing && onRemove?.(removing.id)}>
              {t.remove}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

type RetrievalResult = { id: string; text: string; source: string; score: number }

/** Ask a question, see the passages retrieval would hand an agent. */
function RetrievalTest({ onSearch, className }: { onSearch: (query: string) => Promise<RetrievalResult[]>; className?: string }) {
  const { messages, locale } = useCoreloomI18n()
  const t = messages.ai.knowledge
  const [query, setQuery] = React.useState("")
  const [state, setState] = React.useState<{ status: "idle" | "loading" | "done"; results: RetrievalResult[] }>({ status: "idle", results: [] })
  const pct = new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 0 })
  const uid = React.useId()
  return (
    <section data-slot="retrieval-test" aria-labelledby={`${uid}-title`} className={cn("flex flex-col gap-4 rounded-lg border border-border bg-card p-4", className)}>
      <div className="flex flex-col gap-1">
        <h3 id={`${uid}-title`} className="m-0 text-[14.5px] font-semibold text-foreground">
          {t.test}
        </h3>
        <p className="m-0 text-[13px] text-muted-foreground">{t.testHint}</p>
      </div>
      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={async (e) => {
          e.preventDefault()
          if (!query.trim()) return
          setState({ status: "loading", results: [] })
          const results = await onSearch(query.trim())
          setState({ status: "done", results })
        }}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <Label htmlFor={`${uid}-query`}>{t.query}</Label>
          <Input id={`${uid}-query`} value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Button type="submit" variant="secondary" disabled={state.status === "loading"}>
          {state.status === "loading" ? <Spinner aria-hidden role="presentation" /> : <SearchIcon />}
          {t.search}
        </Button>
      </form>
      <div aria-live="polite" aria-busy={state.status === "loading" || undefined}>
        {state.status === "done" &&
          (state.results.length === 0 ? (
            <p className="m-0 text-[13px] text-muted-foreground">{t.noResults}</p>
          ) : (
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[11.5px] text-muted-foreground">{t.results(state.results.length)}</span>
              <ol className="m-0 flex list-none flex-col gap-2 p-0">
                {state.results.map((r) => (
                  <li key={r.id} className="flex flex-col gap-2 rounded-md border border-border-subtle bg-inset p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex min-w-0 items-center gap-1.5 text-[12.5px] text-fg-secondary">
                        <FileTextIcon className="size-3.5 shrink-0" aria-hidden />
                        <span className="truncate">{r.source}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span className="sr-only">{t.score}</span>
                        <span aria-hidden className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
                          <span className="block h-full rounded-full bg-primary" style={{ width: `${Math.round(r.score * 100)}%` }} />
                        </span>
                        <span className="font-mono text-[11.5px] text-foreground tabular-nums">{pct.format(r.score)}</span>
                      </span>
                    </div>
                    <p className="m-0 text-[13px] leading-[1.6] text-foreground">{r.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          ))}
      </div>
    </section>
  )
}

export { KnowledgeBase, RetrievalTest, type KnowledgeDocument, type KnowledgeStatus, type RetrievalResult }
