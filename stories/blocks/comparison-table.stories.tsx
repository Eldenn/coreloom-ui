import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  type ComparisonGroup,
  type ComparisonPlan,
  ComparisonTable,
} from '@/components/comparison-table'
import { toast } from '@/components/ui/sonner'

const plans: ComparisonPlan[] = [
  { id: 'free', name: 'Free', price: '€0' },
  { id: 'team', name: 'Team', price: '€24 / seat / month', featured: true },
  { id: 'enterprise', name: 'Enterprise', price: 'Custom', cta: 'Contact sales' },
]

const groups: ComparisonGroup[] = [
  {
    id: 'basics',
    name: 'Basics',
    features: [
      {
        id: 'projects',
        name: 'Projects',
        values: { free: '3', team: 'Unlimited', enterprise: 'Unlimited' },
      },
      {
        id: 'members',
        name: 'Members',
        values: { free: '1', team: 'Up to 50', enterprise: 'Unlimited' },
      },
      {
        id: 'storage',
        name: 'Storage',
        description: 'Files, images and exports',
        values: { free: '1 GB', team: '100 GB', enterprise: '1 TB' },
      },
      {
        id: 'themes',
        name: 'Dark and light themes',
        values: { free: true, team: true, enterprise: true },
      },
    ],
  },
  {
    id: 'collaboration',
    name: 'Collaboration',
    features: [
      {
        id: 'comments',
        name: 'Comments and mentions',
        values: { free: true, team: true, enterprise: true },
      },
      {
        id: 'roles',
        name: 'Custom roles',
        values: { free: false, team: 'partial', enterprise: true },
      },
      {
        id: 'history',
        name: 'Version history',
        values: { free: '7 days', team: '1 year', enterprise: 'Unlimited' },
      },
    ],
  },
  {
    id: 'security',
    name: 'Security',
    features: [
      {
        id: 'sso',
        name: 'Single sign-on (SAML)',
        values: { free: false, team: false, enterprise: true },
      },
      { id: 'audit', name: 'Audit log', values: { free: false, team: true, enterprise: true } },
      {
        id: '2fa',
        name: 'Two-factor authentication',
        values: { free: true, team: true, enterprise: true },
      },
    ],
  },
]

const meta = {
  title: 'Blocks/Comparison table',
  component: ComparisonTable,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Plans side by side, feature by feature, under a header that stays in view. Each cell is a tick, a dash, "Partial" or a value, with words for screen readers. "Only show differences" hides the rows where every plan is the same; on phones one plan shows at a time. The consumer provides `plans` and `groups` of features, and `onSelect` for the plans\' buttons.',
      },
    },
  },
  args: {
    plans,
    groups,
    onSelect: (plan) => toast(`${plan.name} selected`),
  },
} satisfies Meta<typeof ComparisonTable>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Only the rows where the plans differ. */
export const OnlyDifferences: Story = { args: { defaultOnlyDifferences: true } }

/** Without buttons: a comparison inside a pricing page that already has them. */
export const WithoutButtons: Story = { args: { onSelect: undefined } }

export const French: Story = { globals: { locale: 'fr' } }

/** One plan at a time, picked above the table. */
export const Phone: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } }
