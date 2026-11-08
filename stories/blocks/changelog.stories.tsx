import type { Meta, StoryObj } from '@storybook/react-vite'

import { Changelog } from '@/components/changelog'
import { toast } from '@/components/ui/sonner'

import { changelog } from './site-data'

const meta = {
  title: 'Blocks/Changelog',
  component: Changelog,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "A product's public changelog: one entry per release with its date, version, title, an image, and its changes tagged New, Improved, Fixed, Security or Deprecated. Chips filter by kind, older entries show on demand and each entry has an anchor. The consumer provides the `entries` (from a CMS, Markdown files, an API), and optionally a `feedUrl` and `onSubscribe`.",
      },
    },
  },
  args: {
    entries: changelog,
    title: 'Changelog',
    description: 'New components, improvements and fixes, every two weeks.',
    feedUrl: '/changelog.rss',
    onSubscribe: () => toast('Open your subscribe form here'),
  },
} satisfies Meta<typeof Changelog>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Only the fixes: the chips are controlled by `kinds` (or start from `defaultKinds`). */
export const FilteredToFixes: Story = { args: { defaultKinds: ['fixed'] } }

/** Two entries per page: "Show older updates" reveals the next ones and moves focus to them. */
export const Paged: Story = { args: { pageSize: 2 } }

/** Inside a page that already has its title. */
export const WithoutHeader: Story = {
  args: { title: undefined, description: undefined, feedUrl: undefined, onSubscribe: undefined },
}

export const Empty: Story = { args: { entries: [] } }

export const French: Story = { globals: { locale: 'fr' } }

export const Phone: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } }
