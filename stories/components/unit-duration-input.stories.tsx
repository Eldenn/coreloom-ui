import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { DurationInput } from '@/components/ui/duration-input'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { UnitInput, type UnitValue } from '@/components/ui/unit-input'

const toPx: Record<string, number> = { px: 1, rem: 16, em: 16 }

const meta = {
  title: 'Components/Forms/Unit and duration inputs',
  component: UnitInput,
  tags: ['autodocs'],
  args: { units: [{ value: 'px' }, { value: 'rem' }] },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '`UnitInput`: a number with its unit, the value is `{ value, unit }`; pass `convert` to turn the number into the new unit. `DurationInput`: a duration typed as "1h30", "90" or "1:30", the value is minutes. The consumer provides `value` + `onValueChange` and a label (`id` for a FieldLabel).',
      },
    },
  },
} satisfies Meta<typeof UnitInput>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [size, setSize] = React.useState<UnitValue>({ value: 16, unit: 'px' })
    const [weight, setWeight] = React.useState<UnitValue>({ value: 72, unit: 'kg' })
    const [minutes, setMinutes] = React.useState<number | null>(90)
    return (
      <FieldGroup className="max-w-sm">
        <Field>
          <FieldLabel htmlFor="ui-size">Font size</FieldLabel>
          <UnitInput
            id="ui-size"
            units={[{ value: 'px' }, { value: 'rem' }, { value: 'em' }]}
            value={size}
            onValueChange={setSize}
            convert={(n, from, to) => (n * (toPx[from] ?? 1)) / (toPx[to] ?? 1)}
            formatOptions={{ maximumFractionDigits: 3 }}
          />
          <FieldDescription>Switching the unit converts the size.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="ui-weight">Weight</FieldLabel>
          <UnitInput
            id="ui-weight"
            units={[{ value: 'kg' }, { value: 'lb' }]}
            value={weight}
            onValueChange={setWeight}
            stepper="end"
            min={0}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="ui-duration">Meeting length</FieldLabel>
          <DurationInput id="ui-duration" value={minutes} onValueChange={setMinutes} max={600} />
          <FieldDescription>
            {minutes === null ? 'No duration' : `${String(minutes)} minutes`} · type 1h30, 90 or
            1:30; arrows add 15 minutes.
          </FieldDescription>
        </Field>
      </FieldGroup>
    )
  },
}

export const French: Story = {
  globals: { locale: 'fr' },
  render: () => (
    <FieldGroup className="max-w-sm">
      <Field>
        <FieldLabel htmlFor="ui-fr-d">Durée</FieldLabel>
        <DurationInput id="ui-fr-d" defaultValue={135} />
      </Field>
      <Field>
        <FieldLabel htmlFor="ui-fr-u">Stockage</FieldLabel>
        <UnitInput
          id="ui-fr-u"
          units={[{ value: 'Go' }, { value: 'To' }]}
          defaultValue={{ value: 1.5, unit: 'To' }}
        />
      </Field>
    </FieldGroup>
  ),
}
