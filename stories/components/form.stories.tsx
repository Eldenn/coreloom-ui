import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlobeIcon } from 'lucide-react'
import * as React from 'react'
import { z } from 'zod'

import { FieldGroup, FieldSeparator } from '@/components/ui/field'
import { useAppForm } from '@/components/ui/form'
import { toast } from '@/components/ui/sonner'

const regions = [
  'Paris (cdg1)',
  'Frankfurt (fra1)',
  'London (lhr1)',
  'Washington (iad1)',
  'Tokyo (hnd1)',
].map((label) => ({
  value: label.slice(-5, -1),
  label,
  icon: <GlobeIcon className="size-4 text-muted-foreground" />,
}))

const taken = ['coreloom', 'dashboard', 'admin']

const schema = z.object({
  name: z
    .string()
    .min(3, 'Use at least 3 characters.')
    .max(32, 'Use 32 characters or fewer.')
    .regex(/^[a-z0-9-]*$/, 'Use lowercase letters, digits and hyphens.'),
  framework: z.string().min(1, 'Pick a framework.'),
  region: z.string().min(1, 'Pick a region.'),
  launch: z.date({ error: 'Pick a launch date.' }).optional(),
  visibility: z.enum(['private', 'team', 'public']),
  description: z.string().max(200, 'Keep it under 200 characters.'),
  previews: z.boolean(),
  terms: z.boolean().refine((v) => v, 'Accept the terms to continue.'),
})

type Values = z.input<typeof schema>

const empty: Values = {
  name: '',
  framework: '',
  region: '',
  launch: undefined,
  visibility: 'team',
  description: '',
  previews: true,
  terms: false,
}

function ProjectForm({
  defaultValues = empty,
  submitOnMount = false,
  failOnSubmit = false,
}: {
  defaultValues?: Values
  submitOnMount?: boolean
  failOnSubmit?: boolean
}) {
  const form = useAppForm({
    defaultValues,
    validators: {
      onChange: schema,
      // Stands in for the server: a form-level error comes back as `{ form }` (field errors as `{ fields }`).
      onSubmitAsync: async () => {
        await new Promise((r) => setTimeout(r, 600))
        return failOnSubmit
          ? {
              form: 'The region cdg1 is at capacity. Pick another one or try again in a few minutes.',
              fields: {},
            }
          : undefined
      },
    },
    onSubmit: ({ value }) => {
      toast.success(`Created ${value.name}`)
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
      <FieldGroup className="gap-5">
        <form.AppForm>
          <form.FormErrors />
        </form.AppForm>
        <form.AppField
          name="name"
          validators={{
            onChangeAsyncDebounceMs: 400,
            onChangeAsync: async ({ value }) => {
              await new Promise((r) => setTimeout(r, 300))
              return taken.includes(value) ? `${value} is taken. Try ${value}-app.` : undefined
            },
          }}
        >
          {(field) => (
            <field.TextField
              label="Project name"
              placeholder="acme-web"
              autoComplete="off"
              description="Lowercase, hyphen-separated. Used in URLs."
            />
          )}
        </form.AppField>
        <form.AppField name="framework">
          {(field) => (
            <field.SelectField
              label="Framework"
              placeholder="Choose a framework"
              options={[
                { value: 'next', label: 'Next.js' },
                { value: 'vite', label: 'Vite + React' },
                { value: 'adonis', label: 'AdonisJS' },
                { value: 'astro', label: 'Astro' },
              ]}
            />
          )}
        </form.AppField>
        <form.AppField name="region">
          {(field) => (
            <field.ComboboxField
              label="Region"
              options={regions}
              placeholder="Choose a region"
              searchPlaceholder="Search regions…"
            />
          )}
        </form.AppField>
        <form.AppField name="launch">
          {(field) => (
            <field.DateField
              label="Launch date"
              description="Optional. We'll remind you the day before."
            />
          )}
        </form.AppField>
        <form.AppField name="visibility">
          {(field) => (
            <field.RadioGroupField
              label="Visibility"
              options={[
                { value: 'private', label: 'Only me' },
                { value: 'team', label: 'My team' },
                { value: 'public', label: 'Anyone with the link' },
              ]}
            />
          )}
        </form.AppField>
        <form.AppField name="description">
          {(field) => <field.TextareaField label="Description" placeholder="What does it do?" />}
        </form.AppField>
        <FieldSeparator />
        <form.AppField name="previews">
          {(field) => (
            <field.SwitchField
              label="Preview deployments"
              description="Deploy every pull request to its own URL."
            />
          )}
        </form.AppField>
        <form.AppField name="terms">
          {(field) => <field.CheckboxField label="I accept the terms of service" />}
        </form.AppField>
        <form.AppForm>
          <form.SubmitButton pendingLabel="Creating…" className="self-start">
            Create project
          </form.SubmitButton>
        </form.AppForm>
      </FieldGroup>
    </form>
  )
}

const meta = {
  title: 'Components/Forms/Form (TanStack)',
  component: ProjectForm,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "`useAppForm` is TanStack Form's `useForm` with Coreloom's field components attached (`field.TextField`, `SelectField`, `ComboboxField`, `DateField`, `RadioGroupField`, `TextareaField`, `CheckboxField`, `SwitchField`) and two form components (`form.SubmitButton`, `form.FormErrors`). Validate with any Standard Schema (zod here) or plain functions. Validate on change: errors appear once a field has been left or the form submitted, then follow the typing.",
      },
    },
  },
} satisfies Meta<typeof ProjectForm>
export default meta
type Story = StoryObj<typeof meta>

/** Leave a field or submit to see the validation. "coreloom" is a taken name (async check). */
export const CreateProject: Story = {}

/** Submitted empty: every invalid field shows its error. */
export const WithErrors: Story = { args: { submitOnMount: true } }

/** The server refuses the submission: a form-level error above the fields. */
export const ServerError: Story = {
  args: {
    failOnSubmit: true,
    defaultValues: { ...empty, name: 'acme-web', framework: 'next', region: 'cdg1', terms: true },
    submitOnMount: true,
  },
}
