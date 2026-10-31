import type { Meta, StoryObj } from '@storybook/react-vite'

import { type PricingPlan, PricingPlans } from '@/components/pricing'
import { toast } from '@/components/ui/sonner'

const plans: PricingPlan[] = [
  {
    id: 'hobby',
    name: 'Hobby',
    description: 'For side projects and trying things out.',
    monthly: 0,
    features: ['1 project', 'Preview deployments', 'Community support'],
    cta: 'Start for free',
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For teams shipping to production.',
    monthly: 24,
    yearly: 19,
    features: ['Unlimited projects', 'Custom domains', 'Team roles and SSO', 'Email support'],
    cta: 'Start a 14-day trial',
    featured: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Dedicated regions, SLAs and a security review.',
    monthly: null,
    features: ['Everything in Pro', '99.99% uptime SLA', 'Audit logs', 'A named contact'],
    cta: 'Contact sales',
  },
]

const meta = {
  title: 'Blocks/Pricing',
  component: PricingPlans,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { plans, onSelect: (plan, billing) => toast(`${plan.name} · ${billing}`) },
} satisfies Meta<typeof PricingPlans>
export default meta
type Story = StoryObj<typeof meta>

export const Plans: Story = {
  render: (args) => (
    <section className="mx-auto flex max-w-5xl flex-col items-center gap-3 py-8">
      <h2 className="m-0 font-display text-[32px] font-semibold tracking-[-0.02em] text-foreground">
        Simple pricing
      </h2>
      <p className="m-0 mb-4 text-[15px] text-muted-foreground">
        Start free, upgrade when you ship.
      </p>
      <PricingPlans {...args} />
    </section>
  ),
}

export const Yearly: Story = { ...Plans, args: { defaultBilling: 'yearly', currency: 'USD' } }
