import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { DateTimePicker, TimePicker } from '@/components/ui/time-picker'

const meta = {
  title: 'Components/Forms/Time picker',
  component: TimePicker,
  tags: ['autodocs'],
  args: { step: 30, 'aria-label': 'Time' },
  argTypes: { step: { control: 'number' }, disabled: { control: 'boolean' } },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A time of day, typed ("14:30", "2:30 pm", "14h30") or picked from a list every `step` minutes, shown in the reader’s clock. The consumer provides `value` + `onValueChange` with an "HH:mm" string (24-hour, like `<input type="time">`). `DateTimePicker` joins a day and a time into one `Date`.',
      },
    },
  },
} satisfies Meta<typeof TimePicker>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [time, setTime] = React.useState<string | undefined>('14:30')
    return (
      <Field className="max-w-[12rem]">
        <FieldLabel htmlFor="tp-start">Starts at</FieldLabel>
        <TimePicker id="tp-start" value={time} onValueChange={setTime} />
        <FieldDescription>Value: {time ?? 'empty'}</FieldDescription>
      </Field>
    )
  },
}

export const OpeningHours: Story = {
  name: 'Opening hours (a range in the list)',
  render: () => {
    const [opens, setOpens] = React.useState<string | undefined>('09:00')
    const [closes, setCloses] = React.useState<string | undefined>()
    return (
      <FieldGroup className="max-w-md flex-row gap-4">
        <Field>
          <FieldLabel htmlFor="tp-opens">Opens</FieldLabel>
          <TimePicker
            id="tp-opens"
            value={opens}
            onValueChange={setOpens}
            step={15}
            min="07:00"
            max="12:00"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="tp-closes">Closes</FieldLabel>
          <TimePicker
            id="tp-closes"
            value={closes}
            onValueChange={setCloses}
            step={15}
            min="12:00"
            max="22:00"
          />
        </Field>
      </FieldGroup>
    )
  },
}

export const DateAndTime: Story = {
  name: 'DateTimePicker',
  render: () => {
    const [when, setWhen] = React.useState<Date | undefined>(() => new Date(2026, 9, 14, 15, 0))
    return (
      <Field className="max-w-sm">
        <FieldLabel htmlFor="tp-when">Meeting</FieldLabel>
        <DateTimePicker id="tp-when" value={when} onValueChange={setWhen} step={15} />
        <FieldDescription>
          Value: {when ? `${when.toDateString()} ${when.toTimeString().slice(0, 5)}` : 'none'}
        </FieldDescription>
      </Field>
    )
  },
}

export const Disabled: Story = {
  render: () => (
    <Field className="max-w-[12rem]">
      <FieldLabel htmlFor="tp-off">Starts at</FieldLabel>
      <TimePicker id="tp-off" defaultValue="08:00" disabled />
    </Field>
  ),
}

export const French: Story = {
  globals: { locale: 'fr' },
  render: () => {
    const [time, setTime] = React.useState<string | undefined>('14:30')
    const [when, setWhen] = React.useState<Date | undefined>(() => new Date(2026, 9, 14, 9, 30))
    return (
      <FieldGroup className="max-w-sm">
        <Field>
          <FieldLabel htmlFor="tp-fr">Début</FieldLabel>
          <TimePicker id="tp-fr" value={time} onValueChange={setTime} />
          <FieldDescription>Valeur : {time ?? 'vide'}</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="tp-fr-when">Réunion</FieldLabel>
          <DateTimePicker id="tp-fr-when" value={when} onValueChange={setWhen} />
        </Field>
      </FieldGroup>
    )
  },
}
