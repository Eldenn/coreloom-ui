import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  type ApiEndpoint,
  type ApiRequest,
  type ApiResponse,
  ApiTryIt,
} from '@/components/api-try-it'

const BASE_URL = 'https://api.coreloom.dev/v1'

const wait = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })

const json = (value: unknown) => JSON.stringify(value, null, 2)

const listDeployments: ApiEndpoint = {
  method: 'GET',
  path: '/projects/{projectId}/deployments',
  summary: 'List the deployments of a project, newest first.',
  parameters: [
    {
      name: 'projectId',
      in: 'path',
      required: true,
      description: 'The project’s id or slug.',
      example: 'web',
    },
    { name: 'state', in: 'query', description: 'ready, building or error.', example: 'ready' },
    { name: 'limit', in: 'query', description: 'From 1 to 100. 20 by default.', example: '20' },
  ],
}

const deployments = {
  data: [
    { id: 'dpl_7Hq2', state: 'ready', branch: 'main', createdAt: '2026-10-14T08:52:00Z' },
    { id: 'dpl_6Kx9', state: 'ready', branch: 'main', createdAt: '2026-10-13T17:04:00Z' },
  ],
  hasMore: false,
}

const okResponse: ApiResponse = {
  status: 200,
  statusText: 'OK',
  headers: [
    ['content-type', 'application/json; charset=utf-8'],
    ['x-request-id', 'req_2f9c1a'],
    ['x-ratelimit-remaining', '4998'],
  ],
  body: json(deployments),
  durationMs: 142,
}

/** Stands in for the app's call: answers after 700 ms, and stops when cancelled. */
async function fakeSend(request: ApiRequest, { signal }: { signal: AbortSignal }) {
  await wait(700, signal)
  const missingToken = !request.headers.some(([name]) => name === 'Authorization')
  if (missingToken)
    return {
      status: 401,
      statusText: 'Unauthorized',
      headers: [['content-type', 'application/json']],
      body: json({ error: { code: 'unauthorized', message: 'Send a bearer token.' } }),
      durationMs: 38,
    } satisfies ApiResponse
  return okResponse
}

const meta = {
  title: 'Blocks/Developer/API try it',
  component: ApiTryIt,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The panel an API reference page shows beside an endpoint: path, query and header parameters, extra headers, a JSON body, Send, then the status, time, size, body and headers that came back, and Copy as cURL. The consumer wires `onSend(request, { signal })`: the app makes the call and resolves with `{ status, headers, body }`. Experimental.',
      },
    },
  },
  args: {
    endpoint: listDeployments,
    baseUrl: BASE_URL,
    onSend: fakeSend,
    auth: { defaultToken: 'cl_live_4f7a9c2e81d3b6a0' },
    defaultValues: { projectId: 'web', limit: '20' },
  },
  argTypes: {
    baseUrl: { control: 'text' },
    title: { control: 'text' },
  },
  render: (args) => (
    <div className="mx-auto max-w-[720px]">
      <ApiTryIt {...args} />
    </div>
  ),
} satisfies Meta<typeof ApiTryIt>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithResponse: Story = {
  name: 'With a response',
  args: {
    defaultValues: { projectId: 'web', state: 'ready', limit: '2' },
    defaultResponse: okResponse,
  },
}

export const PostWithBody: Story = {
  name: 'POST with a JSON body',
  args: {
    endpoint: {
      method: 'POST',
      path: '/projects',
      summary: 'Create a project. Send the same Idempotency-Key to retry safely.',
      parameters: [
        {
          name: 'Idempotency-Key',
          in: 'header',
          required: true,
          description: 'Any unique string, such as a UUID.',
          example: '6f1c…',
        },
      ],
      body: { example: json({ name: 'Web app', framework: 'vite', region: 'eu-west' }) },
    },
    defaultValues: { 'Idempotency-Key': 'b8e2d0c4-1f6a-4c39-9a57-3e0d2f7b1c88' },
  },
}

export const ErrorResponse: Story = {
  name: 'Error response',
  args: {
    defaultValues: { projectId: 'missing-project' },
    defaultResponse: {
      status: 404,
      statusText: 'Not Found',
      headers: [['content-type', 'application/problem+json']],
      body: json({
        type: 'https://api.coreloom.dev/errors/not-found',
        title: 'Project not found',
        detail: 'No project has the id or slug “missing-project”.',
      }),
      durationMs: 51,
    },
  },
}

export const NetworkError: Story = {
  name: 'Network error',
  args: {
    onSend: async (_request, { signal }) => {
      await wait(300, signal)
      throw new TypeError('Failed to fetch (the API doesn’t allow this origin: check CORS).')
    },
  },
}

export const LongContent: Story = {
  name: 'Long URL and text body',
  args: {
    endpoint: {
      method: 'GET',
      path: '/organizations/{organizationId}/projects/{projectId}/deployments/{deploymentId}/build-logs',
      summary: 'The build log of one deployment, as plain text.',
      parameters: [
        { name: 'organizationId', in: 'path', required: true },
        { name: 'projectId', in: 'path', required: true },
        { name: 'deploymentId', in: 'path', required: true },
        { name: 'since', in: 'query', example: '2026-10-14T08:00:00Z' },
      ],
    },
    defaultValues: {
      organizationId: 'org_northwind-traders-international',
      projectId: 'customer-portal-with-a-very-long-name',
      deploymentId: 'dpl_7Hq2Lx0aZr8Pw3Vt',
      since: '2026-10-14T08:00:00Z',
    },
    defaultResponse: {
      status: 200,
      statusText: 'OK',
      headers: [
        ['content-type', 'text/plain; charset=utf-8'],
        [
          'content-security-policy',
          "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
        ],
      ],
      body: [
        '08:52:01 Cloning github.com/northwind/customer-portal-with-a-very-long-name (branch main, commit 4f7a9c2)',
        '08:52:04 Installing dependencies with pnpm 12.13.0',
        '08:52:31 Building: vite build --mode production --outDir dist/client/assets/with/a/deep/path',
        '08:52:58 Uploading 214 files (3.4 MB)',
        '08:53:02 Ready: https://customer-portal-with-a-very-long-name-git-main-northwind.coreloom.app',
      ].join('\n'),
      durationMs: 96,
    },
  },
}

export const French: Story = {
  globals: { locale: 'fr' },
  args: {
    endpoint: {
      ...listDeployments,
      summary: 'Liste les déploiements d’un projet, du plus récent au plus ancien.',
      parameters: [
        {
          name: 'projectId',
          in: 'path',
          required: true,
          description: 'L’identifiant ou le slug du projet.',
          example: 'web',
        },
        { name: 'state', in: 'query', description: 'ready, building ou error.' },
      ],
    },
    auth: { defaultToken: 'cl_live_4f7a9c2e81d3b6a0', label: 'Jeton d’API' },
    defaultResponse: okResponse,
  },
}

export const Phone: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: { defaultResponse: okResponse },
}
