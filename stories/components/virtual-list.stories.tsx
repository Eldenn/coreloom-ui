import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { Badge, BadgeDot } from "@/components/ui/badge"
import { VirtualList } from "@/components/ui/virtual-list"

type LogLine = { id: number; level: "info" | "warn" | "error"; message: string; at: string }
const messages = [
  "Installing dependencies",
  "Resolved 1,284 packages in 2.1s",
  "Peer dependency react@19 satisfied",
  "Compiling 312 modules",
  "Type error in src/routes/settings.tsx: property 'slug' does not exist on type 'Workspace'. Did you mean 'name'? Fix the type or the property, then push again.",
  "Uploading build output (14.2 MB)",
  "Cache hit for node_modules",
]
const levels = ["info", "info", "info", "warn", "error", "info", "info"] as const
// Deterministic, so screenshots stay the same.
const logLine = (i: number): LogLine => ({
  id: i,
  level: levels[i % levels.length],
  message: messages[i % messages.length],
  at: `10:${String(Math.floor(i / 60) % 60).padStart(2, "0")}:${String(i % 60).padStart(2, "0")}`,
})
const variant = { info: "secondary", warn: "warning", error: "destructive" } as const

function Row({ line }: { line: LogLine }) {
  return (
    <div className="flex items-start gap-3 border-b border-border-subtle px-4 py-2.5 text-[13px]">
      <span className="shrink-0 font-mono text-[12px] text-muted-foreground">{line.at}</span>
      <Badge variant={variant[line.level]} className="shrink-0">
        <BadgeDot />
        {line.level}
      </Badge>
      <span className="min-w-0 text-foreground">{line.message}</span>
    </div>
  )
}

const meta = {
  title: "Components/Virtual list",
  component: VirtualList,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A long list where only the visible items are in the page (TanStack Virtual). Items can differ in height — they're measured as they render. With `onEndReached`, `hasMore` and `loadingMore` it loads the next page as the reader nears the end: plug in `useInfiniteQuery`.",
      },
    },
  },
} satisfies Meta<typeof VirtualList>
export default meta
type Story = StoryObj<typeof meta>

const lines = Array.from({ length: 10_000 }, (_, i) => logLine(i))

/** 10,000 log lines of different heights. The box is a keyboard-reachable region: Tab to it, then arrows or Page Down. */
export const TenThousandItems: Story = {
  args: {} as never,
  render: () => (
    <VirtualList
      aria-label="Build log"
      items={lines}
      getKey={(line) => line.id}
      estimateSize={42}
      height={420}
      renderItem={(line) => <Row line={line} />}
    />
  ),
}

/** Loads 50 more as you near the end, up to 300 — as `useInfiniteQuery` would. */
export const InfiniteLoading: Story = {
  args: {} as never,
  render: () => {
    const [items, setItems] = React.useState(() => Array.from({ length: 50 }, (_, i) => logLine(i)))
    const [loading, setLoading] = React.useState(false)
    const hasMore = items.length < 300
    return (
      <VirtualList
        aria-label="Build log"
        items={items}
        getKey={(line) => line.id}
        estimateSize={42}
        height={420}
        hasMore={hasMore}
        loadingMore={loading}
        onEndReached={() => {
          setLoading(true)
          setTimeout(() => {
            setItems((current) => [...current, ...Array.from({ length: 50 }, (_, i) => logLine(current.length + i))])
            setLoading(false)
          }, 600)
        }}
        renderItem={(line) => <Row line={line} />}
      />
    )
  },
}

export const Empty: Story = {
  args: {} as never,
  render: () => <VirtualList aria-label="Build log" items={[] as LogLine[]} getKey={(l) => l.id} height={200} empty="No log lines yet." renderItem={(line) => <Row line={line} />} />,
}
