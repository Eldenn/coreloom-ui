import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { BellIcon, GlobeIcon, KeyRoundIcon, SettingsIcon, UsersIcon } from "lucide-react"

import { SettingsLayout } from "@/components/settings-layout"
import { DangerZone, SettingsRow, SettingsSection } from "@/components/settings-section"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/sonner"
import { Switch } from "@/components/ui/switch"

const nav = [
  { id: "general", label: "General", icon: SettingsIcon },
  { id: "domains", label: "Domains", icon: GlobeIcon },
  { id: "env", label: "Environment", icon: KeyRoundIcon },
  { id: "notifications", label: "Notifications", icon: BellIcon },
  { id: "members", label: "Members", icon: UsersIcon },
]

const meta = {
  title: "Blocks/Settings",
  component: SettingsLayout,
  tags: ["autodocs"],
  args: { nav, active: "general", title: "Project settings", description: "coreloom-web · Production", children: null },
} satisfies Meta<typeof SettingsLayout>
export default meta
type Story = StoryObj<typeof meta>

export const ProjectSettings: Story = {
  render: (args) => {
    const [active, setActive] = React.useState(args.active)
    return (
      <div className="mx-auto max-w-[1040px] py-6">
        <SettingsLayout {...args} active={active} onNavigate={setActive}>
          <SettingsSection title="General" description="How the project appears across the dashboard." footer="Changes apply to new deployments." onSubmit={() => toast.success("Settings saved")}>
            <Field><FieldLabel htmlFor="pname">Project name</FieldLabel><Input id="pname" name="name" defaultValue="coreloom-web" /><FieldDescription>Used in URLs.</FieldDescription></Field>
          </SettingsSection>
          <SettingsSection title="Notifications" description="Applied as soon as you switch them.">
            <SettingsRow label="Deploy finished" description="An email when production is live." htmlFor="n1"><Switch id="n1" defaultChecked /></SettingsRow>
            <SettingsRow label="Weekly digest" htmlFor="n2"><Switch id="n2" /></SettingsRow>
          </SettingsSection>
          <DangerZone description="Removes the project, its deployments and domains." actionLabel="Delete project" confirmTitle="Delete coreloom-web?" confirmDescription="Its deployments, domains and environment variables go with it." resourceName="coreloom-web" onConfirm={() => toast("Deleted")} />
        </SettingsLayout>
      </div>
    )
  },
}
