'use client'

// Coreloom UI — API try it (block). The panel an API reference page shows beside an endpoint:
// fill the path, query and header parameters, add headers and a JSON body, send, and read the
// status, time, body and headers that came back. "Copy as cURL" gives the same request for a
// terminal. The panel sends nothing itself: `onSend` gets the request and an abort signal, and the
// app makes the call (and owns CORS, auth and rate limits). Not a Postman: no collections, no
// environments, no history.
import * as React from 'react'

import {
  BodyField,
  formReducer,
  HeadersField,
  ParamFields,
  SendActions,
  TokenField,
} from '@/components/api-try-it-form'
import {
  allowsBody,
  type ApiEndpoint,
  type ApiParameter,
  type ApiParamValues,
  type ApiRequest,
  type ApiResponse,
  bodySize,
  buildRequest,
  buildRequestUrl,
  type HttpMethod,
  missingParams,
  parseResponseBody,
  pathParamNames,
  previewUrl,
  type ResponseBody,
  shellQuote,
  type StatusKind,
  statusKind,
  toCurl,
} from '@/components/api-try-it-request'
import { ApiResponseView } from '@/components/api-try-it-response'
import { CopyButton } from '@/components/copy-button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { parseJson } from '@/components/ui/json-input'
import { Spinner } from '@/components/ui/spinner'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface ApiTryItAuth {
  /** The header the token goes in. "Authorization" by default. */
  header?: string
  /** Written before the token: "Bearer " by default; "" sends the token as is (an API key header). */
  prefix?: string
  /** Fills the token field: a test key for the docs reader. */
  defaultToken?: string
  /** The field's label. "Bearer token" by default. */
  label?: string
}

type SendState =
  | { status: 'idle' }
  | { status: 'sending'; controller: AbortController }
  | { status: 'done'; response: ApiResponse }
  | { status: 'cancelled' }
  | { status: 'error'; message: string }

interface ApiTryItProps {
  endpoint: ApiEndpoint
  /** Put before the endpoint's path: "https://api.example.com/v1". */
  baseUrl: string
  /** Makes the call. Resolve with the response; reject when it couldn't be made. Honour `signal`. */
  onSend: (request: ApiRequest, options: { signal: AbortSignal }) => Promise<ApiResponse>
  /** Shows a token field and sends the token in a header. */
  auth?: ApiTryItAuth
  /** Values for the parameter fields, by parameter name. */
  defaultValues?: ApiParamValues
  /** A response shown before anything is sent, such as the documented example. */
  defaultResponse?: ApiResponse
  /** The panel's title. "Try it" by default. */
  title?: React.ReactNode
  className?: string
}

const methodVariant: Record<HttpMethod, 'default' | 'success' | 'warning' | 'destructive'> = {
  GET: 'default',
  POST: 'success',
  PUT: 'warning',
  PATCH: 'warning',
  DELETE: 'destructive',
}

/** Declared parameters plus the path ones the template names without declaring them. */
function allParams(endpoint: ApiEndpoint): ApiParameter[] {
  const declared = endpoint.parameters ?? []
  const extra = pathParamNames(endpoint.path)
    .filter((name) => !declared.some((p) => p.name === name))
    .map((name): ApiParameter => ({ name, in: 'path', required: true }))
  return [...extra, ...declared]
}

/** A JSON body editor holding text that doesn't parse. */
function isBodyInvalid(endpoint: ApiEndpoint, body: string) {
  if (!allowsBody(endpoint.method) || !body.trim()) return false
  const type = endpoint.body?.contentType
  if (type && !type.includes('json')) return false
  return !parseJson(body).ok
}

