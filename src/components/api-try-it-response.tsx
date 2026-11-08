'use client'

// Coreloom UI — API try it, the response part. The status (with its kind in words, not only in
// colour), the time and size, then the body (a JSON tree when it parses, plain text otherwise,
// never HTML) and the headers.
import * as React from 'react'

import {
  type ApiResponse,
  bodySize,
  parseResponseBody,
  statusKind,
} from '@/components/api-try-it-request'
import { Badge } from '@/components/ui/badge'
import { formatValue } from '@/components/ui/format'
import { JsonViewer } from '@/components/ui/json-viewer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCoreloomI18n } from '@/lib/i18n'

const statusVariant = {
  info: 'secondary',
  success: 'success',
  redirect: 'secondary',
  clientError: 'warning',
  serverError: 'destructive',
} as const

function ResponseStatus({ response }: { response: ApiResponse }) {
  const { messages, locale } = useCoreloomI18n()
  const t = messages.apiTryIt
  const kind = statusKind(response.status)
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12.5px] text-fg-secondary">
      <Badge variant={statusVariant[kind]} className="font-mono">
        {[String(response.status), response.statusText].filter(Boolean).join(' ')}
      </Badge>
      <span>{t.status[kind]}</span>
      {response.durationMs === undefined ? null : (
        <span className="font-mono tabular-nums">
          {t.duration(formatValue(Math.round(response.durationMs), locale, { format: 'integer' }))}
        </span>
      )}
      <span className="font-mono tabular-nums">
        {formatValue(bodySize(response.body), locale, { format: 'bytes' })}
      </span>
    </div>
  )
}

function ResponseBodyView({ response }: { response: ApiResponse }) {
  const t = useCoreloomI18n().messages.apiTryIt
  const body = React.useMemo(() => parseResponseBody(response), [response])
  if (body.kind === 'json')
    return (
      <JsonViewer
        value={body.value}
        rootLabel={t.responseBody}
        defaultExpandDepth={3}
        maxHeight="320px"
      />
    )
  if (!body.text) return <p className="text-[13px] text-muted-foreground">{t.emptyBody}</p>
  return (
    <pre
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrollable region must be keyboard-reachable; axe requires it.
      tabIndex={0}
      aria-label={t.responseBody}
      className="max-h-80 overflow-auto rounded-md border border-border bg-inset p-3 font-mono text-[12.5px] break-all whitespace-pre-wrap text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
    >
      {body.text}
    </pre>
  )
}

function ResponseHeaders({ headers }: { headers: [string, string][] }) {
  const t = useCoreloomI18n().messages.apiTryIt
  if (headers.length === 0)
    return <p className="text-[13px] text-muted-foreground">{t.noHeaders}</p>
  return (
    <dl className="grid grid-cols-1 gap-x-4 gap-y-1.5 rounded-md border border-border bg-inset p-3 font-mono text-[12.5px] sm:grid-cols-[minmax(0,max-content)_minmax(0,1fr)]">
      {headers.map(([name, value], i) => (
        <React.Fragment key={`${name}-${String(i)}`}>
          <dt className="font-semibold break-all text-fg-secondary">{name}</dt>
          <dd className="break-all text-foreground">{value}</dd>
        </React.Fragment>
      ))}
    </dl>
  )
}

function ApiResponseView({ response }: { response: ApiResponse }) {
  const t = useCoreloomI18n().messages.apiTryIt
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <ResponseStatus response={response} />
      <Tabs defaultValue="body" className="min-w-0">
        <TabsList aria-label={t.response}>
          <TabsTrigger value="body">{t.responseBody}</TabsTrigger>
          <TabsTrigger value="headers">
            {t.responseHeaders}
            <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
              {response.headers.length}
            </span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="body" className="min-w-0">
          <ResponseBodyView response={response} />
        </TabsContent>
        <TabsContent value="headers" className="min-w-0">
          <ResponseHeaders headers={response.headers} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export { ApiResponseView }
