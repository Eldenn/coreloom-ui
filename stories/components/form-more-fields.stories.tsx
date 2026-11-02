import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'
import { z } from 'zod'

import { FieldGroup } from '@/components/ui/field'
import { useAppForm } from '@/components/ui/form'
import { toast } from '@/components/ui/sonner'

const schema = z.object({
  bio: z.string().max(160, 'Keep it under 160 characters.'),
  password: z.string().min(12, 'Use at least 12 characters.'),
  seats: z.number({ error: 'Enter a number of seats.' }).min(1, 'At least one seat.'),
  opensAt: z.string({ error: 'Pick a time.' }),
  kickoff: z.date({ error: 'Pick a day and a time.' }),
})

function MoreFieldsForm({ submitOnMount = false }: { submitOnMount?: boolean }) {
  const form = useAppForm({
    defaultValues: {
      bio: 'Design systems, typography and very strong coffee.',
      password: '',
      seats: 5,
      opensAt: undefined as string | undefined,
      kickoff: undefined as Date | undefined,
    },
    validators: { onChange: schema as never },
    onSubmit: async ({ value }) => {
      await new Promise((r) => setTimeout(r, 400))
      toast.success(`Saved: ${String(value.seats)} seats, opens at ${value.opensAt ?? '—'}`)
    },
  })
  React.useEffect(() => {
    if (submitOnMount) void form.handleSubmit()
  }, [form, submitOnMount])

  return (
    <form
      noValidate
      className="max-w-md"
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      <FieldGroup>
        <form.AppField name="bio">
          {(field) => (
            <field.TextareaField label="Bio" description="Shown on your profile." maxCount={160} />
          )}
        </form.AppField>
        <form.AppField name="password">
          {(field) => <field.PasswordField label="New password" autoComplete="new-password" />}
        </form.AppField>
        <form.AppField name="seats">
          {(field) => <field.NumberField label="Seats" min={1} max={200} />}
        </form.AppField>
        <form.AppField name="opensAt">
          {(field) => <field.TimeField label="Opens at" step={15} min="07:00" max="12:00" />}
        </form.AppField>
        <form.AppField name="kickoff">
          {(field) => <field.DateTimeField label="Kickoff" step={15} />}
        </form.AppField>
        <form.AppForm>
          <form.SubmitButton>Save</form.SubmitButton>
        </form.AppForm>
      </FieldGroup>
    </form>
  )
}

const meta = {
  title: 'Components/Forms/Form fields: password, number, time, counter',
  component: MoreFieldsForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '`PasswordField`, `NumberField`, `TimeField` and `DateTimeField` on `useAppForm`, and `maxCount` on `TextField` / `TextareaField` for a character counter. Values are typed: a number (or null), an "HH:mm" string, a Date.',
      },
    },
  },
} satisfies Meta<typeof MoreFieldsForm>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Submitted empty: each field shows its error. */
export const WithErrors: Story = { args: { submitOnMount: true } }
