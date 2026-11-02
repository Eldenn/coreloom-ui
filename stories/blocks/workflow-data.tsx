// Demo node kinds and graphs for the node editor, workflow builder and agent builder stories. The
// kinds are an app's own (labels, fields, icons); the graphs are sample data that must stay the same.
import {
  ClockIcon,
  FilterIcon,
  GlobeIcon,
  HourglassIcon,
  MailIcon,
  MessageSquareIcon,
  PencilLineIcon,
  SplitIcon,
  WebhookIcon,
} from 'lucide-react'

import type { LangGraphJSON } from '@/components/ai-agent-builder'
import type {
  NodeCredential,
  NodeKind,
  NodeRun,
  NodeTestRequest,
  NodeTestResult,
  Workflow,
} from '@/components/ui/node-editor'
import { asConditions, keyValuesToObject } from '@/components/ui/node-editor-fields'

const text = (v: unknown) => (typeof v === 'string' ? v : '')
/** "{{ email }} does not contain @gmail.com" — the first rule, for the card. */
const firstRule = (v: unknown) => {
  const r = asConditions(v).rules.at(0)
  if (!r?.left) return undefined
  const ops: Record<string, string> = {
    equals: '=',
    notEquals: '≠',
    contains: 'contains',
    notContains: 'doesn’t contain',
    startsWith: 'starts with',
    endsWith: 'ends with',
    gt: '>',
    lt: '<',
    isEmpty: 'is empty',
    isNotEmpty: 'is set',
  }
  return [r.left, ops[r.operator], r.right].filter(Boolean).join(' ')
}

export const automationKinds: NodeKind[] = [
  {
    type: 'webhook',
    label: 'Webhook',
    description: 'Starts when your app calls a URL.',
    category: 'Triggers',
    icon: WebhookIcon,
    inputs: [],
    defaults: { method: 'POST', path: '' },
    fields: [
      {
        name: 'method',
        label: 'Method',
        type: 'select',
        options: [
          { value: 'GET', label: 'GET' },
          { value: 'POST', label: 'POST' },
        ],
      },
      { name: 'path', label: 'Path', type: 'text', placeholder: 'signup', required: true },
    ],
    summary: (d) => (text(d.path) ? `${text(d.method)} /${text(d.path)}` : undefined),
  },
  {
    type: 'schedule',
    label: 'Schedule',
    description: 'Starts at set times.',
    category: 'Triggers',
    icon: ClockIcon,
    inputs: [],
    defaults: { every: 'day', at: '09:00' },
    fields: [
      {
        name: 'every',
        label: 'Every',
        type: 'select',
        options: [
          { value: 'hour', label: 'Hour' },
          { value: 'day', label: 'Day' },
          { value: 'week', label: 'Week' },
        ],
      },
      { name: 'at', label: 'At', type: 'text', placeholder: '09:00' },
    ],
    summary: (d) => `Every ${text(d.every)} at ${text(d.at)}`,
  },
  {
    type: 'if',
    label: 'If',
    description: 'Sends items one way or the other.',
    category: 'Logic',
    icon: SplitIcon,
    outputs: [
      { id: 'true', label: 'true' },
      { id: 'false', label: 'false' },
    ],
    fields: [{ name: 'conditions', label: 'Conditions', type: 'conditions', required: true }],
    summary: (d) => firstRule(d.conditions),
  },
  {
    type: 'filter',
    label: 'Filter',
    description: 'Keeps the items that match.',
    category: 'Logic',
    icon: FilterIcon,
    fields: [{ name: 'conditions', label: 'Keep when', type: 'conditions', required: true }],
    summary: (d) => firstRule(d.conditions),
  },
  {
    type: 'wait',
    label: 'Wait',
    description: 'Pauses before the next step.',
    category: 'Logic',
    icon: HourglassIcon,
    defaults: { amount: 1, unit: 'hours' },
    fields: [
      { name: 'amount', label: 'Amount', type: 'number', min: 1 },
      {
        name: 'unit',
        label: 'Unit',
        type: 'select',
        options: [
          { value: 'minutes', label: 'Minutes' },
          { value: 'hours', label: 'Hours' },
          { value: 'days', label: 'Days' },
        ],
      },
    ],
    summary: (d) => `${typeof d.amount === 'number' ? String(d.amount) : ''} ${text(d.unit)}`,
  },
  {
    type: 'set',
    label: 'Edit fields',
    description: 'Adds, renames or removes fields.',
    category: 'Data',
    icon: PencilLineIcon,
    fields: [
      {
        name: 'values',
        label: 'Fields to set',
        type: 'keyValue',
        keyPlaceholder: 'name',
        valuePlaceholder: '{{ name }}',
      },
      { name: 'dropOthers', label: 'Drop the other fields', type: 'switch' },
    ],
    summary: (d) => Object.keys(keyValuesToObject(d.values)).join(', ') || undefined,
  },
  {
    type: 'http',
    label: 'HTTP request',
    description: 'Calls an API.',
    category: 'Actions',
    icon: GlobeIcon,
    defaults: { method: 'GET', url: '' },
    fields: [
      {
        name: 'method',
        label: 'Method',
        type: 'select',
        options: ['GET', 'POST', 'PUT', 'DELETE'].map((m) => ({ value: m, label: m })),
      },
      {
        name: 'url',
        label: 'URL',
        type: 'text',
        placeholder: 'https://api.example.com/…',
        required: true,
      },
      { name: 'auth', label: 'Credential', type: 'credential', credentialType: 'api' },
      { name: 'query', label: 'Query parameters', type: 'keyValue' },
      { name: 'body', label: 'Body', type: 'code', language: 'json', placeholder: '{ }' },
    ],
    summary: (d) => text(d.url) || undefined,
  },
  {
    type: 'email',
    label: 'Send email',
    description: 'Sends an email.',
    category: 'Actions',
    icon: MailIcon,
    fields: [
      { name: 'account', label: 'Send from', type: 'credential', credentialType: 'smtp' },
      { name: 'to', label: 'To', type: 'text', required: true },
      { name: 'subject', label: 'Subject', type: 'text' },
      { name: 'body', label: 'Message', type: 'textarea' },
    ],
    summary: (d) => text(d.subject) || undefined,
  },
  {
    type: 'chat',
    label: 'Post a message',
    description: 'Posts to a team channel.',
    category: 'Actions',
    icon: MessageSquareIcon,
    fields: [
      { name: 'channel', label: 'Channel', type: 'text', placeholder: '#sales', required: true },
      { name: 'message', label: 'Message', type: 'textarea' },
    ],
    summary: (d) => text(d.channel) || undefined,
  },
]

