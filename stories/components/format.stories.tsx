import type { Meta, StoryObj } from '@storybook/react-vite'

import { AnimatedNumber, FormatNumber } from '@/components/ui/format'

const meta = {
  title: 'Components/Data display/Format number',
  component: FormatNumber,
  tags: ['autodocs'],
  args: { value: 1234.5 },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A number written for the reader’s locale. The consumer provides the `value` and a `format`: `decimal`, `integer`, `percent` (0.12 → 12%), `currency` (with `currency`), `compact`, `bytes` (with `base` 1000 or 1024) or `unit` (with `unit`). Optional: fraction digits and `signDisplay`. `AnimatedNumber` takes the same props and counts up; `formatValue` is the function.',
      },
    },
  },
} satisfies Meta<typeof FormatNumber>
export default meta
type Story = StoryObj<typeof meta>

const rows: [string, React.ReactNode][] = [
  ['decimal', <FormatNumber key="d" value={1234567.891} />],
  ['integer', <FormatNumber key="i" value={48213.6} format="integer" />],
  ['percent', <FormatNumber key="p" value={0.1275} format="percent" />],
  ['change', <FormatNumber key="c" value={0.042} format="percent" signDisplay="exceptZero" />],
  ['currency', <FormatNumber key="e" value={1290.5} format="currency" currency="EUR" />],
  ['compact', <FormatNumber key="k" value={1_284_000} format="compact" />],
  ['bytes', <FormatNumber key="b" value={3_480_000_000} format="bytes" />],
  ['unit', <FormatNumber key="u" value={42} format="unit" unit="kilometer-per-hour" />],
]

export const Default: Story = {
  render: () => (
    <dl className="m-0 grid max-w-sm grid-cols-[auto_1fr] gap-x-8 gap-y-2 text-[14px]">
      {rows.map(([name, node]) => (
        <div key={name} className="contents">
          <dt className="font-mono text-[12.5px] text-muted-foreground">{name}</dt>
          <dd className="m-0 text-right text-foreground">{node}</dd>
        </div>
      ))}
    </dl>
  ),
}

export const Animated: Story = {
  render: () => (
    <div className="grid max-w-xl grid-cols-3 gap-4">
      {[
        {
          label: 'Revenue',
          node: (
            <AnimatedNumber
              value={48210}
              format="currency"
              currency="EUR"
              maximumFractionDigits={0}
            />
          ),
        },
        { label: 'Active users', node: <AnimatedNumber value={12840} format="compact" /> },
        { label: 'Conversion', node: <AnimatedNumber value={0.064} format="percent" /> },
      ].map((s) => (
        <div key={s.label} className="rounded-lg border border-border bg-surface p-4">
          <p className="m-0 text-[12.5px] text-muted-foreground">{s.label}</p>
          <p className="m-0 mt-1 text-[24px] font-semibold text-foreground">{s.node}</p>
        </div>
      ))}
    </div>
  ),
}
