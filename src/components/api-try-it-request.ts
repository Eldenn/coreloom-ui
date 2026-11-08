// Coreloom UI — API try it: the request and response shapes, and the pure helpers behind the
// panel. They build the URL from an endpoint and the values someone typed, write the request as a
// cURL command, and read a response body. Nothing here sends anything: the app's `onSend` does.

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface ApiParameter {
  name: string
  /** Where the value goes: in the path (`/users/{id}`), the query string or a header. */
  in: 'path' | 'query' | 'header'
  required?: boolean
  description?: string
  /** Shown as the field's placeholder. */
  example?: string
}

interface ApiEndpoint {
  method: HttpMethod
  /** The path with its parameters in braces: `/projects/{projectId}/deployments`. */
  path: string
  summary?: string
  parameters?: ApiParameter[]
  /** The request body: its example fills the editor. JSON unless `contentType` says otherwise. */
  body?: { example: string; contentType?: string }
}

/** What the panel hands to `onSend`. */
interface ApiRequest {
  method: HttpMethod
  url: string
  headers: [string, string][]
  body?: string
}

/** What `onSend` resolves with. */
interface ApiResponse {
  status: number
  statusText?: string
  headers: [string, string][]
  body: string
  durationMs?: number
}

/** The values typed in the parameter fields, by parameter name. */
type ApiParamValues = Record<string, string>

type BuiltUrl = { ok: true; url: string } | { ok: false; missing: string[] }

const PATH_PARAM = /\{([^{}]+)\}/g

/** Parameters named in the path template, in order: `{id}` counts even when not declared. */
function pathParamNames(path: string): string[] {
  return [...path.matchAll(PATH_PARAM)].map((m) => m[1])
}

/** Required parameters left empty: every path parameter, and the others marked `required`. */
function missingParams(endpoint: ApiEndpoint, values: ApiParamValues): string[] {
  const required = new Set(pathParamNames(endpoint.path))
  for (const p of endpoint.parameters ?? []) if (p.required) required.add(p.name)
  return [...required].filter((name) => !(values[name] ?? '').trim())
}

/**
 * The full URL for `endpoint` with `values`: path parameters encoded into the path, query
 * parameters appended (empty ones left out). Missing required parameters come back as a list
 * instead of a URL.
 */
function buildRequestUrl(baseUrl: string, endpoint: ApiEndpoint, values: ApiParamValues): BuiltUrl {
  const missing = missingParams(endpoint, values)
  if (missing.length > 0) return { ok: false, missing }
  return { ok: true, url: assembleUrl(baseUrl, endpoint, values) }
}

/** Base, encoded path and query string, without checking what is required. */
function assembleUrl(baseUrl: string, endpoint: ApiEndpoint, values: ApiParamValues): string {
  const path = endpoint.path.replace(PATH_PARAM, (_, name: string) =>
    encodeURIComponent(values[name] ?? ''),
  )
  const query = new URLSearchParams()
  for (const p of endpoint.parameters ?? []) {
    const value = values[p.name] ?? ''
    if (p.in === 'query' && value !== '') query.append(p.name, value)
  }
  const base = baseUrl.replace(/\/+$/, '')
  const joined = `${base}${path.startsWith('/') ? '' : '/'}${path}`
  const search = query.toString()
  if (!search) return joined
  return `${joined}${joined.includes('?') ? '&' : '?'}${search}`
}

/** The URL as it stands, with `{name}` left in for path parameters not filled yet, for display. */
function previewUrl(baseUrl: string, endpoint: ApiEndpoint, values: ApiParamValues): string {
  const marker = '\u0000'
  const filled: ApiParamValues = {}
  for (const name of pathParamNames(endpoint.path))
    if (!(values[name] ?? '').trim()) filled[name] = `${marker}${name}${marker}`
  // Placeholders go through encoding like any value: swap the encoded markers for braces after.
  return assembleUrl(baseUrl, endpoint, { ...values, ...filled }).replace(
    /%00([^%]*)%00/g,
    (_, name: string) => `{${decodeURIComponent(name)}}`,
  )
}

