import type { Meta, StoryObj } from '@storybook/react-vite'
import { KanbanIcon, ListIcon, TableIcon } from 'lucide-react'
import * as React from 'react'

import { SegmentedControl } from '@/components/ui/segmented-control'

const periods = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
]

const meta = {
  title: 'Components/Forms/Segmented control',
  component: SegmentedControl,
  tags: ['autodocs'],
  args: { options: periods, defaultValue: 'week', 'aria-label': 'Period' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'default'] },
    fullWidth: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Two to five options in one pill, exactly one picked. The consumer provides `options`, `value` + `onValueChange` and a name (`aria-label` or `aria-labelledby`). Use ToggleGroup for formatting buttons and Tabs to switch panels.',
      },
    },
  },
} satisfies Meta<typeof SegmentedControl>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => {
    const [period, setPeriod] = React.useState('week')
    return (
      <div className="flex flex-col gap-3">
        <SegmentedControl {...args} value={period} onValueChange={setPeriod} />
        <p className="m-0 text-[13px] text-muted-foreground">Showing the last {period}.</p>
      </div>
    )
  },
}

export const Variants: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-4">
      <SegmentedControl
        aria-label="View"
        size="sm"
        iconOnly
        options={[
          { value: 'list', label: 'List', icon: <ListIcon /> },
          { value: 'board', label: 'Board', icon: <KanbanIcon /> },
          { value: 'table', label: 'Table', icon: <TableIcon /> },
        ]}
      />
      <SegmentedControl
        aria-label="Billing"
        fullWidth
        options={[
          { value: 'monthly', label: 'Monthly' },
          { value: 'yearly', label: 'Yearly · −20%' },
        ]}
      />
      <SegmentedControl
        aria-label="Period"
        options={[...periods.slice(0, 3), { value: 'year', label: 'Year', disabled: true }]}
      />
    </div>
  ),
}

export const French: Story = {
  globals: { locale: 'fr' },
  render: () => (
    <SegmentedControl
      aria-label="Période"
      options={[
        { value: 'j', label: 'Jour' },
        { value: 's', label: 'Semaine' },
        { value: 'm', label: 'Mois' },
      ]}
    />
  ),
}
