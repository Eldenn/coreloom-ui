import type { Meta, StoryObj } from '@storybook/react-vite'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { GlobeIcon } from 'lucide-react'
import * as React from 'react'

import { Calendar } from '@/components/ui/calendar'
import { Combobox } from '@/components/ui/combobox'
import { DatePicker } from '@/components/ui/date-picker'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'

const regions = [
  'Paris (cdg1)',
  'Frankfurt (fra1)',
  'London (lhr1)',
  'Washington (iad1)',
  'San Francisco (sfo1)',
  'Tokyo (hnd1)',
].map((label) => ({
  value: label.slice(-5, -1),
  label,
  icon: <GlobeIcon className="size-4 text-muted-foreground" />,
}))

const meta = {
  title: 'Components/Forms/Pickers',
  component: Combobox,
  tags: ['autodocs'],
  args: {
    options: regions,
    defaultValue: 'cdg1',
    searchPlaceholder: 'Search regions…',
    'aria-label': 'Region',
  },
} satisfies Meta<typeof Combobox>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div className="max-w-xs">
      <Combobox {...args} />
    </div>
  ),
}

export const DatePickerStory: Story = {
  name: 'DatePicker',
  render: () => {
    const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 10, 3))
    return (
      <Field className="max-w-xs">
        <FieldLabel htmlFor="release">Release date</FieldLabel>
        <DatePicker id="release" value={date} onValueChange={setDate} />
        <FieldDescription>Shown on the changelog.</FieldDescription>
      </Field>
    )
  },
}

export const CalendarStory: Story = {
  name: 'Calendar',
  render: () => {
    const [range, setRange] = React.useState<{ from?: Date; to?: Date } | undefined>({
      from: new Date(2026, 9, 6),
      to: new Date(2026, 9, 10),
    })
    return (
      <div className="flex flex-wrap gap-6">
        <Calendar
          mode="single"
          defaultMonth={new Date(2026, 9, 1)}
          className="rounded-md border border-border"
        />
        <Calendar
          mode="range"
          labels={{ labelNav: () => 'Range calendar navigation' }}
          selected={range as never}
          onSelect={setRange}
          defaultMonth={new Date(2026, 9, 1)}
          className="rounded-md border border-border"
        />
      </div>
    )
  },
}

export const OneTimeCode: Story = {
  name: 'InputOTP',
  render: () => (
    <Field className="w-auto">
      <FieldLabel htmlFor="otp">Verification code</FieldLabel>
      <InputOTP id="otp" maxLength={6} pattern={REGEXP_ONLY_DIGITS}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
    </Field>
  ),
}
