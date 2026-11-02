import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { type AuditAction, type AuditEvent, AuditLog } from '@/components/audit-log'
import {
  type ActiveSession,
  ActiveSessions,
  TwoFactorSettings,
} from '@/components/security-settings'
import { toast } from '@/components/ui/sonner'

const at = (month: number, date: number, hour = 9, minute = 0) =>
  new Date(2026, month - 1, date, hour, minute)
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * A stand-in for a QR code (a pattern, not a real code): in an app, render the otpauth:// URI with
 * a QR library, on a light background so phones can read it.
 */
function DemoQrCode() {
  const size = 21
  const cells: React.ReactNode[] = []
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const finder = (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7)
      const on = finder
        ? Math.max(Math.abs((x % 14) - 3), Math.abs((y % 14) - 3)) !== 2
        : (x * 7 + y * 13 + x * y) % 3 === 0
      if (on)
        cells.push(<rect key={`${String(x)}-${String(y)}`} x={x} y={y} width={1} height={1} />)
    }
  return (
    <svg viewBox={`-1 -1 ${String(size + 2)} ${String(size + 2)}`} role="img" aria-label="QR code">
      <rect x={-1} y={-1} width={size + 2} height={size + 2} className="fill-background" />
      <g className="fill-foreground">{cells}</g>
    </svg>
  )
}

const meta = {
  title: 'Blocks/Security',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Security settings. `TwoFactorSettings`: turn on two-step sign-in with an authenticator app (your `onSetupStart` returns the secret and a QR code, `onSetupVerify` checks the code and returns recovery codes, shown once), new recovery codes, turn it off. `ActiveSessions`: the devices signed in, with Sign out and Sign out everywhere else. `AuditLog`: who did what, grouped by day, with search, filters, details, Export and Load more. In the setup demo, any 6 digits but 000000 work.',
      },
    },
  },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

// ——— Two-step sign-in ———

export const TwoFactorOff: Story = {
  name: 'Two-step sign-in · off',
  render: () => {
    const [enabled, setEnabled] = React.useState(false)
    return (
      <div className="mx-auto max-w-[720px] py-4">
        <TwoFactorSettings
          enabled={enabled}
          enabledAt={at(10, 14, 10)}
          recoveryCodesLeft={10}
          onSetupStart={async () => {
            await wait(500)
            return { secret: 'JBSWY3DPEHPK3PXP', qrCode: <DemoQrCode /> }
          }}
          onSetupVerify={async (code) => {
            await wait(600)
            if (code === '000000') throw new Error('Wrong code')
            setEnabled(true)
            return {
              recoveryCodes: [
                '7KQ2-M4XD',
                'P9VA-3HTN',
                'C6WE-8ZRJ',
                'L2YF-5BQS',
                'H8NU-1GKD',
                'R3TM-6VXC',
              ],
            }
          }}
          onDisable={() => {
            setEnabled(false)
          }}
          onRegenerateCodes={() => [
            'N4QK-2WFA',
            'B7ZD-9MHE',
            'T3XR-5CJL',
            'F6PV-8UGN',
            'Y2LS-4DKT',
            'M9HC-7RBW',
          ]}
        />
      </div>
    )
  },
}

export const TwoFactorOn: Story = {
  name: 'Two-step sign-in · on',
  render: () => (
    <div className="mx-auto max-w-[720px] py-4">
      <TwoFactorSettings
        enabled
        enabledAt={at(3, 12)}
        recoveryCodesLeft={2}
        onDisable={() => toast('Turned off')}
        onRegenerateCodes={async () => {
          await wait(500)
          return ['N4QK-2WFA', 'B7ZD-9MHE', 'T3XR-5CJL', 'F6PV-8UGN', 'Y2LS-4DKT', 'M9HC-7RBW']
        }}
      />
    </div>
  ),
}

// ——— Sessions ———

const sessions: ActiveSession[] = [
  {
    id: 's1',
    name: 'Chrome on macOS',
    device: 'laptop',
    location: 'Paris, France',
    ip: '92.184.10.7',
    lastActiveAt: at(10, 14, 10),
    current: true,
  },
  {
    id: 's2',
    name: 'Safari on iPhone',
    device: 'phone',
    location: 'Paris, France',
    ip: '92.184.11.42',
    lastActiveAt: at(10, 14, 8, 20),
  },
  {
    id: 's3',
    name: 'Firefox on Windows',
    device: 'desktop',
    location: 'Lyon, France',
    ip: '176.31.4.90',
    lastActiveAt: at(10, 2, 17, 5),
  },
]

export const Sessions: Story = {
  render: () => {
    const [list, setList] = React.useState(sessions)
    return (
      <div className="mx-auto max-w-[720px] py-4">
        <ActiveSessions
          sessions={list}
          onRevoke={(id) => {
            setList((l) => l.filter((s) => s.id !== id))
          }}
          onRevokeOthers={() => {
            setList((l) => l.filter((s) => s.current))
          }}
        />
      </div>
    )
  },
}

