import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { Combobox } from '@/components/ui/combobox'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const frameworks = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'Solid' },
]

function Clearable() {
  const [region, setRegion] = React.useState('fra1')
  const [framework, setFramework] = React.useState('react')
  return (
    <FieldGroup className="max-w-xs">
      <Field>
        <FieldLabel htmlFor="cs-region">Region</FieldLabel>
        <Select value={region} onValueChange={setRegion}>
          <SelectTrigger
            id="cs-region"
            onClear={() => {
              setRegion('')
            }}
          >
            <SelectValue placeholder="Any region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cdg1">Paris (cdg1)</SelectItem>
            <SelectItem value="fra1">Frankfurt (fra1)</SelectItem>
            <SelectItem value="iad1">Washington (iad1)</SelectItem>
          </SelectContent>
        </Select>
        <FieldDescription>Value: {region || 'none'}</FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor="cs-framework">Framework</FieldLabel>
        <Combobox
          id="cs-framework"
          options={frameworks}
          value={framework}
          onValueChange={setFramework}
          placeholder="Any framework"
          clearable
        />
        <FieldDescription>Value: {framework || 'none'}</FieldDescription>
      </Field>
    </FieldGroup>
  )
}

const meta = {
  title: 'Components/Forms/Clearable select and combobox',
  component: Clearable,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A × button that empties a Select (`onClear` on `SelectTrigger`, which sets the value to "") or a Combobox (`clearable`). It shows only while something is picked, and focus goes back to the field.',
      },
    },
  },
} satisfies Meta<typeof Clearable>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const French: Story = { globals: { locale: 'fr' } }
