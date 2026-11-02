import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  type NumberRange,
  NumberRangeInput,
  type TimeRange,
  TimeRangePicker,
} from '@/components/ui/range-inputs'

const meta = {
  title: 'Components/Forms/Range inputs',
  component: NumberRangeInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '`NumberRangeInput` (`{ min, max }`) and `TimeRangePicker` (`{ start, end }` as "HH:mm"). The consumer provides `value` + `onValueChange` and a label (`id` goes on the first field). Either end may stay empty; an upside-down range is flagged, and `overnight` lets a time range end the next day.',
      },
    },
  },
} satisfies Meta<typeof NumberRangeInput>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [price, setPrice] = React.useState<NumberRange>({ min: 20, max: 80 })
    const [hours, setHours] = React.useState<TimeRange>({ start: '09:00', end: '18:00' })
    return (
      <FieldGroup className="max-w-md">
        <Field>
          <FieldLabel htmlFor="rg-price">Price</FieldLabel>
          <NumberRangeInput
            id="rg-price"
            value={price}
            onValueChange={setPrice}
            min={0}
            formatOptions={{ style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }}
          />
          <FieldDescription>
            {price.min ?? '…'} to {price.max ?? '…'}
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="rg-hours">Opening hours</FieldLabel>
          <TimeRangePicker id="rg-hours" value={hours} onValueChange={setHours} step={30} />
        </Field>
      </FieldGroup>
    )
  },
}

export const Problems: Story = {
  render: () => (
    <FieldGroup className="max-w-md">
      <Field>
        <FieldLabel htmlFor="rg-bad">Age</FieldLabel>
        <NumberRangeInput id="rg-bad" defaultValue={{ min: 65, max: 18 }} />
      </Field>
      <Field>
        <FieldLabel htmlFor="rg-night">Night shift</FieldLabel>
        <TimeRangePicker id="rg-night" overnight defaultValue={{ start: '22:00', end: '06:00' }} />
      </Field>
      <Field>
        <FieldLabel htmlFor="rg-wrong">Meeting</FieldLabel>
        <TimeRangePicker id="rg-wrong" defaultValue={{ start: '15:00', end: '14:00' }} />
      </Field>
    </FieldGroup>
  ),
}

export const French: Story = {
  globals: { locale: 'fr' },
  render: () => (
    <FieldGroup className="max-w-md">
      <Field>
        <FieldLabel htmlFor="rg-fr">Budget</FieldLabel>
        <NumberRangeInput id="rg-fr" defaultValue={{ min: 1500, max: null }} />
      </Field>
      <Field>
        <FieldLabel htmlFor="rg-fr-h">Horaires</FieldLabel>
        <TimeRangePicker id="rg-fr-h" defaultValue={{ start: '08:30', end: '17:30' }} />
      </Field>
    </FieldGroup>
  ),
}