export const SecurityFrench: Story = {
  name: 'Security · French',
  globals: { locale: 'fr' },
  render: () => (
    <div className="mx-auto flex max-w-[720px] flex-col gap-6 py-4">
      <TwoFactorSettings
        enabled={false}
        onSetupStart={() => ({ secret: 'JBSWY3DPEHPK3PXP' })}
        onSetupVerify={() => ({ recoveryCodes: [] })}
      />
      <ActiveSessions
        sessions={sessions.map((s) => ({
          ...s,
          name: s.name.replace(' on ', ' sur '),
        }))}
        onRevoke={() => undefined}
        onRevokeOthers={() => undefined}
      />
    </div>
  ),
}

// ——— Audit log ———

const actions: AuditAction[] = [
  { value: 'member.invited', label: 'invited' },
  { value: 'member.removed', label: 'removed' },
  { value: 'member.role_changed', label: 'changed the role of' },
  { value: 'api_key.created', label: 'created the API key' },
  { value: 'api_key.revoked', label: 'revoked the API key' },
  { value: 'project.deleted', label: 'deleted the project' },
  { value: 'sso.enabled', label: 'turned on SSO for' },
  { value: 'deployment.promoted', label: 'promoted to production' },
]

const auditEvents: AuditEvent[] = [
  {
    id: 'a1',
    actor: { name: 'Ada Lovelace', email: 'ada@coreloom.dev' },
    action: 'member.invited',
    target: 'linus@acme.dev',
    at: at(10, 14, 9, 40),
    ip: '92.184.10.7',
    location: 'Paris',
    metadata: { role: 'developer', invite_id: 'inv_82k' },
  },
  {
    id: 'a2',
    actor: { name: 'GitHub Actions', type: 'api' },
    action: 'deployment.promoted',
    target: 'coreloom-web',
    at: at(10, 14, 9, 12),
    ip: '140.82.112.4',
    metadata: { deployment: 'dpl_91c', commit: '3f9c2e1', key: 'cl_live_…a71e' },
  },
  {
    id: 'a3',
    actor: { name: 'Grace Hopper', email: 'grace@coreloom.dev' },
    action: 'api_key.revoked',
    target: 'Old CI key',
    at: at(10, 13, 17, 2),
    ip: '176.31.4.90',
  },
  {
    id: 'a4',
    actor: { name: 'Ada Lovelace', email: 'ada@coreloom.dev' },
    action: 'member.role_changed',
    target: 'Alan Turing',
    at: at(10, 13, 11, 25),
    ip: '92.184.10.7',
    metadata: { from: 'viewer', to: 'developer' },
  },
  {
    id: 'a5',
    actor: { name: 'Coreloom', type: 'system' },
    action: 'sso.enabled',
    target: 'acme.dev',
    at: at(10, 12, 8, 0),
  },
  {
    id: 'a6',
    actor: { name: 'Grace Hopper', email: 'grace@coreloom.dev' },
    action: 'project.deleted',
    target: 'legacy-landing',
    at: at(10, 12, 7, 31),
    ip: '176.31.4.90',
    metadata: { deployments: 128, domains: ['old.acme.dev'] },
  },
]

export const Audit: Story = {
  name: 'Audit log',
  render: () => {
    const [events, setEvents] = React.useState(auditEvents.slice(0, 5))
    const [loading, setLoading] = React.useState(false)
    return (
      <div className="mx-auto max-w-[860px] py-4">
        <AuditLog
          events={events}
          actions={actions}
          hasMore={events.length < auditEvents.length}
          loading={loading}
          onLoadMore={async () => {
            setLoading(true)
            await wait(600)
            setEvents(auditEvents)
            setLoading(false)
          }}
          onExport={(list) => toast(`Exported ${String(list.length)} events`)}
        />
      </div>
    )
  },
}

export const AuditEmpty: Story = {
  name: 'Audit log · empty',
  render: () => (
    <div className="mx-auto max-w-[860px] py-4">
      <AuditLog events={[]} actions={actions} />
    </div>
  ),
}

export const AuditFrench: Story = {
  name: 'Audit log · French',
  globals: { locale: 'fr' },
  render: () => (
    <div className="mx-auto max-w-[860px] py-4">
      <AuditLog
        events={auditEvents}
        actions={[
          { value: 'member.invited', label: 'a invité' },
          { value: 'member.removed', label: 'a retiré' },
          { value: 'member.role_changed', label: 'a changé le rôle de' },
          { value: 'api_key.created', label: 'a créé la clé d’API' },
          { value: 'api_key.revoked', label: 'a révoqué la clé d’API' },
          { value: 'project.deleted', label: 'a supprimé le projet' },
          { value: 'sso.enabled', label: 'a activé le SSO pour' },
          { value: 'deployment.promoted', label: 'a mis en production' },
        ]}
        onExport={() => undefined}
      />
    </div>
  ),
}
