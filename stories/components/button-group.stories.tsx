import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  ArchiveIcon,
  ChevronDownIcon,
  MinusIcon,
  PlusIcon,
  ReplyIcon,
  TrashIcon,
} from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from '@/components/ui/button-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'

const meta = {
  title: 'Components/Actions/Button group',
  component: ButtonGroup,
  tags: ['autodocs'],
  args: { orientation: 'horizontal' },
  argTypes: { orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] } },
  parameters: {
    docs: {
      description: {
        component:
          'Buttons joined edge to edge: split buttons, related actions, a small stepper. The consumer gives the group an `aria-label` when the buttons alone don’t say what it is for. For a choice between options, use ToggleGroup.',
      },
    },
  },
} satisfies Meta<typeof ButtonGroup>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <ButtonGroup aria-label="Message actions" {...args}>
      <Button variant="outline">
        <ArchiveIcon />
        Archive
      </Button>
      <Button variant="outline">
        <ReplyIcon />
        Reply
      </Button>
      <Button variant="outline">
        <TrashIcon />
        Delete
      </Button>
    </ButtonGroup>
  ),
}

export const SplitButton: Story = {
  name: 'Split button',
  render: () => (
    <div className="flex flex-wrap gap-4">
      <ButtonGroup>
        <Button>Deploy</Button>
        <ButtonGroupSeparator className="bg-primary-press" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" aria-label="More deploy options">
              <ChevronDownIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Deploy to staging</DropdownMenuItem>
            <DropdownMenuItem>Deploy without cache</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="secondary">Save draft</Button>
        <ButtonGroupSeparator />
        <Button variant="secondary" size="icon" aria-label="More save options">
          <ChevronDownIcon />
        </Button>
      </ButtonGroup>
    </div>
  ),
}

export const IconsOnly: Story = {
  name: 'Icons only',
  render: () => (
    <ButtonGroup aria-label="Text alignment">
      <Button variant="outline" size="icon" aria-label="Align left">
        <AlignLeftIcon />
      </Button>
      <Button variant="outline" size="icon" aria-label="Align center">
        <AlignCenterIcon />
      </Button>
      <Button variant="outline" size="icon" aria-label="Align right">
        <AlignRightIcon />
      </Button>
    </ButtonGroup>
  ),
}

export const WithText: Story = {
  name: 'With text and an input',
  render: () => {
    const [seats, setSeats] = React.useState(3)
    return (
      <div className="flex flex-col items-start gap-4">
        <ButtonGroup aria-label="Seats">
          <Button
            variant="outline"
            size="icon"
            aria-label="Remove a seat"
            disabled={seats <= 1}
            onClick={() => {
              setSeats((n) => n - 1)
            }}
          >
            <MinusIcon />
          </Button>
          <ButtonGroupText aria-live="polite">{seats} seats</ButtonGroupText>
          <Button
            variant="outline"
            size="icon"
            aria-label="Add a seat"
            onClick={() => {
              setSeats((n) => n + 1)
            }}
          >
            <PlusIcon />
          </Button>
        </ButtonGroup>
        <ButtonGroup className="w-full max-w-sm">
          <ButtonGroupText>https://</ButtonGroupText>
          <Input aria-label="Subdomain" defaultValue="acme" className="h-9" />
          <Button variant="outline">Check</Button>
        </ButtonGroup>
      </div>
    )
  },
}

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => (
    <ButtonGroup aria-label="Zoom" {...args}>
      <Button variant="outline" size="icon" aria-label="Zoom in">
        <PlusIcon />
      </Button>
      <Button variant="outline" size="icon" aria-label="Zoom out">
        <MinusIcon />
      </Button>
    </ButtonGroup>
  ),
}

export const Nested: Story = {
  render: () => (
    <ButtonGroup aria-label="Pagination">
      <ButtonGroup>
        <Button variant="outline" size="sm">
          Previous
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="outline" size="sm">
          1
        </Button>
        <Button variant="secondary" size="sm" aria-current="page">
          2
        </Button>
        <Button variant="outline" size="sm">
          3
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="outline" size="sm">
          Next
        </Button>
      </ButtonGroup>
    </ButtonGroup>
  ),
}
