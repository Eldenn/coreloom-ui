import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { ColorPicker } from '@/components/ui/color-picker'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'

const meta = {
  title: 'Components/Forms/Color picker',
  component: ColorPicker,
  tags: ['autodocs'],
  args: { defaultValue: '#14b8a6', 'aria-label': 'Label color' },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A colour as "#rrggbb": swatches, a hex field and the system colour dialog. The consumer provides `value` + `onValueChange`, optionally its own `swatches` ({ value, label }) and `allowCustom={false}` for swatches only.',
      },
    },
  },
} satisfies Meta<typeof ColorPicker>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [color, setColor] = React.useState('#14b8a6')
    return (
      <Field className="max-w-xs">
        <FieldLabel htmlFor="cp-label">Label color</FieldLabel>
        <ColorPicker id="cp-label" value={color} onValueChange={setColor} />
        <FieldDescription>
          Value: <code className="font-mono">{color}</code>
        </FieldDescription>
      </Field>
    )
  },
}

export const SwatchesOnly: Story = {
  name: 'Swatches only, custom color',
  render: () => (
    <FieldGroup className="max-w-xs">
      <Field>
        <FieldLabel htmlFor="cp-tag">Tag color</FieldLabel>
        <ColorPicker
          id="cp-tag"
          defaultValue="#64748b"
          allowCustom={false}
          swatches={[
            { value: '#64748b', label: 'Slate' },
            { value: '#0ea5e9', label: 'Sky' },
            { value: '#10b981', label: 'Emerald' },
            { value: '#f43f5e', label: 'Rose' },
          ]}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="cp-brand">Brand color</FieldLabel>
        <ColorPicker id="cp-brand" defaultValue="#ff5a1f" />
      </Field>
    </FieldGroup>
  ),
}
