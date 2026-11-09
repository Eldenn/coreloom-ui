// API try it: the URL built from an endpoint and the values typed, the request with its headers
// and body, the cURL command (quoted for a shell, whatever the values hold), and how a response
// body is read.
import { execFileSync } from 'node:child_process'

import { describe, expect, it } from 'vitest'

import {
  type ApiEndpoint,
  bodySize,
  buildRequest,
  buildRequestUrl,
  parseResponseBody,
  previewUrl,
  shellQuote,
  statusKind,
  toCurl,
} from '@/components/api-try-it-request'

const getDeployment: ApiEndpoint = {
  method: 'GET',
  path: '/projects/{projectId}/deployments/{id}',
  parameters: [
    { name: 'projectId', in: 'path', required: true },
    { name: 'id', in: 'path', required: true },
    { name: 'include', in: 'query' },
    { name: 'limit', in: 'query', required: true },
    { name: 'X-Request-Id', in: 'header' },
  ],
}

describe('buildRequestUrl', () => {
  it('fills the path and appends the query, leaving empty optional values out', () => {
    expect(
      buildRequestUrl('https://api.example.com/v1/', getDeployment, {
        projectId: 'web',
        id: 'dpl_42',
        limit: '10',
        include: '',
      }),
    ).toEqual({
      ok: true,
      url: 'https://api.example.com/v1/projects/web/deployments/dpl_42?limit=10',
    })
  })

  it('lists every required parameter left empty or blank', () => {
    expect(buildRequestUrl('https://x.test', getDeployment, { projectId: '  ' })).toEqual({
      ok: false,
      missing: ['projectId', 'id', 'limit'],
    })
  })

  it('counts a path parameter the endpoint names without declaring it', () => {
    const endpoint: ApiEndpoint = { method: 'GET', path: '/users/{userId}' }
    expect(buildRequestUrl('https://x.test', endpoint, {})).toEqual({
      ok: false,
      missing: ['userId'],
    })
  })

  it('encodes path values so they cannot add segments, queries or fragments', () => {
    const endpoint: ApiEndpoint = { method: 'GET', path: '/files/{name}' }
    const built = buildRequestUrl('https://x.test', endpoint, { name: '../../admin?x=1#top' })
    expect(built).toEqual({ ok: true, url: 'https://x.test/files/..%2F..%2Fadmin%3Fx%3D1%23top' })
  })

  it('encodes query values and keeps a query already in the path', () => {
    const endpoint: ApiEndpoint = {
      method: 'GET',
      path: '/search?type=all',
      parameters: [{ name: 'q', in: 'query' }],
    }
    expect(buildRequestUrl('https://x.test', endpoint, { q: 'a&b=c é' })).toEqual({
      ok: true,
      url: 'https://x.test/search?type=all&q=a%26b%3Dc+%C3%A9',
    })
  })

  it('joins a base URL and a path without doubling or missing the slash', () => {
    const endpoint: ApiEndpoint = { method: 'GET', path: 'health' }
    expect(buildRequestUrl('/api//', endpoint, {})).toEqual({ ok: true, url: '/api/health' })
  })
})

describe('previewUrl', () => {
  it('keeps placeholders for path parameters not filled yet', () => {
    expect(previewUrl('https://x.test', getDeployment, { id: 'dpl_42', limit: '5' })).toBe(
      'https://x.test/projects/{projectId}/deployments/dpl_42?limit=5',
    )
  })

  it('still shows the URL while a required query parameter is empty', () => {
    expect(previewUrl('https://x.test', getDeployment, {})).toBe(
      'https://x.test/projects/{projectId}/deployments/{id}',
    )
  })
})