/** The form, the request built from it, and Send / Cancel with their focus moves. */
function useApiTryIt({
  endpoint,
  baseUrl,
  onSend,
  auth,
  defaultValues,
  defaultResponse,
}: ApiTryItProps) {
  const baseId = React.useId()
  const formRef = React.useRef<HTMLFormElement>(null)
  const sendRef = React.useRef<HTMLButtonElement>(null)
  const [form, dispatch] = React.useReducer(formReducer, {
    values: defaultValues ?? {},
    headers: [],
    body: endpoint.body?.example ?? '',
    token: auth?.defaultToken ?? '',
    checked: false,
  })
  const [state, setState] = React.useState<SendState>(
    defaultResponse ? { status: 'done', response: defaultResponse } : { status: 'idle' },
  )
  const params = allParams(endpoint)
  const bodyInvalid = isBodyInvalid(endpoint, form.body)
  const idFor = (name: string) => `${baseId}-param-${name}`
  const bodyId = `${baseId}-body`
  const header = auth?.header ?? 'Authorization'
  const built = buildRequest({
    baseUrl,
    endpoint,
    values: form.values,
    headers: form.headers,
    body: form.body,
    auth:
      auth && form.token
        ? { header, value: `${auth.prefix ?? 'Bearer '}${form.token}` }
        : undefined,
  })

  const focus = (id: string) => {
    formRef.current?.querySelector<HTMLElement>(`#${CSS.escape(id)}`)?.focus()
  }

  const send = async () => {
    if (state.status === 'sending') return
    dispatch({ type: 'check' })
    if (!built.ok) {
      const first = params.find((p) => built.missing.includes(p.name))
      if (first) focus(idFor(first.name))
      return
    }
    if (bodyInvalid) {
      // JsonInput checks its text when it loses focus: leave and come back so it says where the
      // JSON breaks, even when Ctrl/⌘+Enter was pressed inside it.
      const editor = formRef.current?.querySelector<HTMLElement>(`#${CSS.escape(bodyId)}`)
      editor?.blur()
      editor?.focus()
      return
    }
    const controller = new AbortController()
    setState({ status: 'sending', controller })
    try {
      const response = await onSend(built.request, { signal: controller.signal })
      if (!controller.signal.aborted) setState({ status: 'done', response })
    } catch (error) {
      if (controller.signal.aborted) return
      setState({ status: 'error', message: error instanceof Error ? error.message : String(error) })
    }
  }

  const cancel = () => {
    if (state.status !== 'sending') return
    state.controller.abort()
    setState({ status: 'cancelled' })
    // The Cancel button goes away: keep the keyboard on Send.
    sendRef.current?.focus()
  }

  return {
    baseId,
    formRef,
    sendRef,
    form,
    dispatch,
    state,
    params,
    missing: new Set(missingParams(endpoint, form.values)),
    bodyInvalid,
    bodyId,
    idFor,
    header,
    built,
    send,
    cancel,
  }
}

function ResponseArea({ state }: { state: SendState }) {
  const t = useCoreloomI18n().messages.apiTryIt
  switch (state.status) {
    case 'idle':
      return <p className="text-[13px] text-muted-foreground">{t.empty}</p>
    case 'sending':
      return (
        <p className="flex items-center gap-2 text-[13px] text-fg-secondary">
          <Spinner />
          {t.sending}
        </p>
      )
    case 'cancelled':
      return <p className="text-[13px] text-muted-foreground">{t.cancelled}</p>
    case 'error':
      return (
        <Alert variant="destructive">
          <AlertDescription className="break-words">{t.failedWith(state.message)}</AlertDescription>
        </Alert>
      )
    case 'done':
      return <ApiResponseView response={state.response} />
  }
}

/** What the one polite live region says. A failure is said by its alert instead. */
function announcement(
  state: SendState,
  t: ReturnType<typeof useCoreloomI18n>['messages']['apiTryIt'],
) {
  switch (state.status) {
    case 'done':
      return t.received(
        [String(state.response.status), state.response.statusText].filter(Boolean).join(' '),
      )
    case 'cancelled':
      return t.cancelled
    case 'sending':
      return t.sending
    default:
      return ''
  }
}

