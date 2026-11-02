import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { SliderInput } from '@/components/ui/slider-input'

const meta = {
  title: 'Components/Forms/Slider input',
  component: SliderInput,
  tags: ['autodocs'],
  args: { label: 'Volume', defaultValue: 40 },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A Slider and a NumberInput on one value. The consumer provides `value` + `onValueChange`, `min` / `max` / `step`, a `label` (names the slider) and an `id` for the FieldLabel (names the number field).',
      },
    },
  },
} satisfies Meta<typeof SliderInput>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [temperature, setTemperature] = React.useState(0.7)
    const [opacity, setOpacity] = React.useState(0.85)
    return (
      <FieldGroup className="max-w-md">
        <Field>
          <FieldLabel htmlFor="si-temp">Temperature</FieldLabel>
          <SliderInput
            id="si-temp"
            label="Temperature"
            value={temperature}
            onValueChange={setTemperature}
            min={0}
            max={2}
            step={0.1}
          />
          <FieldDescription>Value: {temperature}</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="si-opacity">Opacity</FieldLabel>
          <SliderInput
            id="si-opacity"
            label="Opacity"
            value={opacity}
            onValueChange={setOpacity}
            min={0}
            max={1}
            step={0.05}
            formatOptions={{ style: 'percent' }}
          />
        </Field>
      </FieldGroup>
    )
  },
}

export const Disabled: Story = {
  render: () => (
    <Field className="max-w-md">
      <FieldLabel htmlFor="si-off">Max tokens</FieldLabel>
      <SliderInput
        id="si-off"
        label="Max tokens"
        defaultValue={2048}
        max={8192}
        step={256}
        disabled
      />
    </Field>
  ),
}
