import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import type { FeatureFlagAttribute, FeatureFlagState } from '@/components/feature-flag-rules'
import {
  type FeatureFlag,
  type FeatureFlagEnvironment,
  FeatureFlags,
} from '@/components/feature-flags'

const at = (month: number, date: number, hour = 9) => new Date(2026, month - 1, date, hour)
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

const environments: FeatureFlagEnvironment[] = [
  { id: 'production', name: 'Production' },
  { id: 'staging', name: 'Staging' },
]

const attributes: FeatureFlagAttribute[] = [
  { value: 'plan', label: 'Plan' },
  { value: 'country', label: 'Country' },
  { value: 'email', label: 'E-mail' },
  { value: 'workspace', label: 'Workspace' },
]

const initial: FeatureFlag[] = [
  {
    key: 'new-checkout',
    name: 'New checkout',
    description: 'One-page checkout with saved cards.',
    tags: ['billing', 'experiment'],
    environments: {
      production: {
        enabled: true,
        rollout: 25,
        rules: [
          {
            id: 'r1',
            attribute: 'email',
            operator: 'contains',
            values: ['@coreloom.dev'],
            serve: true,
          },
          { id: 'r2', attribute: 'country', operator: 'in', values: ['DE', 'AT'], serve: false },
        ],
      },
      staging: { enabled: true, rollout: 100, rules: [] },
    },
    history: [
      {
        id: 'h3',
        at: at(10, 13, 16),
        author: 'Grace Hopper',
        environment: 'production',
        text: 'Rollout 10% → 25%',
      },
      {
        id: 'h2',
        at: at(10, 9, 11),
        author: 'Grace Hopper',
        environment: 'production',
        text: 'Added a rule: Country is one of DE, AT → Off',
      },
      { id: 'h1', at: at(10, 2), author: 'Ada Lovelace', text: 'Created the flag' },
    ],
  },
  {
    key: 'ai-summaries',
    name: 'AI summaries',
    description: 'Summaries at the top of long threads.',
    tags: ['ai'],
    environments: {
      production: {
        enabled: true,
        rollout: 0,
        rules: [
          { id: 'r1', attribute: 'plan', operator: 'in', values: ['pro', 'team'], serve: true },
        ],
      },
      staging: { enabled: true, rollout: 100, rules: [] },
    },
  },
  {
    key: 'dark-mode-v2',
    name: 'Dark mode v2',
    tags: ['design'],
    environments: {
      production: { enabled: false, rollout: 0, rules: [] },
      staging: { enabled: true, rollout: 50, rules: [] },
    },
  },
  {
    key: 'legacy-export',
    name: 'Legacy CSV export',
    description: 'Kill switch for the old exporter.',
    environments: { production: { enabled: true, rollout: 100, rules: [] } },
  },
]

function setState(flags: FeatureFlag[], key: string, environment: string, state: FeatureFlagState) {
  return flags.map((f) =>
    f.key === key ? { ...f, environments: { ...f.environments, [environment]: state } } : f,
  )
}

const meta = {
  title: 'Blocks/Feature flags',
  component: FeatureFlags,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Feature flags per environment. The consumer provides `flags` (`{ key, name, description?, tags?, environments: { [id]: { enabled, rollout, rules } }, history? }`), `environments`, the `attributes` rules can target, `onChange(key, environment, state)` and `onCreate`. The switch saves at once; the panel edits rollout and rules and saves on Save. `evaluateFeatureFlag` is the logic your server applies.',
      },
    },
  },
  args: { flags: initial, environments, attributes },
} satisfies Meta<typeof FeatureFlags>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: function Render(args) {
    const [flags, setFlags] = React.useState(initial)
    return (
      <div className="mx-auto max-w-[860px] py-4">
        <FeatureFlags
          {...args}
          flags={flags}
          onChange={async (key, environment, state) => {
            await wait(400)
            setFlags((list) => setState(list, key, environment, state))
          }}
          onCreate={async (input) => {
            await wait(400)
            setFlags((list) => [
              ...list,
              {
                key: input.key,
                name: input.name,
                description: input.description || undefined,
                environments: {},
              },
            ])
          }}
        />
      </div>
    )
  },
}

export const Staging: Story = { args: { defaultEnvironment: 'staging' } }

export const ReadOnly: Story = {}

export const Empty: Story = { args: { flags: [], onCreate: () => undefined } }

export const Phone: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } }

export const French: Story = {
  globals: { locale: 'fr' },
  args: {
    environments: [
      { id: 'production', name: 'Production' },
      { id: 'staging', name: 'Préproduction' },
    ],
    onChange: () => undefined,
  },
}
