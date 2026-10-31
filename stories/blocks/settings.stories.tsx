import type { Meta, StoryObj } from '@storybook/react-vite'
import { BellIcon, GlobeIcon, KeyRoundIcon, SettingsIcon, UsersIcon } from 'lucide-react'
import * as React from 'react'

import { SettingsLayout } from '@/components/settings-layout'
import { DangerZone, SettingsRow, SettingsSection } from '@/components/settings-section'
import { useAppForm } from '@/components/ui/form'
import { toast } from '@/components/ui/sonner'
import { Switch } from '@/components/ui/switch'

const nav = [
  { id: 'general', label: 'General', icon: SettingsIcon },
  { id: 'domains', label: 'Domains', icon: GlobeIcon },
  { id: 'env', label: 'Environment', icon: KeyRoundIcon },
  { id: 'notifications', label: 'Notifications', icon: BellIcon },
  { id: 'members', label: 'Members', icon: UsersIcon },
]

const meta = {
  title: 'Blocks/Settings',
  component: SettingsLayout,
  tags: ['autodocs'],
  args: {
    nav,
    active: 'general',
    title: 'Project settings',
    description: 'coreloom-web · Production',
    children: null,
  },
} satisfies Meta<typeof SettingsLayout>
export default meta
type Story = StoryObj<typeof meta>

function GeneralSection() {
  const form = useAppForm({
    defaultValues: { name: 'coreloom-web', region: 'cdg1' },
    onSubmit: async () => {
      await new Promise((r) => setTimeout(r, 800))
      toast.success('Settings saved')
    },
  })
  return (
    <SettingsSection
      title="General"
      description="How the project appears across the dashboard."
      footer="Changes apply to new deployments."
      form={form}
    >
      <form.AppField
        name="name"
        validators={{
          onChange: ({ value }) =>
            !value
              ? 'Enter a project name.'
              : /[^a-z0-9-]/.test(value)
                ? 'Use lowercase letters, digits and hyphens.'
                : undefined,
        }}
      >
        {(field) => (
          <field.TextField label="Project name" description="Used in URLs." autoComplete="off" />
        )}
      </form.AppField>
      <form.AppField name="region">
        {(field) => (
          <field.SelectField
            label="Default region"
            options={[
              { value: 'cdg1', label: 'Paris (cdg1)' },
              { value: 'fra1', label: 'Frankfurt (fra1)' },
              { value: 'iad1', label: 'Washington (iad1)' },
            ]}
          />
        )}
      </form.AppField>
    </SettingsSection>
  )
}

export const ProjectSettings: Story = {
  render: (args) => {
    const [active, setActive] = React.useState(args.active)
    return (
      <div className="mx-auto max-w-[1040px] py-6">
        <SettingsLayout {...args} active={active} onNavigate={setActive}>
          <GeneralSection />
          <SettingsSection title="Notifications" description="Applied as soon as you switch them.">
            <SettingsRow
              label="Deploy finished"
              description="An email when production is live."
              htmlFor="n1"
            >
              <Switch id="n1" defaultChecked />
            </SettingsRow>
            <SettingsRow label="Weekly digest" htmlFor="n2">
              <Switch id="n2" />
            </SettingsRow>
          </SettingsSection>
          <DangerZone
            description="Removes the project, its deployments and domains."
            actionLabel="Delete project"
            confirmTitle="Delete coreloom-web?"
            confirmDescription="Its deployments, domains and environment variables go with it."
            resourceName="coreloom-web"
            onConfirm={() => toast('Deleted')}
          />
        </SettingsLayout>
      </div>
    )
  },
}