const allowsBody = (method: HttpMethod) => method !== 'GET' && method !== 'DELETE'

/**
 * The request to send: URL, header parameters, extra headers (empty names dropped), the bearer
 * token and the body. `{ ok: false }` lists the required parameters still empty.
 */
function buildRequest(input: {
  baseUrl: string
  endpoint: ApiEndpoint
  values: ApiParamValues
  headers?: { key: string; value: string }[]
  body?: string
  auth?: { header: string; value: string }
}): { ok: true; request: ApiRequest } | { ok: false; missing: string[] } {
  const { endpoint } = input
  const built = buildRequestUrl(input.baseUrl, endpoint, input.values)
  if (!built.ok) return built
  const headers = requestHeaders(input)
  const body = allowsBody(endpoint.method) && input.body?.trim() ? input.body : undefined
  if (body === undefined)
    return { ok: true, request: { method: endpoint.method, url: built.url, headers } }
  if (!headers.some(([k]) => k.toLowerCase() === 'content-type'))
    headers.push(['Content-Type', endpoint.body?.contentType ?? 'application/json'])
  return { ok: true, request: { method: endpoint.method, url: built.url, headers, body } }
}

/** Header parameters with a value, extra headers with a name, then the token. */
function requestHeaders(input: {
  endpoint: ApiEndpoint
  values: ApiParamValues
  headers?: { key: string; value: string }[]
  auth?: { header: string; value: string }
}): [string, string][] {
  const headers: [string, string][] = []
  for (const p of input.endpoint.parameters ?? []) {
    const value = input.values[p.name] ?? ''
    if (p.in === 'header' && value !== '') headers.push([p.name, value])
  }
  for (const h of input.headers ?? []) if (h.key.trim()) headers.push([h.key.trim(), h.value])
  if (input.auth?.value) headers.push([input.auth.header, input.auth.value])
  return headers
}

/** A value quoted for a POSIX shell: single quotes, with each `'` written as `'\''`. */
function shellQuote(value: string): string {
  return `'${value.replaceAll("'", `'\\''`)}'`
}

/** The request as a cURL command, one option per line, safe to paste in a shell. */
function toCurl(request: ApiRequest): string {
  const parts = [
    `curl ${request.method === 'GET' ? '' : `-X ${request.method} `}${shellQuote(request.url)}`,
  ]
  for (const [name, value] of request.headers) parts.push(`-H ${shellQuote(`${name}: ${value}`)}`)
  if (request.body !== undefined) parts.push(`--data-raw ${shellQuote(request.body)}`)
  return parts.join(' \\\n  ')
}

type ResponseBody = { kind: 'json'; value: unknown } | { kind: 'text'; text: string }

const headerValue = (headers: [string, string][], name: string) =>
  headers.find(([k]) => k.toLowerCase() === name.toLowerCase())?.[1]

/**
 * The body read as JSON when the response says it is JSON or looks like it (starts with `{` or
 * `[`) and parses; as text otherwise. Never as HTML.
 */
function parseResponseBody(response: Pick<ApiResponse, 'body' | 'headers'>): ResponseBody {
  const text = response.body
  const type = headerValue(response.headers, 'content-type') ?? ''
  const looksJson = /^\s*[[{]/.test(text)
  if ((type.includes('json') || looksJson) && text.trim()) {
    try {
      return { kind: 'json', value: JSON.parse(text) as unknown }
    } catch {
      return { kind: 'text', text }
    }
  }
  return { kind: 'text', text }
}

/** Size of the body in bytes, as sent over the wire in UTF-8. */
const bodySize = (body: string) => new TextEncoder().encode(body).length

type StatusKind = 'info' | 'success' | 'redirect' | 'clientError' | 'serverError'

function statusKind(status: number): StatusKind {
  if (status >= 500) return 'serverError'
  if (status >= 400) return 'clientError'
  if (status >= 300) return 'redirect'
  if (status >= 200) return 'success'
  return 'info'
}

export {
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
}
