import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import {
  type EnvEnvironment,
  type EnvVariable,
  type EnvVariableInput,
  EnvVars,
} from '@/components/env-vars'
import type { DotenvEntry } from '@/lib/dotenv'

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

const environments: EnvEnvironment[] = [
  { id: 'production', name: 'Production' },
  { id: 'preview', name: 'Preview' },
  { id: 'development', name: 'Development' },
]

const initial: EnvVariable[] = [
  {
    key: 'DATABASE_URL',
    secret: true,
    values: {
      production: 'postgres://app:cl_db_live_8b2f@db.internal:5432/app',
      preview: 'postgres://app:cl_db_prev_19ce@db-preview.internal:5432/app',
      development: 'postgres://localhost:5432/app',
    },
  },
  {
    key: 'STRIPE_SECRET_KEY',
    secret: true,
    values: { production: 'cl_live_51Hx0000000000003f9a', preview: 'cl_test_51Hx000000000000c2d1' },
  },
  {
    key: 'NEXT_PUBLIC_API_URL',
    values: {
      production: 'https://api.coreloom.dev',
      preview: 'https://api.preview.coreloom.dev',
      development: 'http://localhost:3000',
    },
  },
  { key: 'LOG_LEVEL', values: { production: 'warn', preview: 'warn', development: 'warn' } },
  { key: 'FEATURE_NEW_CHECKOUT', values: { preview: 'true', development: 'true' } },
]

function apply(list: EnvVariable[], input: EnvVariableInput) {
  const existing = list.find((v) => v.key === input.key)
  const values = Object.fromEntries(input.environments.map((e) => [e, input.value]))
  if (!existing) return [...list, { key: input.key, secret: input.secret, values }]
  return list.map((v) =>
    v === existing ? { ...v, secret: input.secret, values: { ...v.values, ...values } } : v,
  )
}

function importEntries(list: EnvVariable[], environment: string, entries: DotenvEntry[]) {
  return entries.reduce(
    (acc, e) =>
      apply(acc, { key: e.key, value: e.value, secret: true, environments: [environment] }),
    list,
  )
}

const meta = {
  title: 'Blocks/Environment variables',
  component: EnvVars,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A project’s environment variables per environment. The consumer provides `environments`, `variables` (`{ key, values: { [environmentId]: value }, secret? }`) and the callbacks: `onSet({ key, value, secret, environments })`, `onDelete(key, environment)` and `onImport(environment, entries)` for a pasted `.env` (read with `parseDotenv` and previewed first). Compare lines environments up.',
      },
    },
  },
  args: { environments, variables: initial },
} satisfies Meta<typeof EnvVars>
export default meta
type Story = StoryObj<typeof meta>

/** Add, edit, delete and import: every change goes through a callback, here a short wait. */
export const Default: Story = {
  render: function Render(args) {
    const [variables, setVariables] = React.useState(initial)
    return (
      <div className="mx-auto max-w-[860px] py-4">
        <EnvVars
          {...args}
          variables={variables}
          onSet={async (input) => {
            await wait(400)
            setVariables((list) => apply(list, input))
          }}
          onDelete={async (key, environment) => {
            await wait(300)
            setVariables((list) =>
              list.map((v) =>
                v.key === key ? { ...v, values: { ...v.values, [environment]: undefined } } : v,
              ),
            )
          }}
          onImport={async (environment, entries) => {
            await wait(500)
            setVariables((list) => importEntries(list, environment, entries))
          }}
        />
      </div>
    )
  },
}

/** Compare: what is missing or different between environments. */
export const Compare: Story = { args: { defaultEnvironment: 'compare' } }

export const ReadOnly: Story = {}

export const Empty: Story = { args: { variables: [], onSet: () => undefined } }

export const Phone: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } }

export const French: Story = {
  globals: { locale: 'fr' },
  args: {
    environments: [
      { id: 'production', name: 'Production' },
      { id: 'preview', name: 'Préproduction' },
    ],
  },
}
