import type { Meta, StoryObj } from '@storybook/react-vite'

import { RelativeTime } from '@/components/ui/relative-time'

// The screenshots freeze the clock at this moment; the stories count from it too.
const NOW = new Date('2026-10-14T10:00:00+02:00')
const offset = (minutes: number) => new Date(NOW.getTime() + minutes * 60_000)

const rows: [string, number][] = [
  ['Just now', -0.2],
  ['Minutes', -5],
  ['Hours', -60 * 3],
  ['Yesterday', -60 * 24],
  ['Weeks', -60 * 24 * 15],
  ['Months', -60 * 24 * 70],
  ['Future', 60 * 24 * 3],
]

const meta = {
  title: 'Components/Data display/Relative time',
  component: RelativeTime,
  tags: ['autodocs'],
  args: { date: offset(-5), now: NOW },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A date said the way people say it, kept up to date. The consumer provides `date` (a Date, an ISO string or a timestamp); `now` freezes the wording, `style` shortens it.',
      },
    },
  },
} satisfies Meta<typeof RelativeTime>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <dl className="m-0 grid max-w-md grid-cols-[auto_1fr_auto] gap-x-6 gap-y-2 text-[14px]">
      {rows.map(([label, minutes]) => (
        <div key={label} className="contents">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="m-0 text-foreground">
            <RelativeTime date={offset(minutes)} now={NOW} />
          </dd>
          <dd className="m-0 font-mono text-[12px] text-muted-foreground">
            <RelativeTime date={offset(minutes)} now={NOW} style="narrow" />
          </dd>
        </div>
      ))}
    </dl>
  ),
}
