import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { type DocumentVersion, VersionHistory } from '@/components/version-history'

const at = (date: number, hour: number, minute = 0) => new Date(2026, 9, date, hour, minute)

const v1 = `# Pricing

Coreloom has two plans.

- Free: 3 projects
- Pro: unlimited projects, $12 per seat`

const v2 = `# Pricing

Coreloom has three plans.

- Free: 3 projects
- Pro: unlimited projects, $12 per seat
- Team: SSO and audit log, $24 per seat`

const v3 = `# Pricing

Coreloom has three plans, billed monthly or yearly.

- Free: 3 projects
- Pro: unlimited projects, $12 per seat
- Team: SSO and audit log, $24 per seat

Yearly billing saves two months.`

const v4 = `# Pricing

Coreloom has three plans, billed monthly or yearly.

- Free: 3 projects and 1 GB of storage
- Pro: unlimited projects, $12 per seat
- Team: SSO and audit log, $24 per seat

Yearly billing saves two months.`

const initial: DocumentVersion[] = [
  {
    id: 'v4',
    createdAt: at(14, 10, 12),
    author: 'Grace Hopper',
    summary: 'Storage on the free plan',
    content: v4,
  },
  {
    id: 'v3',
    createdAt: at(13, 17, 40),
    author: 'Ada Lovelace',
    name: 'Sent to legal',
    summary: 'Yearly billing',
    content: v3,
  },
  { id: 'v2', createdAt: at(13, 9, 5), author: 'Ada Lovelace', summary: 'Team plan', content: v2 },
  { id: 'v1', createdAt: at(10, 15, 30), author: 'Alan Turing', name: 'First draft', content: v1 },
]

const meta = {
  title: 'Blocks/Version history',
  component: VersionHistory,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The saved versions of a document by day. The consumer provides `versions` (`{ id, createdAt, name?, author?, summary?, content? }`), and optionally `currentId`, `onRestore(id)`, `onRename(id, name)` and `renderPreview(version)` for what isn’t text. With `content`, a version is compared with the one before it, or the current one.',
      },
    },
  },
  args: { versions: initial },
} satisfies Meta<typeof VersionHistory>
export default meta
type Story = StoryObj<typeof meta>

/** Restore saves the old text as a new current version; names are editable. */
export const Default: Story = {
  render: function Render(args) {
    const [versions, setVersions] = React.useState(initial)
    return (
      <VersionHistory
        {...args}
        versions={versions}
        defaultSelectedId="v3"
        onRename={(id, name) => {
          setVersions((list) =>
            list.map((v) => (v.id === id ? { ...v, name: name || undefined } : v)),
          )
        }}
        onRestore={(id) => {
          setVersions((list) => {
            const old = list.find((v) => v.id === id)
            return [
              {
                id: `v${String(list.length + 1)}`,
                createdAt: at(14, 11),
                author: 'You',
                summary: `Restored ${old?.name ?? 'an older version'}`,
                content: old?.content,
              },
              ...list,
            ]
          })
        }}
      />
    )
  },
}

/** Compared with the current version instead of the previous one. */
export const AgainstCurrent: Story = {
  args: { defaultSelectedId: 'v1', defaultCompare: 'current' },
}

/** `renderPreview` for versions that aren’t text (a diagram, a rendered page). */
export const CustomPreview: Story = {
  args: {
    versions: initial.map(({ content: _content, ...v }) => v),
    defaultCompare: 'none',
    renderPreview: (v) => (
      <div className="flex h-48 items-center justify-center rounded-md border border-dashed border-border text-[13px] text-muted-foreground">
        Diagram as of {v.createdAt.toLocaleDateString('en', { day: 'numeric', month: 'short' })}
      </div>
    ),
  },
}

export const Empty: Story = { args: { versions: [] } }

export const Phone: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } }

export const French: Story = { globals: { locale: 'fr' }, args: { defaultSelectedId: 'v3' } }
