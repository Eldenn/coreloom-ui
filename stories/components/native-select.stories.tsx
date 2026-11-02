import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from '@/components/ui/native-select'

const meta = {
  title: 'Components/Forms/Native select',
  component: NativeSelect,
  tags: ['autodocs'],
  args: { size: 'default' },
  argTypes: { size: { control: 'inline-radio', options: ['default', 'sm'] } },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The browser’s own `<select>`, styled like the other fields. The best picker on phones and in long forms. The consumer wires it like any select (`value` + `onChange`) and labels it with a `FieldLabel`.',
      },
    },
  },
} satisfies Meta<typeof NativeSelect>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => {
    const [region, setRegion] = React.useState('cdg1')
    return (
      <Field className="max-w-xs">
        <FieldLabel htmlFor="ns-region">Region</FieldLabel>
        <NativeSelect
          {...args}
          id="ns-region"
          value={region}
          onChange={(e) => {
            setRegion(e.target.value)
          }}
        >
          <NativeSelectOptGroup label="Europe">
            <NativeSelectOption value="cdg1">Paris (cdg1)</NativeSelectOption>
            <NativeSelectOption value="fra1">Frankfurt (fra1)</NativeSelectOption>
            <NativeSelectOption value="lhr1">London (lhr1)</NativeSelectOption>
          </NativeSelectOptGroup>
          <NativeSelectOptGroup label="Americas">
            <NativeSelectOption value="iad1">Washington (iad1)</NativeSelectOption>
            <NativeSelectOption value="sfo1">San Francisco (sfo1)</NativeSelectOption>
          </NativeSelectOptGroup>
        </NativeSelect>
        <FieldDescription>Value: {region}</FieldDescription>
      </Field>
    )
  },
}

export const States: Story = {
  render: () => (
    <FieldGroup className="max-w-xs">
      <Field>
        <FieldLabel htmlFor="ns-empty">Plan</FieldLabel>
        <NativeSelect id="ns-empty" defaultValue="">
          <NativeSelectOption value="" disabled>
            Choose a plan
          </NativeSelectOption>
          <NativeSelectOption value="free">Free</NativeSelectOption>
          <NativeSelectOption value="pro">Pro</NativeSelectOption>
        </NativeSelect>
      </Field>
      <Field data-invalid="true">
        <FieldLabel htmlFor="ns-invalid">Country</FieldLabel>
        <NativeSelect id="ns-invalid" defaultValue="" aria-invalid aria-describedby="ns-err">
          <NativeSelectOption value="">Select…</NativeSelectOption>
          <NativeSelectOption value="fr">France</NativeSelectOption>
        </NativeSelect>
        <FieldError id="ns-err">Choose a country.</FieldError>
      </Field>
      <Field>
        <FieldLabel htmlFor="ns-off">Billing cycle</FieldLabel>
        <NativeSelect id="ns-off" defaultValue="year" disabled>
          <NativeSelectOption value="month">Monthly</NativeSelectOption>
          <NativeSelectOption value="year">Yearly</NativeSelectOption>
        </NativeSelect>
      </Field>
      <Field>
        <FieldLabel htmlFor="ns-sm">Rows per page</FieldLabel>
        <NativeSelect id="ns-sm" size="sm" defaultValue="25" className="w-24">
          <NativeSelectOption value="10">10</NativeSelectOption>
          <NativeSelectOption value="25">25</NativeSelectOption>
          <NativeSelectOption value="50">50</NativeSelectOption>
        </NativeSelect>
      </Field>
    </FieldGroup>
  ),
}
