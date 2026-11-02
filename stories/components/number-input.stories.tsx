import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { NumberInput } from '@/components/ui/number-input'

const meta = {
  title: 'Components/Forms/Number input',
  component: NumberInput,
  tags: ['autodocs'],
  args: { defaultValue: 4, min: 0, max: 99, step: 1, stepper: 'end', 'aria-label': 'Quantity' },
  argTypes: {
    stepper: { control: 'inline-radio', options: ['end', 'sides', 'none'] },
    step: { control: 'number' },
    min: { control: 'number' },
    max: { control: 'number' },
    disabled: { control: 'boolean' },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A number typed the reader’s way, with − / + buttons and spin-button keys (arrows, Shift or Page Up/Down for big steps, Home/End for the bounds). The consumer provides `value` + `onValueChange` (a number, or null when empty), and optionally `min`, `max`, `step` and `formatOptions` for units or percents.',
      },
    },
  },
} satisfies Meta<typeof NumberInput>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div className="max-w-[12rem]">
      <NumberInput {...args} />
    </div>
  ),
}

export const InFields: Story = {
  name: 'In fields',
  render: () => {
    const [seats, setSeats] = React.useState<number | null>(12)
    const [discount, setDiscount] = React.useState<number | null>(0.15)
    const [weight, setWeight] = React.useState<number | null>(2.5)
    const [population, setPopulation] = React.useState<number | null>(1250000)
    return (
      <FieldGroup className="max-w-xs gap-5">
        <Field>
          <FieldLabel htmlFor="ni-seats">Seats</FieldLabel>
          <NumberInput id="ni-seats" value={seats} onValueChange={setSeats} min={1} max={500} />
          <FieldDescription>Value: {seats ?? 'empty'}</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="ni-discount">Discount</FieldLabel>
          <NumberInput
            id="ni-discount"
            value={discount}
            onValueChange={setDiscount}
            min={0}
            max={1}
            step={0.05}
            formatOptions={{ style: 'percent' }}
          />
          <FieldDescription>Value: {discount ?? 'empty'}</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="ni-weight">Weight</FieldLabel>
          <NumberInput
            id="ni-weight"
            value={weight}
            onValueChange={setWeight}
            min={0}
            step={0.1}
            formatOptions={{ style: 'unit', unit: 'kilogram' }}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="ni-population">Population</FieldLabel>
          <NumberInput
            id="ni-population"
            value={population}
            onValueChange={setPopulation}
            min={0}
            step={1000}
            stepper="none"
          />
        </Field>
      </FieldGroup>
    )
  },
}

export const Sides: Story = {
  name: 'Buttons on both sides',
  render: () => {
    const [guests, setGuests] = React.useState<number | null>(2)
    return (
      <Field className="max-w-[11rem]">
        <FieldLabel htmlFor="ni-guests">Guests</FieldLabel>
        <NumberInput
          id="ni-guests"
          value={guests}
          onValueChange={setGuests}
          min={1}
          max={8}
          stepper="sides"
        />
        <FieldDescription>Value: {guests ?? 'empty'}</FieldDescription>
      </Field>
    )
  },
}

export const Invalid: Story = {
  render: () => (
    <Field className="max-w-xs" data-invalid="true">
      <FieldLabel htmlFor="ni-replicas">Replicas</FieldLabel>
      <NumberInput
        id="ni-replicas"
        defaultValue={null}
        min={1}
        aria-invalid
        aria-describedby="ni-replicas-error"
      />
      <FieldError id="ni-replicas-error">Enter at least one replica.</FieldError>
    </Field>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Field className="max-w-xs">
      <FieldLabel htmlFor="ni-off">Seats</FieldLabel>
      <NumberInput id="ni-off" defaultValue={12} disabled />
    </Field>
  ),
}

export const French: Story = {
  globals: { locale: 'fr' },
  render: () => {
    const [value, setValue] = React.useState<number | null>(1234.5)
    return (
      <Field className="max-w-xs">
        <FieldLabel htmlFor="ni-fr">Surface (m²)</FieldLabel>
        <NumberInput id="ni-fr" value={value} onValueChange={setValue} step={0.5} min={0} />
        <FieldDescription>Valeur : {value ?? 'vide'}</FieldDescription>
      </Field>
    )
  },
}