/** A signup flow: business emails go to sales, the rest get a welcome email. */
export const signupWorkflow: Workflow = {
  nodes: [
    {
      id: 'webhook',
      type: 'webhook',
      name: 'New signup',
      position: { x: 0, y: 90 },
      data: { method: 'POST', path: 'signup' },
    },
    {
      id: 'if',
      type: 'if',
      name: 'Business email?',
      position: { x: 340, y: 90 },
      data: {
        conditions: {
          combinator: 'and',
          rules: [{ left: '{{ email }}', operator: 'notContains', right: '@gmail.com' }],
        },
      },
    },
    {
      id: 'http',
      type: 'http',
      name: 'Enrich company',
      position: { x: 700, y: 0 },
      data: {
        method: 'GET',
        url: 'https://api.example.com/companies',
        auth: 'crm-key',
        query: [{ key: 'domain', value: '{{ company.domain }}' }],
      },
    },
    {
      id: 'chat',
      type: 'chat',
      name: 'Tell sales',
      position: { x: 1060, y: 0 },
      data: { channel: '#sales', message: 'New signup from {{ company.name }}' },
    },
    {
      id: 'email',
      type: 'email',
      name: 'Welcome email',
      position: { x: 700, y: 200 },
      data: { account: 'smtp-main', to: '{{ email }}', subject: 'Welcome aboard, {{ name }}' },
    },
  ],
  edges: [
    { id: 'e1', source: 'webhook', target: 'if' },
    { id: 'e2', source: 'if', sourcePort: 'true', target: 'http' },
    { id: 'e3', source: 'http', target: 'chat' },
    { id: 'e4', source: 'if', sourcePort: 'false', target: 'email' },
  ],
}

/** The signup flow with a note for the team and the sales steps framed in a group. */
export const annotatedWorkflow: Workflow = {
  ...signupWorkflow,
  groups: [
    {
      id: 'group-1',
      label: 'Sales',
      color: 'blue',
      position: { x: 668, y: -68 },
      width: 664,
      height: 184,
    },
  ],
  notes: [
    {
      id: 'note-1',
      text: 'Signups come from the website form.\nBusiness emails are enriched, then sales hear about them; everyone gets a welcome email.',
      position: { x: 0, y: 220 },
      width: 300,
      height: 128,
    },
  ],
}

/** The same flow with a step left half set up: the editor flags what's missing. */
export const unfinishedWorkflow: Workflow = {
  nodes: [
    ...signupWorkflow.nodes.filter((n) => n.id !== 'email'),
    {
      id: 'email',
      type: 'email',
      name: 'Welcome email',
      position: { x: 700, y: 200 },
      data: { subject: 'Welcome aboard' },
    },
    { id: 'wait', type: 'wait', position: { x: 1060, y: 200 }, data: { amount: 2, unit: 'days' } },
  ],
  edges: signupWorkflow.edges.filter((e) => e.id !== 'e4'),
}

export const demoCredentials: NodeCredential[] = [
  { id: 'crm-key', name: 'CRM API key', type: 'api' },
  { id: 'smtp-main', name: 'hello@acme.io', type: 'smtp' },
]

