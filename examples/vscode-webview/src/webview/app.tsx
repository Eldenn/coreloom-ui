// The webview's React app: a small file finder built from Coreloom UI components. It keeps its
// fields and last result in the webview state, and talks to the extension through typed messages.
import { CopyIcon, FileIcon, FolderSearchIcon, MoreHorizontalIcon, SearchIcon } from 'lucide-react'
import * as React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/sonner'
import { Spinner } from '@/components/ui/spinner'
import { postToExtension, useExtensionMessages, useVsCodeState } from '@/lib/vscode'

import { type ExtensionMessage, isExtensionMessage, type WebviewMessage } from '../messages'

interface Result {
  pattern: string
  files: string[]
  truncated: boolean
}

const send = (message: WebviewMessage) => postToExtension(message)

function App() {
  const id = React.useId()
  // Survive the panel being hidden: VS Code rebuilds the page when its tab comes back.
  const [pattern, setPattern] = useVsCodeState('pattern', '**/*.{ts,tsx}')
  const [skipNodeModules, setSkipNodeModules] = useVsCodeState('skipNodeModules', true)
  const [result, setResult] = useVsCodeState<Result | null>('result', null)
  const [activeFile, setActiveFile] = React.useState<string | null>(null)
  const [busy, setBusy] = React.useState(false)

  useExtensionMessages<ExtensionMessage>((message) => {
    switch (message.type) {
      case 'active-file':
        setActiveFile(message.path)
        break
      case 'found':
        setBusy(false)
        setResult(message)
        break
    }
  }, isExtensionMessage)

  // The extension answers with the editor's current file.
  React.useEffect(() => {
    send({ type: 'ready' })
  }, [])

  const find = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!pattern.trim()) return
    setBusy(true)
    send({ type: 'find', pattern: pattern.trim(), skipNodeModules })
  }

  const copy = async (path: string) => {
    await navigator.clipboard.writeText(path)
    toast.success('Path copied')
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-[15px] font-semibold text-foreground">Find files</h1>
        <p className="flex min-w-0 items-center gap-1.5 text-[12.5px] text-muted-foreground">
          <FileIcon className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">{activeFile ?? 'No file open'}</span>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search the workspace</CardTitle>
          <CardDescription>A glob pattern, relative to the workspace folder.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={find} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${id}-pattern`}>Pattern</Label>
              <div className="flex gap-2">
                <Input
                  id={`${id}-pattern`}
                  value={pattern}
                  onChange={(e) => {
                    setPattern(e.target.value)
                  }}
                  className="font-mono"
                  spellCheck={false}
                />
                <Button type="submit" disabled={busy || !pattern.trim()}>
                  {busy ? <Spinner /> : <SearchIcon />}
                  Find
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id={`${id}-skip`}
                checked={skipNodeModules}
                onCheckedChange={(checked) => {
                  setSkipNodeModules(checked === true)
                }}
              />
              <Label htmlFor={`${id}-skip`}>Skip node_modules</Label>
            </div>
          </form>
        </CardContent>
      </Card>

      <section aria-labelledby={`${id}-results`} className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h2 id={`${id}-results`} className="text-[13px] font-semibold text-foreground">
            Results
          </h2>
          {result && (
            <Badge variant={result.truncated ? 'warning' : 'default'}>
              {result.truncated ? `First ${result.files.length}` : result.files.length}
            </Badge>
          )}
        </div>
        <p aria-live="polite" className="sr-only">
          {result && !busy ? `${result.files.length} files match ${result.pattern}` : ''}
        </p>
        {result && result.files.length > 0 ? (
          <ul className="flex flex-col rounded-md border border-border">
            {result.files.map((path) => (
              <li
                key={path}
                className="flex items-center gap-1 border-b border-border-subtle px-1 last:border-b-0"
              >
                <Button
                  variant="ghost"
                  className="min-w-0 flex-1 justify-start font-mono text-[12.5px] font-normal"
                  onClick={() => {
                    send({ type: 'open-file', path })
                  }}
                >
                  <span className="truncate">{path}</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label={`Actions for ${path}`}>
                      <MoreHorizontalIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onSelect={() => {
                        send({ type: 'open-file', path })
                      }}
                    >
                      <FileIcon />
                      Open
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => void copy(path)}>
                      <CopyIcon />
                      Copy path
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            ))}
          </ul>
        ) : (
          <Empty className="border border-dashed border-border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FolderSearchIcon />
              </EmptyMedia>
              <EmptyTitle>{result ? 'No matching files' : 'No search yet'}</EmptyTitle>
              <EmptyDescription>
                {result ? `Nothing matches ${result.pattern}.` : 'Type a pattern and press Find.'}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </section>
    </main>
  )
}

export { App }
