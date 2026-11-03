import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { type ApiKey, ApiKeys, type ApiKeyScope } from '@/components/api-keys'
import { toast } from '@/components/ui/sonner'
import {
  type WebhookDelivery,
  type WebhookEndpoint,
  type WebhookEventType,
  Webhooks,
} from '@/components/webhooks'

const at = (month: number, date: number, hour = 9, minute = 0) =>
  new Date(2026, month - 1, date, hour, minute)
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

const meta = {
  title: 'Blocks/Developer settings',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Settings for developers. `ApiKeys`: the workspace’s keys (visible ends, access, created, last used, expiry), Create (name, access, expiry; your `onCreate` returns the secret, shown once with Copy) and Revoke. `Webhooks`: endpoints with their events, an on / off switch, the signing secret, and each endpoint’s deliveries with payload, response and Redeliver. Everything goes through callbacks.',
      },
    },
  },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

// ——— API keys ———

const scopes: ApiKeyScope[] = [
  { value: 'read', label: 'Read', description: 'Projects, deployments and logs.' },
  { value: 'deploy', label: 'Deploy', description: 'Start and cancel deployments.' },
  { value: 'admin', label: 'Admin', description: 'Members, billing and settings.' },
]

const initialKeys: ApiKey[] = [
  {
    id: 'k1',
    name: 'Production server',
    prefix: 'cl_live_',
    last4: '9f2c',
    scopes: ['read', 'deploy'],
    createdAt: at(3, 2),
    createdBy: 'Ada Lovelace',
    lastUsedAt: at(10, 14, 9, 52),
    expiresAt: at(3, 2 + 365),
  },
  {
    id: 'k2',
    name: 'GitHub Actions',
    prefix: 'cl_live_',
    last4: 'a71e',
    scopes: ['deploy'],
    createdAt: at(8, 20),
    createdBy: 'Grace Hopper',
    lastUsedAt: at(10, 13, 18, 4),
    expiresAt: at(11, 18),
  },
  {
    id: 'k3',
    name: 'Local testing',
    prefix: 'cl_test_',
    last4: '03bd',
    scopes: ['read'],
    createdAt: at(10, 1),
    createdBy: 'Alan Turing',
  },
]

export const ApiKeysList: Story = {
  name: 'API keys',
  render: () => {
    const [keys, setKeys] = React.useState(initialKeys)
    return (
      <div className="mx-auto max-w-[860px] py-4">
        <ApiKeys
          keys={keys}
          scopes={scopes}
          onCreate={async (input) => {
            await wait(700)
            const last4 = 'c4d8'
            setKeys((list) => [
              {
                id: `k${String(list.length + 1)}`,
                name: input.name,
                prefix: 'cl_live_',
                last4,
                scopes: input.scopes,
                createdAt: at(10, 14, 10),
                createdBy: 'You',
              },
              ...list,
            ])
            // A fake key for the demo: real ones come from your API.
            return { secret: `cl_live_demo0000000000000000000000${last4}` }
          }}
          onRevoke={(id) => {
            setKeys((list) => list.filter((k) => k.id !== id))
            toast('Key revoked')
          }}
        />
      </div>
    )
  },
}

export const ApiKeysEmpty: Story = {
  name: 'API keys · empty',
  render: () => (
    <div className="mx-auto max-w-[860px] py-4">
      <ApiKeys keys={[]} scopes={scopes} onCreate={() => ({ secret: 'cl_test_demo' })} />
    </div>
  ),
}

export const ApiKeysFrench: Story = {
  name: 'API keys · French',
  globals: { locale: 'fr' },
  render: () => (
    <div className="mx-auto max-w-[860px] py-4">
      <ApiKeys
        keys={initialKeys.map((k) => ({
          ...k,
          name:
            { k1: 'Serveur de production', k2: 'GitHub Actions', k3: 'Tests en local' }[k.id] ??
            k.name,
        }))}
        scopes={[
          { value: 'read', label: 'Lecture' },
          { value: 'deploy', label: 'Déploiement' },
          { value: 'admin', label: 'Administration' },
        ]}
        onCreate={() => ({ secret: 'cl_test_demo' })}
        onRevoke={() => undefined}
      />
    </div>
  ),
}

// ——— Webhooks ———

