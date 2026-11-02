import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { Field, FieldLabel } from '@/components/ui/field'
import { PasswordInput } from '@/components/ui/input-group'
import { PasswordStrength } from '@/components/ui/password-strength'

const meta = {
  title: 'Components/Forms/Password strength',
  component: PasswordStrength,
  tags: ['autodocs'],
  args: { password: 'correct horse' },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "A meter and a rule checklist under a new-password field. The consumer provides `password`, an `id` to put in the field's `aria-describedby`, and optionally `rules` (`{ label, test }`). The score is an estimate for people, not a security check.",
      },
    },
  },
} satisfies Meta<typeof PasswordStrength>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [password, setPassword] = React.useState('Coreloom2026')
    return (
      <Field className="max-w-sm">
        <FieldLabel htmlFor="ps-new">New password</FieldLabel>
        <PasswordInput
          id="ps-new"
          autoComplete="new-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
          }}
          aria-describedby="ps-strength"
        />
        <PasswordStrength
          id="ps-strength"
          password={password}
          rules={[
            { label: 'At least 12 characters', test: (p) => p.length >= 12 },
            { label: 'A number', test: (p) => /\d/.test(p) },
            { label: 'A symbol', test: (p) => /[^A-Za-z\d]/.test(p) },
          ]}
        />
      </Field>
    )
  },
}

export const Levels: Story = {
  render: () => (
    <div className="flex max-w-sm flex-col gap-5">
      {['', 'password1', 'Sunflower7', 'Sunflower7!', 'Sunflower-77-Garden'].map((p) => (
        <PasswordStrength key={p} password={p} />
      ))}
    </div>
  ),
}

export const French: Story = {
  globals: { locale: 'fr' },
  render: () => <PasswordStrength password="Tournesol-77" className="max-w-sm" />,
}
