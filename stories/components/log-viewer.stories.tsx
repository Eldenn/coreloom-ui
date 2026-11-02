import type { Meta, StoryObj } from '@storybook/react-vite'

import { LogViewer } from '@/components/ui/log-viewer'

import { buildLog, serverLog } from '../blocks/terminal-data'

const entries = serverLog()

const meta = {
  title: 'Components/Developer/Log viewer',
  component: LogViewer,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A long log, virtualized: search, level filters, wrap, follow the end, copy. The consumer passes `entries` (`{ time, level, source, message }`) or raw `text` (levels and ISO timestamps are detected), and optionally `height`, `defaultLevels`, `defaultQuery`, `timeZone`, `follow` and `actions`.',
      },
    },
  },
  args: { entries, timeZone: 'UTC', className: 'max-w-4xl' },
} satisfies Meta<typeof LogViewer>
export default meta
type Story = StoryObj<typeof meta>

/** 240 lines from a server; only the visible ones are in the page. Starts at the end. */
export const Default: Story = {}

/** Raw build output: colours kept, errors and warnings found from their words. */
export const FromText: Story = {
  args: { entries: undefined, text: buildLog, height: 300 },
}

/** Searching filters the lines and marks the words. */
export const Searching: Story = {
  args: { defaultQuery: 'export', height: 220 },
}

/** Errors and warnings only. */
export const ErrorsAndWarnings: Story = {
  args: { defaultLevels: ['error', 'warn'], height: 260 },
}

export const Empty: Story = {
  args: { entries: [], height: 160 },
}

export const French: Story = {
  args: { height: 260 },
  globals: { locale: 'fr' },
}
