import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { MonthPicker } from '@/components/ui/month-picker'
import { WeekPicker } from '@/components/ui/week-picker'

const meta = {
  title: 'Components/Forms/Month and week pickers',
  component: MonthPicker,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '`MonthPicker`: a month as "YYYY-MM" from a twelve-month grid, with `min` and `max`. `WeekPicker`: an ISO week as "YYYY-Www", picked by clicking any day of it. The consumer provides `value` + `onValueChange` and a label (`id` for a FieldLabel).',
      },
    },
  },
} satisfies Meta<typeof MonthPicker>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [month, setMonth] = React.useState('2026-10')
    const [week, setWeek] = React.useState('2026-W44')
    return (
      <FieldGroup className="max-w-sm">
        <Field>
          <FieldLabel htmlFor="mp-month">Billing period</FieldLabel>
          <MonthPicker
            id="mp-month"
            value={month}
            onValueChange={setMonth}
            min="2025-01"
            max="2026-12"
          />
          <FieldDescription>Value: {month || '—'}</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="mp-week">Timesheet week</FieldLabel>
          <WeekPicker id="mp-week" value={week} onValueChange={setWeek} />
          <FieldDescription>Value: {week || '—'}</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="mp-empty">Card expiry</FieldLabel>
          <MonthPicker id="mp-empty" />
        </Field>
      </FieldGroup>
    )
  },
}

export const MonthOpen: Story = {
  name: 'Month grid open',
  render: () => (
    <Field className="max-w-sm">
      <FieldLabel htmlFor="mp-open">Report month</FieldLabel>
      <MonthPicker id="mp-open" defaultValue="2026-03" min="2026-02" />
    </Field>
  ),
  play: ({ canvasElement }) => {
    canvasElement.querySelector<HTMLButtonElement>('#mp-open')?.click()
  },
}

export const French: Story = {
  globals: { locale: 'fr' },
  render: () => (
    <FieldGroup className="max-w-sm">
      <Field>
        <FieldLabel htmlFor="mp-fr-m">Mois</FieldLabel>
        <MonthPicker id="mp-fr-m" defaultValue="2026-08" />
      </Field>
      <Field>
        <FieldLabel htmlFor="mp-fr-w">Semaine</FieldLabel>
        <WeekPicker id="mp-fr-w" defaultValue="2026-W01" />
      </Field>
    </FieldGroup>
  ),
}