const signup = {
  name: 'Ada Lovelace',
  email: 'ada@analytical.io',
  company: { name: 'Analytical', domain: 'analytical.io', size: 42 },
}

/** A finished run: what each node received and gave, for the Input and Output tabs. */
export const signupRuns: Partial<Record<string, NodeRun>> = {
  webhook: { status: 'success', message: '1 item', output: [signup] },
  if: { status: 'success', message: 'true', input: [signup], output: [signup] },
  http: {
    status: 'success',
    message: '200',
    input: [signup],
    output: [
      { status: 200, company: { name: 'Analytical', industry: 'Computing', employees: 42 } },
    ],
  },
  chat: { status: 'success', message: 'Posted' },
  email: { status: 'skipped' },
}

/**
 * A stand-in for the app's own "run this node": waits a little, then echoes what the node would do
 * with its input. Real apps call their backend here.
 */
export function fakeRunNode({ node, input }: NodeTestRequest): Promise<NodeTestResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (node.type === 'http')
        resolve({
          message: '200',
          output: [{ status: 200, company: { name: 'Analytical', employees: 42 } }],
        })
      else if (node.type === 'email')
        resolve({ message: 'Sent', output: [{ id: 'msg_1', accepted: true }] })
      else resolve({ output: input ?? [] })
    }, 400)
  })
}

export const demoTools = [
  { id: 'web_search', name: 'Web search' },
  { id: 'fetch_page', name: 'Fetch page' },
  { id: 'crm_lookup', name: 'CRM lookup' },
  { id: 'send_email', name: 'Send email' },
]

/** A supervisor that routes to a researcher (with tools) or a writer, then a human approves. */
export const researchGraph: Workflow = {
  nodes: [
    { id: '__start__', type: 'start', position: { x: 0, y: 150 } },
    {
      id: 'supervisor',
      type: 'agent',
      name: 'Supervisor',
      position: { x: 280, y: 130 },
      data: {
        model: 'claude-sonnet',
        instructions: 'Decide who works next for {{topic}}.',
        tools: [],
      },
    },
    {
      id: 'next',
      type: 'router',
      name: 'Who’s next?',
      position: { x: 620, y: 130 },
      data: { routes: ['research', 'write', 'finish'], condition: 'The supervisor’s choice' },
    },
    {
      id: 'researcher',
      type: 'agent',
      name: 'Researcher',
      position: { x: 960, y: 0 },
      data: {
        model: 'claude-haiku',
        instructions: 'Find sources on {{topic}}.',
        tools: ['web_search', 'fetch_page'],
      },
    },
    {
      id: 'tools',
      type: 'tool',
      position: { x: 1300, y: 0 },
      data: { tools: ['web_search', 'fetch_page'] },
    },
    {
      id: 'writer',
      type: 'agent',
      name: 'Writer',
      position: { x: 960, y: 170 },
      data: { model: 'claude-sonnet', instructions: 'Write the brief.', tools: [] },
    },
    {
      id: 'review',
      type: 'human',
      name: 'Editor review',
      position: { x: 960, y: 330 },
      data: { question: 'Publish this brief?' },
    },
    { id: '__end__', type: 'end', position: { x: 1300, y: 340 } },
  ],
  edges: [
    { id: 'a', source: '__start__', target: 'supervisor' },
    { id: 'b', source: 'supervisor', target: 'next' },
    { id: 'c', source: 'next', sourcePort: 'research', target: 'researcher' },
    { id: 'd', source: 'next', sourcePort: 'write', target: 'writer' },
    { id: 'e', source: 'next', sourcePort: 'finish', target: 'review' },
    { id: 'f', source: 'researcher', target: 'tools' },
    { id: 'g', source: 'tools', target: 'researcher' },
    { id: 'h', source: 'researcher', target: 'supervisor' },
    { id: 'i', source: 'writer', target: 'supervisor' },
    { id: 'j', source: 'review', target: '__end__' },
  ],
}

/** What LangGraph's `graph.get_graph().to_json()` gives for its prebuilt ReAct agent. */
export const reactAgentJSON: LangGraphJSON = {
  nodes: [
    { id: '__start__', type: 'schema', data: '__start__' },
    {
      id: 'agent',
      type: 'runnable',
      data: { id: ['langgraph', 'utils', 'runnable', 'RunnableCallable'], name: 'agent' },
    },
    {
      id: 'tools',
      type: 'runnable',
      data: { id: ['langgraph', 'prebuilt', 'tool_node', 'ToolNode'], name: 'tools' },
    },
    { id: '__end__', type: 'schema', data: '__end__' },
  ],
  edges: [
    { source: '__start__', target: 'agent' },
    { source: 'agent', target: 'tools', conditional: true },
    { source: 'agent', target: '__end__', conditional: true },
    { source: 'tools', target: 'agent' },
  ],
}
