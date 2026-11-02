import type { Meta, StoryObj } from '@storybook/react-vite'
import { BikeIcon, PackageIcon, RocketIcon, TruckIcon, ZapIcon } from 'lucide-react'
import * as React from 'react'

import { CheckboxCard, RadioCard, RadioCardGroup } from '@/components/ui/choice-card'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'

const meta = {
  title: 'Components/Forms/Choice card',
  component: RadioCardGroup,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Radio buttons and checkboxes drawn as cards. The consumer provides `value` + `onValueChange` on `RadioCardGroup` (or `checked` + `onCheckedChange` on `CheckboxCard`), a name for the group (`aria-labelledby` pointing at its label), and a `title` per card, with an optional `description`, `icon` and extra content.',
      },
    },
  },
  args: { children: null },
} satisfies Meta<typeof RadioCardGroup>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [plan, setPlan] = React.useState('team')
    return (
      <Field className="max-w-md">
        <FieldLabel id="plan-label">Plan</FieldLabel>
        <RadioCardGroup aria-labelledby="plan-label" value={plan} onValueChange={setPlan}>
          <RadioCard
            value="starter"
            title="Starter"
            description="One project, community support."
            icon={<BikeIcon />}
          >
            <span className="text-[13px] font-medium text-foreground">Free</span>
          </RadioCard>
          <RadioCard
            value="team"
            title="Team"
            description="Unlimited projects, shared workspaces."
            icon={<RocketIcon />}
          >
            <span className="text-[13px] font-medium text-foreground">€12 / seat / month</span>
          </RadioCard>
          <RadioCard
            value="enterprise"
            title="Enterprise"
            description="SSO, audit logs, a named contact."
            icon={<ZapIcon />}
            disabled
          />
        </RadioCardGroup>
        <FieldDescription>Picked: {plan}. Enterprise is sold by our team.</FieldDescription>
      </Field>
    )
  },
}

export const Horizontal: Story = {
  render: () => (
    <Field>
      <FieldLabel id="ship-label">Delivery</FieldLabel>
      <RadioCardGroup aria-labelledby="ship-label" defaultValue="standard" orientation="horizontal">
        <RadioCard
          value="standard"
          title="Standard"
          description="3 to 5 days · free"
          icon={<PackageIcon />}
        />
        <RadioCard
          value="express"
          title="Express"
          description="Next day · €9"
          icon={<TruckIcon />}
        />
      </RadioCardGroup>
    </Field>
  ),
}

export const Checkboxes: Story = {
  render: () => (
    <fieldset className="m-0 flex max-w-md flex-col gap-3 border-0 p-0">
      <legend className="mb-3 text-[14px] font-medium">Add-ons</legend>
      <CheckboxCard
        title="Priority support"
        description="Answers within four hours."
        defaultChecked
      />
      <CheckboxCard title="Extra storage" description="500 GB more for files and backups." />
    </fieldset>
  ),
}

export const Invalid: Story = {
  render: () => (
    <Field data-invalid className="max-w-md">
      <FieldLabel id="inv-label">Plan</FieldLabel>
      <RadioCardGroup aria-labelledby="inv-label" aria-invalid>
        <RadioCard value="a" title="Monthly" />
        <RadioCard value="b" title="Yearly" description="Two months free." />
      </RadioCardGroup>
    </Field>
  ),
}