function UrlBar({ method, url }: { method: HttpMethod; url: string }) {
  const t = useCoreloomI18n().messages.apiTryIt
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-md border border-border bg-inset py-1 pr-1 pl-2">
      <Badge variant={methodVariant[method]} className="shrink-0 font-mono">
        {method}
      </Badge>
      <code
        aria-label={t.url}
        className="min-w-0 flex-1 font-mono text-[12.5px] break-all text-foreground"
      >
        {url}
      </code>
      <CopyButton value={url} label={t.copyUrl} />
    </div>
  )
}

function ApiTryIt(props: ApiTryItProps) {
  const { endpoint, baseUrl, auth, title, className } = props
  const t = useCoreloomI18n().messages.apiTryIt
  const {
    baseId,
    formRef,
    sendRef,
    form,
    dispatch,
    state,
    params,
    missing,
    bodyInvalid,
    bodyId,
    idFor,
    header,
    built,
    send,
    cancel,
  } = useApiTryIt(props)
  const sending = state.status === 'sending'
  const groups = [
    { legend: t.pathParams, params: params.filter((p) => p.in === 'path') },
    { legend: t.queryParams, params: params.filter((p) => p.in === 'query') },
    { legend: t.headerParams, params: params.filter((p) => p.in === 'header') },
  ]
  const setValue = (name: string, value: string) => {
    dispatch({ type: 'value', name, value })
  }

  return (
    <Card data-slot="api-try-it" className={cn('min-w-0 gap-5', className)}>
      <CardHeader>
        <CardTitle>{title ?? t.title}</CardTitle>
        <CardDescription>{endpoint.summary ?? t.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex min-w-0 flex-col gap-5">
        <UrlBar method={endpoint.method} url={previewUrl(baseUrl, endpoint, form.values)} />
        {/* Above the fields, as in most API clients: errors that appear under a field as it loses
            focus can't push the button away from the pointer between press and release. */}
        <SendActions
          formId={`${baseId}-form`}
          sending={sending}
          request={built.ok ? built.request : undefined}
          sendRef={sendRef}
          onCancel={cancel}
        />
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- Ctrl/⌘+Enter acts on the fields inside, the body editor included. */}
        <form
          id={`${baseId}-form`}
          ref={formRef}
          noValidate
          aria-label={t.request}
          className="flex min-w-0 flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault()
            void send()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              void send()
            }
          }}
        >
          {auth ? (
            <TokenField
              id={`${baseId}-token`}
              label={auth.label}
              header={header}
              value={form.token}
              onChange={(token) => {
                dispatch({ type: 'token', token })
              }}
            />
          ) : null}
          {groups.map((g) => (
            <ParamFields
              key={g.legend}
              legend={g.legend}
              params={g.params}
              form={form}
              missing={missing}
              idFor={idFor}
              onChange={setValue}
            />
          ))}
          <HeadersField
            id={`${baseId}-headers`}
            value={form.headers}
            onChange={(headers) => {
              dispatch({ type: 'headers', headers })
            }}
          />
          {allowsBody(endpoint.method) ? (
            <BodyField
              id={bodyId}
              value={form.body}
              invalid={form.checked && bodyInvalid}
              onChange={(body) => {
                dispatch({ type: 'body', body })
              }}
            />
          ) : null}
        </form>
        <section
          aria-label={t.response}
          aria-busy={sending || undefined}
          className="flex min-w-0 flex-col gap-3 border-t border-border-subtle pt-4"
        >
          <p className="font-mono text-[11px] font-semibold tracking-[0.08em] text-fg-secondary uppercase">
            {t.response}
          </p>
          <ResponseArea state={state} />
        </section>
        <p role="status" className="sr-only">
          {announcement(state, t)}
        </p>
      </CardContent>
    </Card>
  )
}

export {
  type ApiEndpoint,
  type ApiParameter,
  type ApiParamValues,
  type ApiRequest,
  type ApiResponse,
  ApiTryIt,
  type ApiTryItAuth,
  type ApiTryItProps,
  bodySize,
  buildRequest,
  buildRequestUrl,
  type HttpMethod,
  parseResponseBody,
  type ResponseBody,
  shellQuote,
  type StatusKind,
  statusKind,
  toCurl,
}
