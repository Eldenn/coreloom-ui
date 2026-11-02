import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { type Recurrence, RecurrenceInput, toRRule } from '@/components/ui/recurrence-input'

const meta = {
  title: 'Components/Forms/Recurrence input',
  component: RecurrenceInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'How often something repeats. The consumer provides `value` + `onValueChange` (`{ frequency, interval, weekdays?, monthDay?, end }`) and a label (`id` goes on the interval). A sentence reads the rule back; `toRRule` / `parseRRule` convert to and from iCalendar.',
      },
    },
  },
} satisfies Meta<typeof RecurrenceInput>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [rule, setRule] = React.useState<Recurrence>({
      frequency: 'week',
      interval: 2,
      weekdays: [1, 3],
      end: { type: 'after', count: 10 },
    })
    return (
      <Field className="max-w-lg">
        <FieldLabel htmlFor="rec-sync">Team sync</FieldLabel>
        <RecurrenceInput id="rec-sync" value={rule} onValueChange={setRule} />
        <FieldDescription>
          RRULE: <code className="font-mono">{toRRule(rule)}</code>
        </FieldDescription>
      </Field>
    )
  },
}

export const Monthly: Story = {
  render: () => (
    <Field className="max-w-lg">
      <FieldLabel htmlFor="rec-invoice">Invoice</FieldLabel>
      <RecurrenceInput
        id="rec-invoice"
        frequencies={['month', 'year']}
        defaultValue={{
          frequency: 'month',
          interval: 1,
          monthDay: 1,
          end: { type: 'on', date: '2026-12-31' },
        }}
      />
    </Field>
  ),
}

export const French: Story = {
  globals: { locale: 'fr' },
  render: () => (
    <Field className="max-w-lg">
      <FieldLabel htmlFor="rec-fr">Réunion d’équipe</FieldLabel>
      <RecurrenceInput
        id="rec-fr"
        defaultValue={{ frequency: 'week', interval: 2, weekdays: [2, 4], end: { type: 'never' } }}
      />
    </Field>
  ),
}