const events: WebhookEventType[] = [
  { value: 'deployment.created', label: 'deployment.created' },
  { value: 'deployment.succeeded', label: 'deployment.succeeded' },
  { value: 'deployment.failed', label: 'deployment.failed' },
  { value: 'member.invited', label: 'member.invited' },
  { value: 'invoice.paid', label: 'invoice.paid' },
]

const initialEndpoints: WebhookEndpoint[] = [
  {
    id: 'we1',
    url: 'https://hooks.acme.dev/coreloom/deploys',
    description: 'Posts deploys to #releases',
    events: ['deployment.created', 'deployment.succeeded', 'deployment.failed'],
    enabled: true,
    secret: 'cl_whs_demo00000000000000000000b7e1',
  },
  {
    id: 'we2',
    url: 'https://billing.acme.dev/webhooks/coreloom',
    events: ['invoice.paid'],
    enabled: false,
    secret: 'cl_whs_demo00000000000000000000e40a',
  },
]

const deliveries: WebhookDelivery[] = [
  {
    id: 'd1',
    endpointId: 'we1',
    event: 'deployment.succeeded',
    status: 'succeeded',
    statusCode: 200,
    at: at(10, 14, 9, 41),
    durationMs: 182,
    payload: {
      id: 'evt_2Lw8',
      type: 'deployment.succeeded',
      data: { project: 'coreloom-web', deployment: 'dpl_91c', url: 'https://coreloom-web.app' },
    },
    response: '{"ok":true}',
  },
  {
    id: 'd2',
    endpointId: 'we1',
    event: 'deployment.failed',
    status: 'failed',
    statusCode: 500,
    at: at(10, 14, 8, 3),
    durationMs: 3012,
    attempt: 3,
    payload: {
      id: 'evt_2Lv1',
      type: 'deployment.failed',
      data: { project: 'coreloom-api', deployment: 'dpl_90a', error: 'Build failed' },
    },
    response: 'Internal Server Error',
  },
  {
    id: 'd3',
    endpointId: 'we1',
    event: 'deployment.created',
    status: 'succeeded',
    statusCode: 200,
    at: at(10, 14, 7, 58),
    durationMs: 140,
    payload: { id: 'evt_2Lu9', type: 'deployment.created', data: { project: 'coreloom-api' } },
    response: '{"ok":true}',
  },
]

export const WebhooksList: Story = {
  name: 'Webhooks',
  render: () => {
    const [endpoints, setEndpoints] = React.useState(initialEndpoints)
    return (
      <div className="mx-auto max-w-[860px] py-4">
        <Webhooks
          endpoints={endpoints}
          deliveries={deliveries}
          events={events}
          defaultOpenId="we1"
          onCreate={async (input) => {
            await wait(600)
            setEndpoints((list) => [
              ...list,
              { id: `we${String(list.length + 1)}`, ...input, enabled: true },
            ])
          }}
          onToggle={(id, enabled) => {
            setEndpoints((list) => list.map((e) => (e.id === id ? { ...e, enabled } : e)))
          }}
          onDelete={(id) => {
            setEndpoints((list) => list.filter((e) => e.id !== id))
          }}
          onRedeliver={async (d) => {
            await wait(800)
            toast.success(`${d.event} redelivered`)
          }}
          onSendTest={async () => {
            await wait(600)
            toast('Test event sent')
          }}
        />
      </div>
    )
  },
}

export const WebhooksEmpty: Story = {
  name: 'Webhooks · empty',
  render: () => (
    <div className="mx-auto max-w-[860px] py-4">
      <Webhooks endpoints={[]} events={events} onCreate={() => undefined} />
    </div>
  ),
}

export const WebhooksFrench: Story = {
  name: 'Webhooks · French',
  globals: { locale: 'fr' },
  render: () => (
    <div className="mx-auto max-w-[860px] py-4">
      <Webhooks
        endpoints={initialEndpoints.map((e) =>
          e.description ? { ...e, description: 'Publie les déploiements dans #releases' } : e,
        )}
        deliveries={deliveries}
        events={events}
        defaultOpenId="we1"
        onCreate={() => undefined}
        onToggle={() => undefined}
        onDelete={() => undefined}
        onRedeliver={() => undefined}
        onSendTest={() => undefined}
      />
    </div>
  ),
}
