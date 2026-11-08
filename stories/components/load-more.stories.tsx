import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { LoadMore, type LoadMoreStatus } from '@/components/ui/load-more'

const meta = {
  title: 'Components/Load more',
  component: LoadMore,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The end of a list or a feed that loads its next page. The consumer provides `status` (`idle`, `loading`, `error`, `done`) and `onLoadMore`, and optionally `auto` for infinite scroll, `loaded` and `total` for the count, `label` and `endText`. With TanStack Query: `status={loadMoreStatus(query)}` and `onLoadMore={() => query.fetchNextPage()}`.',
      },
    },
  },
  args: { status: 'idle', onLoadMore: () => undefined },
  argTypes: {
    status: { control: 'inline-radio', options: ['idle', 'loading', 'error', 'done'] },
    auto: { control: 'boolean' },
  },
} satisfies Meta<typeof LoadMore>
export default meta
type Story = StoryObj<typeof meta>

const TOTAL = 26
const PAGE = 8
const projects = Array.from({ length: TOTAL }, (_, i) => ({
  id: i + 1,
  name: `Project ${String(i + 1).padStart(2, '0')}`,
}))

/** A page of projects at a time, with a failure on the second page to show Try again. */
function useFakePages({ failOnce = false }: { failOnce?: boolean } = {}) {
  const [count, setCount] = React.useState(PAGE)
  const [status, setStatus] = React.useState<LoadMoreStatus>('idle')
  const failed = React.useRef(!failOnce)
  const loadMore = () => {
    setStatus('loading')
    setTimeout(() => {
      if (!failed.current && count >= PAGE * 2) {
        failed.current = true
        setStatus('error')
        return
      }
      const next = Math.min(TOTAL, count + PAGE)
      setCount(next)
      setStatus(next >= TOTAL ? 'done' : 'idle')
    }, 600)
  }
  return { items: projects.slice(0, count), status, loadMore }
}

function ProjectList({ items }: { items: typeof projects }) {
  return (
    <ul className="m-0 flex list-none flex-col divide-y divide-border-subtle rounded-lg border border-border bg-card p-0">
      {items.map((p) => (
        <li key={p.id} className="px-4 py-3 text-[13.5px] text-foreground">
          {p.name}
        </li>
      ))}
    </ul>
  )
}

/** A button under the list: each click loads 8 more, until the end. */
export const WithButton: Story = {
  render: function Render() {
    const pages = useFakePages()
    return (
      <div className="mx-auto max-w-md">
        <ProjectList items={pages.items} />
        <LoadMore
          status={pages.status}
          onLoadMore={pages.loadMore}
          loaded={pages.items.length}
          total={TOTAL}
        />
      </div>
    )
  },
}

/** `auto`: the next page loads as the end scrolls into view; the button stays for the keyboard. */
export const InfiniteScroll: Story = {
  render: function Render() {
    const pages = useFakePages()
    return (
      <div className="mx-auto h-80 max-w-md overflow-y-auto">
        <ProjectList items={pages.items} />
        <LoadMore auto status={pages.status} onLoadMore={pages.loadMore} />
      </div>
    )
  },
}

/** The second page fails once: the button turns into Try again. */
export const WithError: Story = {
  render: function Render() {
    const pages = useFakePages({ failOnce: true })
    return (
      <div className="mx-auto max-w-md">
        <ProjectList items={pages.items} />
        <LoadMore status={pages.status} onLoadMore={pages.loadMore} />
      </div>
    )
  },
}

/** Waiting for a page. Frozen here, so the tests don't wait for it to finish. */
export const Loading: Story = {
  args: { status: 'loading', loaded: 16, total: 26 },
  decorators: [
    (Story) => (
      <div data-frozen>
        <Story />
      </div>
    ),
  ],
}

export const Failed: Story = { args: { status: 'error' } }

export const End: Story = { args: { status: 'done' } }

export const French: Story = {
  globals: { locale: 'fr' },
  args: { status: 'idle', loaded: 8, total: 26 },
}
