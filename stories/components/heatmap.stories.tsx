import type { Meta, StoryObj } from '@storybook/react-vite'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarHeatmap, Heatmap } from '@/components/ui/heatmap'

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const hours = Array.from({ length: 24 }, (_, h) => String(h).padStart(2, '0'))

// Deterministic: busy on weekday working hours, a lunch dip, quiet weekends.
const deploys = weekdays.flatMap((day, d) =>
  hours.map((hour, h) => {
    const work = d < 5 && h >= 9 && h <= 18 ? 6 + ((h * 7 + d * 3) % 9) : (h * d) % 3
    return { row: day, column: hour, value: h === 13 && d < 5 ? Math.round(work / 2) : work }
  }),
)

// A year to 31 October 2026, with a weekly rhythm and a busy autumn.
const contributions = Array.from({ length: 365 }, (_, i) => {
  const date = new Date(Date.UTC(2026, 9, 31) - (364 - i) * 86_400_000)
  const weekday = date.getUTCDay()
  const base = weekday === 0 || weekday === 6 ? (i % 5 === 0 ? 1 : 0) : (i * 7) % 6
  return { date: date.toISOString().slice(0, 10), value: base + (i > 300 ? 3 : 0) }
})

const meta = {
  title: 'Components/Charts/Heatmap',
  component: Heatmap,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Values on a grid of squares, darker for more: activity by weekday and hour, errors by service and day. `CalendarHeatmap` lays a year of days out in weeks. One tab stop; arrow keys move between cells, each named with its row, column and value.',
      },
    },
  },
  args: {
    data: deploys,
    columnLabelEvery: 3,
    cellSize: 20,
    'aria-label': 'Deploys by weekday and hour',
  },
  argTypes: {
    cellSize: { control: { type: 'number', min: 8, max: 40 } },
    columnLabelEvery: { control: { type: 'number', min: 1, max: 12 } },
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
    data: { control: 'object' },
  },
} satisfies Meta<typeof Heatmap>
export default meta
type Story = StoryObj<typeof meta>

/** Weekday × hour. Hover a cell or Tab in and use the arrows: the value shows under the grid. */
export const Default: Story = {}

/** Services × days, in another chart color, with a gap in the data. */
export const Matrix: Story = {
  args: {
    data: ['api-gateway', 'auth', 'billing', 'search'].flatMap((service, s) =>
      ['Oct 8', 'Oct 9', 'Oct 10', 'Oct 11', 'Oct 12', 'Oct 13', 'Oct 14'].map((day, d) => ({
        row: service,
        column: day,
        value: service === 'search' && d === 3 ? null : (s * 5 + d * 3) % 17,
      })),
    ),
    columnLabelEvery: 1,
    cellSize: 40,
    color: 'var(--chart-3)',
    'aria-label': 'Errors per service per day',
  },
}

/** A year of days: weeks as columns, Monday first. Scrolls to the latest weeks when narrow. */
export const Calendar: Story = {
  render: () => (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>Deploys</CardTitle>
        <CardDescription>November 2025 – October 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <CalendarHeatmap
          data={contributions}
          to="2026-10-31"
          formatValue={(n) => (n === 1 ? '1 deploy' : `${n} deploys`)}
          aria-label="Deploys per day, last year"
        />
      </CardContent>
    </Card>
  ),
}

/** The last 12 weeks only, bigger cells. */
export const CalendarQuarter: Story = {
  render: () => (
    <CalendarHeatmap
      data={contributions}
      to="2026-10-31"
      weeks={13}
      cellSize={16}
      color="var(--chart-2)"
      aria-label="Deploys per day, last 13 weeks"
    />
  ),
}

/** No data. */
export const Empty: Story = { args: { data: [] } }

/** French: weekdays, months, the full dates in cell names and the legend follow the locale. */
export const French: Story = {
  globals: { locale: 'fr' },
  render: () => (
    <CalendarHeatmap
      data={contributions}
      to="2026-10-31"
      weeks={13}
      cellSize={16}
      aria-label="Déploiements par jour"
    />
  ),
}
