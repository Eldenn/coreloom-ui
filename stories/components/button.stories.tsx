import type { Meta, StoryObj } from '@storybook/react-vite'
import { ArrowRightIcon, SearchIcon, ZapIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'

const meta = {
  title: 'Components/Actions/Button',
  component: Button,
  tags: ['autodocs'],
  args: { children: 'Get started' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'outline', 'ghost', 'destructive', 'link'],
    },
    size: { control: 'select', options: ['sm', 'default', 'lg', 'icon', 'icon-sm', 'icon-lg'] },
  },
} satisfies Meta<typeof Button>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button>
        <ZapIcon />
        Default
      </Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm">Small</Button>
      <Button>Default</Button>
      <Button size="lg">
        Large
        <ArrowRightIcon />
      </Button>
      <Button size="icon" variant="secondary" aria-label="Search">
        <SearchIcon />
      </Button>
      <Button disabled>Disabled</Button>
    </div>
  ),
}
