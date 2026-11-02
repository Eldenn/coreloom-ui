import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { SignaturePad } from '@/components/ui/signature-pad'

const meta = {
  title: 'Components/Forms/Signature pad',
  component: SignaturePad,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A box to sign with a finger, a pen or the mouse; "Type instead" writes a typed name as the signature. The consumer provides `onValueChange` (a PNG data URL, or null) and a name (`aria-label` or `aria-labelledby`).',
      },
    },
  },
} satisfies Meta<typeof SignaturePad>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [signed, setSigned] = React.useState(false)
    return (
      <Field className="max-w-md">
        <FieldLabel id="sig-label">Signature</FieldLabel>
        <SignaturePad
          aria-labelledby="sig-label"
          onValueChange={(url) => {
            setSigned(url !== null)
          }}
        />
        <FieldDescription>{signed ? 'Signed.' : 'Sign to accept the delivery.'}</FieldDescription>
      </Field>
    )
  },
}

export const French: Story = {
  globals: { locale: 'fr' },
  render: () => (
    <Field className="max-w-md">
      <FieldLabel id="sig-fr">Signature du client</FieldLabel>
      <SignaturePad aria-labelledby="sig-fr" height={120} />
    </Field>
  ),
}
