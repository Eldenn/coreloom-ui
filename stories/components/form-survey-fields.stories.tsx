import type { Meta, StoryObj } from '@storybook/react-vite'
import { BotIcon, CodeIcon, TerminalIcon } from 'lucide-react'
import * as React from 'react'
import { z } from 'zod'

import { FieldGroup } from '@/components/ui/field'
import { useAppForm } from '@/components/ui/form'
import { toast } from '@/components/ui/sonner'

const schema = z.object({
  tools: z.array(z.string()).min(1, 'Pick at least one tool.'),
  tests: z.array(z.string()).min(1, 'Say which tests, or none.'),
})

function SurveyFieldsForm({
  submitOnMount = false,
  tools = [],
  tests = [],
}: {
  submitOnMount?: boolean
  tools?: string[]
  tests?: string[]
}) {
  const form = useAppForm({
    defaultValues: { tools, tests },
    validators: { onChange: schema },
    onSubmit: async ({ value }) => {
      await new Promise((r) => setTimeout(r, 400))
      toast.success(`Saved ${value.tools.length} tools`)
    },
  })
  React.useEffect(() => {
    if (submitOnMount) void form.handleSubmit()
  }, [form, submitOnMount])

  return (
    <form
      noValidate
      className="max-w-2xl"
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      <FieldGroup>
        <form.AppField name="tools">
          {(field) => (
            <field.CheckboxCardField
              label="Coding tools"
              description="Each one gets the files it reads."
              orientation="horizontal"
              options={[
                {
                  value: 'editor',
                  title: 'Editor assistant',
                  description: 'Reads AGENTS.md',
                  icon: <CodeIcon />,
                },
                {
                  value: 'cli',
                  title: 'Terminal agent',
                  description: 'Reads AGENTS.md and a pointer file',
                  icon: <TerminalIcon />,
                },
                {
                  value: 'other',
                  title: 'Other tools',
                  description: 'AGENTS.md only',
                  icon: <BotIcon />,
                },
              ]}
            />
          )}
        </form.AppField>
        <form.AppField name="tests">
          {(field) => (
            <field.CheckboxGroupField
              label="The assistant writes:"
              description="“No tests” can't be ticked with another answer."
              options={[
                { value: 'unit', label: 'Unit tests' },
                { value: 'component', label: 'Component tests' },
                { value: 'e2e', label: 'End-to-end tests' },
                { value: 'none', label: 'No tests', exclusive: true },
              ]}
            />
          )}
        </form.AppField>
        <form.AppForm>
          <form.SubmitButton>Save</form.SubmitButton>
        </form.AppForm>
      </FieldGroup>
    </form>
  )
}

const meta = {
  title: 'Components/Forms/Form fields: checkbox cards and exclusive choices',
  component: SurveyFieldsForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '`CheckboxCardField` (checkbox cards; a `string[]`) and `CheckboxGroupField` with an `exclusive` option ("None of these"): ticking it clears the others, ticking another clears it. Both on `useAppForm`.',
      },
    },
  },
} satisfies Meta<typeof SurveyFieldsForm>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Some answers given. */
export const Filled: Story = { args: { tools: ['editor', 'cli'], tests: ['unit', 'e2e'] } }

/** Submitted empty: each field shows its error. */
export const WithErrors: Story = { args: { submitOnMount: true } }