describe('buildRequest', () => {
  const createProject: ApiEndpoint = {
    method: 'POST',
    path: '/projects',
    parameters: [{ name: 'Idempotency-Key', in: 'header', required: true }],
    body: { example: '{}' },
  }

  it('gathers header parameters, extra headers, the token and a JSON content type', () => {
    const built = buildRequest({
      baseUrl: 'https://x.test',
      endpoint: createProject,
      values: { 'Idempotency-Key': 'k1' },
      headers: [
        { key: ' X-Trace ', value: 'abc' },
        { key: '', value: 'dropped' },
      ],
      body: '{"name":"Web"}',
      auth: { header: 'Authorization', value: 'Bearer cl_live_123' },
    })
    expect(built).toEqual({
      ok: true,
      request: {
        method: 'POST',
        url: 'https://x.test/projects',
        headers: [
          ['Idempotency-Key', 'k1'],
          ['X-Trace', 'abc'],
          ['Authorization', 'Bearer cl_live_123'],
          ['Content-Type', 'application/json'],
        ],
        body: '{"name":"Web"}',
      },
    })
  })

  it('keeps a content type someone set by hand', () => {
    const built = buildRequest({
      baseUrl: 'https://x.test',
      endpoint: createProject,
      values: { 'Idempotency-Key': 'k1' },
      headers: [{ key: 'content-type', value: 'application/merge-patch+json' }],
      body: '{}',
    })
    expect(built.ok && built.request.headers).toEqual([
      ['Idempotency-Key', 'k1'],
      ['content-type', 'application/merge-patch+json'],
    ])
  })

  it('sends no body with GET or DELETE, and none when the editor is blank', () => {
    const del: ApiEndpoint = { method: 'DELETE', path: '/projects/{id}' }
    const built = buildRequest({ baseUrl: '', endpoint: del, values: { id: '1' }, body: '{"a":1}' })
    expect(built).toEqual({
      ok: true,
      request: { method: 'DELETE', url: '/projects/1', headers: [] },
    })
    const blank = buildRequest({
      baseUrl: '',
      endpoint: createProject,
      values: { 'Idempotency-Key': 'k' },
      body: '  \n',
    })
    expect(blank.ok && blank.request.body).toBeUndefined()
  })

  it('reports missing parameters instead of a request', () => {
    expect(buildRequest({ baseUrl: '', endpoint: createProject, values: {} })).toEqual({
      ok: false,
      missing: ['Idempotency-Key'],
    })
  })
})

describe('toCurl', () => {
  it('writes one option per line, without -X for GET', () => {
    expect(
      toCurl({
        method: 'GET',
        url: 'https://x.test/a?b=1',
        headers: [['Accept', 'application/json']],
      }),
    ).toBe("curl 'https://x.test/a?b=1' \\\n  -H 'Accept: application/json'")
  })

  it('quotes single quotes and shell syntax so the shell reads them as text', () => {
    const request = {
      method: 'POST' as const,
      url: "https://x.test/it's?a=$(rm -rf ~)",
      headers: [['X-Note', "it's `whoami` $HOME"]] as [string, string][],
      body: '{"name":"O\'Brien","cmd":"$(id); echo \\"hi\\""}\nsecond line',
    }
    const command = toCurl(request)
    expect(command).toContain("-X POST 'https://x.test/it'\\''s?a=$(rm -rf ~)'")
    // The shell itself turns each quoted word back into the exact original text.
    const words = (s: string) =>
      execFileSync('sh', ['-c', `printf '%s\\0' ${s}`], { encoding: 'utf8' }).split('\0')
    expect(words(shellQuote(request.url))[0]).toBe(request.url)
    expect(words(shellQuote(request.body))[0]).toBe(request.body)
    expect(words(shellQuote(`X-Note: ${request.headers[0]?.[1] ?? ''}`))[0]).toBe(
      "X-Note: it's `whoami` $HOME",
    )
  })
})

describe('parseResponseBody', () => {
  it('reads JSON when the content type says so or the text looks like it', () => {
    expect(
      parseResponseBody({ body: '{"ok":true}', headers: [['Content-Type', 'application/json']] }),
    ).toEqual({ kind: 'json', value: { ok: true } })
    expect(parseResponseBody({ body: ' [1,2]', headers: [] })).toEqual({
      kind: 'json',
      value: [1, 2],
    })
  })

  it('falls back to text for broken JSON, HTML and empty bodies', () => {
    expect(
      parseResponseBody({ body: '{"ok":', headers: [['content-type', 'application/json']] }),
    ).toEqual({ kind: 'text', text: '{"ok":' })
    const html = '<script>alert(1)</script>'
    expect(parseResponseBody({ body: html, headers: [['content-type', 'text/html']] })).toEqual({
      kind: 'text',
      text: html,
    })
    expect(
      parseResponseBody({ body: '', headers: [['content-type', 'application/json']] }),
    ).toEqual({ kind: 'text', text: '' })
  })
})

describe('statusKind and bodySize', () => {
  it('sorts statuses by class', () => {
    expect([101, 200, 204, 301, 404, 422, 500, 503].map(statusKind)).toEqual([
      'info',
      'success',
      'success',
      'redirect',
      'clientError',
      'clientError',
      'serverError',
      'serverError',
    ])
  })

  it('counts UTF-8 bytes, not characters', () => {
    expect(bodySize('abc')).toBe(3)
    expect(bodySize('é€')).toBe(5)
  })
})
