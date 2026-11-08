import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import {
  CodeReview,
  type ReviewCommentInput,
  type ReviewFile,
  type ReviewThread,
} from '@/components/code-review'
import { toast } from '@/components/ui/sonner'

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })

const ME = { name: 'Camille Martin' }
const NOW = new Date('2026-10-14T10:00:00+02:00')
const MINUTES_AGO = (n: number) => new Date(NOW.getTime() - n * 60_000)

// A small pull request: a formatter moves to Intl, a component is added, an old helper goes and a
// doc is renamed. The app loads these from its code host; they stand in for them.
const FILES: ReviewFile[] = [
  {
    path: 'src/lib/format.ts',
    status: 'modified',
    before: [
      "import { currencySymbol } from '../legacy/currency'",
      '',
      'export function formatPrice(cents: number, currency: string) {',
      '  const amount = (cents / 100).toFixed(2)',
      '  return `${currencySymbol(currency)}${amount}`',
      '}',
      '',
      'export function formatCount(n: number) {',
      '  return String(n)',
      '}',
    ].join('\n'),
    after: [
      'export function formatPrice(cents: number, currency: string, locale = "en") {',
      '  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(cents / 100)',
      '}',
      '',
      'export function formatCount(n: number) {',
      '  return String(n)',
      '}',
    ].join('\n'),
  },
  {
    path: 'src/components/price-tag.tsx',
    status: 'added',
    before: '',
    after: [
      "import { formatPrice } from '@/lib/format'",
      '',
      'export function PriceTag({ cents, currency }: { cents: number; currency: string }) {',
      '  return <span className="tabular-nums">{formatPrice(cents, currency)}</span>',
      '}',
    ].join('\n'),
  },
  {
    path: 'src/legacy/currency.ts',
    status: 'deleted',
    before: [
      'const SYMBOLS: Record<string, string> = { EUR: "€", USD: "$", GBP: "£" }',
      '',
      'export const currencySymbol = (code: string) => SYMBOLS[code] ?? code',
    ].join('\n'),
    after: '',
  },
  {
    path: 'docs/pricing.md',
    oldPath: 'docs/prices.md',
    status: 'renamed',
    before: '# Prices\n\nPrices are shown with a symbol before the amount.',
    after: '# Pricing\n\nPrices follow the reader’s locale: 12,50 € in French, €12.50 in English.',
  },
]

const THREADS: ReviewThread[] = [
  {
    id: 't1',
    path: 'src/lib/format.ts',
    line: 2,
    side: 'new',
    comments: [
      {
        id: 'c1',
        author: { name: 'Noah Laurent' },
        body: 'Could we keep one formatter per locale? Building it on every call shows up in long tables.',
        createdAt: MINUTES_AGO(42),
      },
      {
        id: 'c2',
        author: ME,
        body: 'Good point, I will cache them in a Map keyed by locale and currency.',
        createdAt: MINUTES_AGO(30),
      },
    ],
  },
  {
    id: 't2',
    path: 'src/lib/format.ts',
    line: 1,
    side: 'old',
    resolved: true,
    comments: [
      {
        id: 'c3',
        author: { name: 'Inès Moreau' },
        body: 'Is anything else still importing the legacy helper?',
        createdAt: MINUTES_AGO(55),
      },
      {
        id: 'c4',
        author: ME,
        body: 'No, this was the last one: the file goes in this change.',
        createdAt: MINUTES_AGO(50),
      },
    ],
  },
]

/** The block with the app's state faked: comments and replies are kept, resolving toggles. */
function Demo({
  files = FILES,
  threads: initialThreads = THREADS,
  ...props
}: Partial<React.ComponentProps<typeof CodeReview>>) {
  const [threads, setThreads] = React.useState(initialThreads)
  const ids = React.useRef(0)
  const nextId = (prefix: string) => `${prefix}-${String(++ids.current)}`
  const comment = (body: string) => ({ id: nextId('c'), author: ME, body, createdAt: NOW })
  return (
    <CodeReview
      files={files}
      threads={threads}
      currentUser={ME}
      now={NOW}
      onComment={(input: ReviewCommentInput) => {
        const { body, ...anchor } = input
        const added = { id: nextId('t'), ...anchor, comments: [comment(body)] }
        setThreads((list) => [...list, added])
      }}
      onReply={(threadId, body) => {
        const reply = comment(body)
        setThreads((list) =>
          list.map((t) => (t.id === threadId ? { ...t, comments: [...t.comments, reply] } : t)),
        )
      }}
      onResolve={(threadId, resolved) => {
        setThreads((list) => list.map((t) => (t.id === threadId ? { ...t, resolved } : t)))
      }}
      onSubmitReview={async (review) => {
        await wait(600)
        toast.success(`Review sent: ${review.verdict}`)
      }}
      {...props}
    />
  )
}

const meta = {
  title: 'Blocks/Developer/Code review',
  component: CodeReview,
  tags: ['autodocs'],
  args: { files: FILES, threads: THREADS, currentUser: ME, now: NOW },
  argTypes: {
    defaultLayout: { control: 'inline-radio', options: ['unified', 'split'] },
    wrap: { control: 'boolean' },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A pull request to review: the changed files in a tree, each diff with a comment button on every line, the threads under their lines, "Viewed" per file and "Finish review". The consumer passes `files` and `threads` and keeps them up to date from `onComment`, `onReply` and `onResolve`; `onSubmitReview` sends the verdict and the summary.',
      },
    },
  },
  render: (args) => <Demo {...args} />,
} satisfies Meta<typeof CodeReview>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { threads: [] },
}

/** One open thread, one resolved (folded until shown), and a file already viewed. */
export const WithThreads: Story = {
  args: { defaultViewed: ['docs/pricing.md'] },
}

/** Nothing changed. */
export const Empty: Story = {
  args: { files: [], threads: [] },
}

/** Deep paths and lines longer than the panel: paths wrap, lines scroll sideways. */
export const LongContent: Story = {
  args: {
    threads: [],
    files: [
      {
        path: 'packages/checkout/src/features/payment-methods/components/saved-card-selector/saved-card-selector.test.tsx',
        status: 'modified',
        before: `expect(screen.getByRole('radio', { name: 'Visa ending in 4242, expires 12/28' })).toBeChecked()`,
        after: `expect(screen.getByRole('radio', { name: 'Visa ending in 4242, expires 12/28, default card for this account' })).toBeChecked()`,
      },
      ...FILES.slice(0, 1),
    ],
  },
}

export const Split: Story = {
  args: { defaultLayout: 'split' },
}

export const French: Story = {
  globals: { locale: 'fr' },
}

export const Phone: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}
