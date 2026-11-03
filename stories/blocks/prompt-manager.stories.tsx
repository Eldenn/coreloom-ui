import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { PromptManager, type PromptVersion } from '@/components/prompt-manager'
import { toast } from '@/components/ui/sonner'

const at = (month: number, date: number, hour = 9, minute = 0) =>
  new Date(2026, month - 1, date, hour, minute)
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

const v1 = `You are the support assistant for {{product}}.
Answer the customer's question.

Question: {{question}}`

const v2 = `You are the support assistant for {{product}}.
Answer the customer's question in a friendly tone.
If you don't know, say so.

Question: {{question}}`

const v3 = `You are the support assistant for {{product}}.
Answer the customer's question in a friendly tone, in {{language}}.
Keep it under 120 words and link the docs page you used.
If you don't know, say so and offer to open a ticket.

Question: {{question}}`

const versions: PromptVersion[] = [
  {
    id: 'p1',
    version: 1,
    text: v1,
    message: 'First version',
    author: 'Ada Lovelace',
    createdAt: at(9, 2),
  },
  {
    id: 'p2',
    version: 2,
    text: v2,
    message: 'Friendlier, admit when it doesn’t know',
    author: 'Grace Hopper',
    createdAt: at(9, 24),
    labels: ['production'],
  },
  {
    id: 'p3',
    version: 3,
    text: v3,
    message: 'Shorter answers in the customer’s language, with sources',
    author: 'Ada Lovelace',
    createdAt: at(10, 13, 16, 40),
    labels: ['staging'],
  },
]

/** A fake model that streams a canned answer, word by word. */
async function* fakeModel(filled: string, signal: AbortSignal) {
  const answer = `Thanks for asking! ${filled.includes('French') ? '(en français) ' : ''}You can roll back a deploy from the Deployments page: open the last good one and choose “Promote to production”. It takes about ten seconds. See docs.coreloom.dev/rollbacks.`
  for (const word of answer.split(' ')) {
    if (signal.aborted) return
    await wait(40)
    yield `${word} `
  }
}

const meta = {
  title: 'Blocks/AI/Prompt manager',
  component: PromptManager,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'One prompt and its versions. Edit the text (its `{{variables}}` are tinted and listed as you type), save the draft as a new version with a message, compare any two versions (unified or side by side), deploy a version to a label, and test it with values for its variables. `onSave`, `onDeploy` and `onTest` are yours; `onTest` gets the filled prompt and an AbortSignal, and returns text, a promise or a stream of chunks.',
      },
    },
  },
  args: {
    name: 'support-answer',
    versions,
    labels: ['production', 'staging'],
    defaultValues: {
      product: 'Coreloom',
      language: 'English',
      question: 'How do I roll back a deploy?',
    },
  },
  render: (args) => {
    const [list, setList] = React.useState(args.versions)
    return (
      <PromptManager
        {...args}
        versions={list}
        onSave={async ({ text, message }) => {
          await wait(500)
          const created: PromptVersion = {
            id: `p${String(list.length + 1)}`,
            version: list.length + 1,
            text,
            message: message || undefined,
            author: 'You',
            createdAt: at(10, 14, 10),
          }
          setList((l) => [...l, created])
          return created
        }}
        onDeploy={(id, label) => {
          setList((l) =>
            l.map((v) => ({
              ...v,
              labels: [
                ...(v.labels ?? []).filter((x) => x !== label),
                ...(v.id === id ? [label] : []),
              ],
            })),
          )
          toast.success(`Deployed to ${label}`)
        }}
        onTest={({ filled, signal }) => fakeModel(filled, signal)}
      />
    )
  },
} satisfies Meta<typeof PromptManager>
export default meta
type Story = StoryObj<typeof meta>

/** Edit the text, then Compare or Test it; Save makes v4. */
export const Default: Story = {}

/** An older version open: Deploy moves the label to it. */
export const OlderVersion: Story = { args: { defaultVersionId: 'p1' } }

export const Empty: Story = { args: { versions: [] } }

export const French: Story = {
  globals: { locale: 'fr' },
  args: {
    name: 'reponse-support',
    versions: versions.map((v) => ({
      ...v,
      message: {
        p1: 'Première version',
        p2: 'Plus chaleureux, admet quand il ne sait pas',
        p3: 'Réponses plus courtes dans la langue du client, avec sources',
      }[v.id],
    })),
  },
}
