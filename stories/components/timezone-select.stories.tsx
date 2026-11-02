import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { TimezoneSelect } from '@/components/ui/timezone-select'

const meta = {
  title: 'Components/Forms/Timezone select',
  component: TimezoneSelect,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Searchable IANA time zones with their UTC offsets. The consumer provides `value` + `onValueChange` (an IANA name such as "Europe/Paris") and a label (`id` for a FieldLabel), and optionally `timeZones` (a subset) and `date` (the day offsets are worked out for).',
      },
    },
  },
} satisfies Meta<typeof TimezoneSelect>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [zone, setZone] = React.useState('Europe/Paris')
    return (
      <Field className="max-w-sm">
        <FieldLabel htmlFor="tz-zone">Time zone</FieldLabel>
        <TimezoneSelect id="tz-zone" value={zone} onValueChange={setZone} />
        <FieldDescription>Value: {zone || '—'}</FieldDescription>
      </Field>
    )
  },
}

export const Subset: Story = {
  render: () => (
    <Field className="max-w-sm">
      <FieldLabel htmlFor="tz-office">Office</FieldLabel>
      <TimezoneSelect
        id="tz-office"
        clearable
        date={new Date('2026-01-15T12:00:00Z')}
        timeZones={['America/New_York', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo']}
        defaultValue="Asia/Tokyo"
      />
    </Field>
  ),
}

export const French: Story = {
  globals: { locale: 'fr' },
  render: () => (
    <Field className="max-w-sm">
      <FieldLabel htmlFor="tz-fr">Fuseau horaire</FieldLabel>
      <TimezoneSelect id="tz-fr" />
    </Field>
  ),
}
