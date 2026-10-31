import type { Meta, StoryObj } from '@storybook/react-vite'
import { useStore } from '@tanstack/react-form'
import { GlobeIcon } from 'lucide-react'
import * as React from 'react'
import { z } from 'zod'

import { OnboardingLayout } from '@/components/onboarding'
import { FieldGroup } from '@/components/ui/field'
import { useAppForm } from '@/components/ui/form'
import { toast } from '@/components/ui/sonner'

const steps = [
  { title: 'Workspace', description: 'Name and URL' },
  { title: 'Region', description: 'Where it runs' },
  { title: 'Team', description: 'Invite people' },
]

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// One schema per step: Continue validates only the fields on screen.
const schemas = [
  z.object({
    name: z.string().min(2, 'Use at least 2 characters.'),
    slug: z
      .string()
      .regex(/^[a-z0-9-]{3,}$/, 'Use 3 or more lowercase letters, digits or hyphens.'),
  }),
  z.object({ region: z.string().min(1, 'Pick a region.') }),
  z.object({
    invites: z
      .array(z.string())
      .refine((list) => list.every((e) => EMAIL.test(e)), 'Every invite must be an email address.'),
  }),
]

function Wizard() {
  const [step, setStep] = React.useState(0)
  const form = useAppForm({
    defaultValues: { name: '', slug: '', region: '', invites: [] as string[] },
    validators: {
      onChange: ({ value }) => {
        const r = schemas[step].safeParse(value)
        if (r.success) return undefined
        return {
          fields: Object.fromEntries(
            r.error.issues.map((i) => [String(i.path[0]), { message: i.message }]),
          ),
        }
      },
    },
    onSubmit: async () => {
      if (step < steps.length - 1) {
        setStep((s) => s + 1)
        form.reset(form.state.values, { keepDefaultValues: true })
        return
      }
      await new Promise((r) => setTimeout(r, 700))
      toast.success('Workspace created')
    },
  })
  const pending = useStore(form.store, (s) => s.isSubmitting)
  return (
    <OnboardingLayout
      brand={
        <span className="font-display text-[20px] font-bold tracking-[-0.03em] text-foreground">
          Core<span className="text-primary-text">loom</span>
        </span>
      }
      steps={steps}
      current={step}
      onStepChange={setStep}
      title={['Name your workspace', 'Pick a region', 'Invite your team'][step]}
      description={
        [
          'You can change both later in Settings.',
          'Deployments run closest to it.',
          'They’ll get an email with a link.',
        ][step]
      }
      onBack={() => {
        setStep((s) => s - 1)
      }}
      nextType="submit"
      formId="onboarding"
      pending={pending}
    >
      <form
        id="onboarding"
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
      >
        <FieldGroup className="gap-5">
          {step === 0 && (
            <>
              <form.AppField name="name">
                {(f) => (
                  <f.TextField
                    label="Workspace name"
                    placeholder="Acme"
                    autoComplete="organization"
                  />
                )}
              </form.AppField>
              <form.AppField name="slug">
                {(f) => (
                  <f.TextField label="URL" placeholder="acme" description="coreloom.dev/acme" />
                )}
              </form.AppField>
            </>
          )}
          {step === 1 && (
            <form.AppField name="region">
              {(f) => (
                <f.ComboboxField
                  label="Region"
                  placeholder="Choose a region"
                  options={['Paris (cdg1)', 'Frankfurt (fra1)', 'Washington (iad1)'].map(
                    (label) => ({
                      value: label.slice(-5, -1),
                      label,
                      icon: <GlobeIcon className="size-4 text-muted-foreground" />,
                    }),
                  )}
                />
              )}
            </form.AppField>
          )}
          {step === 2 && (
            <form.AppField name="invites">
              {(f) => (
                <f.TagsField
                  label="Email addresses"
                  placeholder="ada@acme.dev"
                  description="Separate addresses with a comma or Enter. Optional."
                />
              )}
            </form.AppField>
          )}
        </FieldGroup>
      </form>
    </OnboardingLayout>
  )
}

const meta = {
  title: 'Blocks/Onboarding',
  component: Wizard,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Wizard>
export default meta
type Story = StoryObj<typeof meta>

/** Three steps, one form; each Continue validates the step on screen. */
export const SetupWizard: Story = {}
