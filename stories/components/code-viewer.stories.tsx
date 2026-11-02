import type { Meta, StoryObj } from '@storybook/react-vite'

import { CodeViewer } from '@/components/ui/code-viewer'

const hook = `import * as React from 'react'

/** The value, once it has stopped changing for \`delay\` ms. */
export function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = React.useState(value)
  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}
`

const log = `2026-10-14T08:02:11Z INFO  server listening on :8080
2026-10-14T08:02:15Z INFO  GET /health 200 2ms
2026-10-14T08:03:40Z WARN  slow query: SELECT * FROM events WHERE workspace_id = $1 ORDER BY created_at DESC (1 840 ms)
2026-10-14T08:03:41Z ERROR POST /api/export 500: timeout waiting for the export worker
2026-10-14T08:03:52Z INFO  GET /health 200 1ms`

const meta = {
  title: 'Components/Data display/Code viewer',
  component: CodeViewer,
  tags: ['autodocs'],
  args: { code: hook, title: 'use-debounced.ts' },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Code to read with line numbers. The consumer provides `code`, a `title` or `language`, and optionally `highlight` ("3, 7-9"), `startLine`, `wrap`, `maxHeight` and `renderLine` to colour each line with a highlighter.',
      },
    },
  },
} satisfies Meta<typeof CodeViewer>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <CodeViewer className="max-w-2xl" code={hook} title="use-debounced.ts" highlight="5-8" />
  ),
}

export const Log: Story = {
  render: () => (
    <div className="flex max-w-2xl flex-col gap-6">
      <CodeViewer code={log} language="server.log" startLine={1201} highlight={[1204]} />
      <CodeViewer
        code={log}
        language="server.log (wrapped)"
        startLine={1201}
        highlight={[1204]}
        defaultWrap
      />
    </div>
  ),
}
