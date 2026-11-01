import type { Meta, StoryObj } from '@storybook/react-vite'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FunnelChart } from '@/components/ui/funnel-chart'

const signup = [
  { key: 'visit', label: 'Visited the pricing page', value: 12_480 },
  { key: 'start', label: 'Started sign-up', value: 4_212 },
  { key: 'verify', label: 'Verified email', value: 3_390 },
  { key: 'project', label: 'Created a project', value: 2_105 },
  { key: 'paid', label: 'Upgraded to Pro', value: 486 },
]

const meta = {
  title: 'Components/Charts/Funnel chart',
  component: FunnelChart,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'How many make it through each step of a flow and where they drop: a bar per step sized against the first, its count and share of the start, and between steps the share that went on. An ordered list for screen readers.',
      },
    },
  },
  args: { steps: signup, 'aria-label': 'Sign-up funnel, October 2026' },
  argTypes: {
    color: {
      control: 'select',
      options: [
        'var(--chart-1)',
        'var(--chart-2)',
        'var(--chart-3)',
        'var(--chart-4)',
        'var(--chart-5)',
      ],
    },
    steps: { control: 'object' },
  },
  render: (args) => (
    <div className="max-w-lg">
      <FunnelChart {...args} />
    </div>
  ),
} satisfies Meta<typeof FunnelChart>
export default meta
type Story = StoryObj<typeof meta>

/** Five steps from visit to payment. */
export const Default: Story = {}

/** In a card, in another chart color. */
export const InCard: Story = {
  args: {
    steps: [
      { key: 'asked', label: 'Questions asked', value: 8_940 },
      { key: 'answered', label: 'Answered without a human', value: 6_210 },
      { key: 'resolved', label: 'Marked resolved', value: 4_877 },
    ],
    color: 'var(--chart-2)',
    'aria-label': 'Support assistant funnel',
  },
  render: (args) => (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>Support assistant</CardTitle>
        <CardDescription>Last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <FunnelChart {...args} />
      </CardContent>
    </Card>
  ),
}

/** A step nobody reached: 0 %, and the drop is total. */
export const DeadEnd: Story = {
  args: {
    steps: [
      { key: 'invited', label: 'Invited', value: 120 },
      { key: 'joined', label: 'Joined', value: 64 },
      { key: 'admin', label: 'Became admin', value: 0 },
    ],
    'aria-label': 'Team invitations',
  },
}

/** No steps. */
export const Empty: Story = { args: { steps: [] } }

/** French: rates, counts and the screen-reader text follow the locale. */
export const French: Story = {
  globals: { locale: 'fr' },
  args: {
    steps: [
      { key: 'visit', label: 'Page tarifs visitée', value: 12_480 },
      { key: 'start', label: 'Inscription commencée', value: 4_212 },
      { key: 'paid', label: 'Passage à Pro', value: 486 },
    ],
    'aria-label': 'Tunnel d’inscription',
  },
}

/** Narrow: long labels truncate, numbers keep their column. */
export const Narrow: Story = {
  render: (args) => (
    <div className="w-[300px]">
      <FunnelChart {...args} />
    </div>
  ),
}
