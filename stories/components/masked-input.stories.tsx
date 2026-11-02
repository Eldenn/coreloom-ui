import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { MaskedInput } from '@/components/ui/masked-input'

const meta = {
  title: 'Components/Forms/Masked input',
  component: MaskedInput,
  tags: ['autodocs'],
  args: { preset: 'iban' },
  argTypes: { preset: { control: 'select', options: ['iban', 'card', 'siren', 'siret'] } },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Groups what people type the way the number is printed and checks it. The consumer picks a `preset` (iban, card, siren, siret) or passes a `mask` ("99 99 99 99 99") and `validate`, and gets the raw value in `onValueChange`.',
      },
    },
  },
} satisfies Meta<typeof MaskedInput>
export default meta
type Story = StoryObj<typeof meta>

export const Presets: Story = {
  render: () => {
    const [iban, setIban] = React.useState('FR7630006000011234567890189')
    const [complete, setComplete] = React.useState(true)
    return (
      <FieldGroup className="max-w-sm">
        <Field>
          <FieldLabel htmlFor="mi-iban">IBAN</FieldLabel>
          <MaskedInput
            id="mi-iban"
            preset="iban"
            value={iban}
            onValueChange={(raw, { complete: done }) => {
              setIban(raw)
              setComplete(done)
            }}
          />
          <FieldDescription>
            Value: <code className="font-mono">{iban || '—'}</code> ·{' '}
            {complete ? 'valid' : 'incomplete'}
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="mi-card">Card number</FieldLabel>
          <MaskedInput id="mi-card" preset="card" defaultValue="4970101234567893" />
        </Field>
        <Field>
          <FieldLabel htmlFor="mi-siret">SIRET</FieldLabel>
          <MaskedInput id="mi-siret" preset="siret" defaultValue="73282932000074" />
        </Field>
      </FieldGroup>
    )
  },
}

export const CustomMask: Story = {
  name: 'Custom mask',
  render: () => (
    <Field className="max-w-xs">
      <FieldLabel htmlFor="mi-plate">Licence plate</FieldLabel>
      <MaskedInput id="mi-plate" mask="aa-999-aa" defaultValue="AB123CD" />
      <FieldDescription>Pattern: 9 a digit, a a letter.</FieldDescription>
    </Field>
  ),
}

export const French: Story = {
  globals: { locale: 'fr' },
  render: () => (
    <Field className="max-w-sm">
      <FieldLabel htmlFor="mi-fr">SIREN</FieldLabel>
      <MaskedInput id="mi-fr" preset="siren" defaultValue="732829320" />
    </Field>
  ),
}
