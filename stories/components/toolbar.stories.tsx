import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  BoxIcon,
  CircleDotIcon,
  CodeIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  PlusIcon,
  Redo2Icon,
  SplineIcon,
  StrikethroughIcon,
  Trash2Icon,
  UnderlineIcon,
  Undo2Icon,
  ZoomInIcon,
  ZoomOutIcon,
} from 'lucide-react'

import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import {
  Toolbar,
  ToolbarButton,
  ToolbarLink,
  ToolbarMenu,
  ToolbarOverflow,
  ToolbarSeparator,
  ToolbarSpacer,
  ToolbarToggleGroup,
  ToolbarToggleItem,
} from '@/components/ui/toolbar'

const meta = {
  title: 'Components/Actions/Toolbar',
  component: Toolbar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A row of tools that is one Tab stop: the arrow keys move between them. The consumer provides an `aria-label` and the tools: `ToolbarButton`, `ToolbarToggleGroup` with `ToolbarToggleItem` (`type="single"` or `"multiple"`), `ToolbarLink`, `ToolbarSeparator`, `ToolbarSpacer`, `ToolbarMenu` (a named menu such as Add ▾) and `ToolbarOverflow` holding DropdownMenuItem elements. `tooltip` names icon-only tools on hover.',
      },
    },
  },
} satisfies Meta<typeof Toolbar>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Toolbar aria-label="Formatting" className="w-fit">
      <ToolbarToggleGroup type="multiple" aria-label="Text style" defaultValue={['bold']}>
        <ToolbarToggleItem value="bold" aria-label="Bold" tooltip="Bold">
          <BoldIcon />
        </ToolbarToggleItem>
        <ToolbarToggleItem value="italic" aria-label="Italic" tooltip="Italic">
          <ItalicIcon />
        </ToolbarToggleItem>
        <ToolbarToggleItem value="underline" aria-label="Underline" tooltip="Underline">
          <UnderlineIcon />
        </ToolbarToggleItem>
        <ToolbarToggleItem
          value="strike"
          aria-label="Strikethrough"
          tooltip="Strikethrough"
          className="max-sm:hidden"
        >
          <StrikethroughIcon />
        </ToolbarToggleItem>
      </ToolbarToggleGroup>
      <ToolbarSeparator />
      <ToolbarToggleGroup type="single" aria-label="Alignment" defaultValue="left">
        <ToolbarToggleItem value="left" aria-label="Align left">
          <AlignLeftIcon />
        </ToolbarToggleItem>
        <ToolbarToggleItem value="center" aria-label="Align center">
          <AlignCenterIcon />
        </ToolbarToggleItem>
        <ToolbarToggleItem value="right" aria-label="Align right">
          <AlignRightIcon />
        </ToolbarToggleItem>
      </ToolbarToggleGroup>
      <ToolbarSeparator />
      <ToolbarButton>
        <LinkIcon /> Link
      </ToolbarButton>
      <ToolbarOverflow>
        <DropdownMenuItem>
          <ListIcon /> Bulleted list
        </DropdownMenuItem>
        <DropdownMenuItem>
          <ListOrderedIcon /> Numbered list
        </DropdownMenuItem>
        <DropdownMenuItem>
          <CodeIcon /> Code block
        </DropdownMenuItem>
      </ToolbarOverflow>
    </Toolbar>
  ),
}

export const Canvas: Story = {
  render: () => (
    <Toolbar aria-label="Canvas" className="max-w-xl">
      <ToolbarButton aria-label="Zoom out" tooltip="Zoom out">
        <ZoomOutIcon />
      </ToolbarButton>
      <span className="w-12 text-center font-mono text-[12px] text-fg-secondary">100%</span>
      <ToolbarButton aria-label="Zoom in" tooltip="Zoom in">
        <ZoomInIcon />
      </ToolbarButton>
      <ToolbarSeparator />
      <ToolbarButton>Fit</ToolbarButton>
      <ToolbarSpacer />
      <ToolbarLink href="#help">Help</ToolbarLink>
    </Toolbar>
  ),
}

/** An editor's drawing tools: a named Add menu, quick tools, and actions on the selection. */
export const WithMenus: Story = {
  render: () => (
    <Toolbar aria-label="Drawing tools" className="max-w-xl">
      <ToolbarMenu label="Add" icon={<PlusIcon />}>
        <DropdownMenuItem>
          <BoxIcon /> Class
        </DropdownMenuItem>
        <DropdownMenuItem>
          <CircleDotIcon /> Interface
        </DropdownMenuItem>
      </ToolbarMenu>
      <ToolbarButton aria-label="Add: Class" tooltip="Class">
        <BoxIcon />
      </ToolbarButton>
      <ToolbarSeparator />
      <ToolbarButton>
        <SplineIcon /> Connect
      </ToolbarButton>
      <ToolbarButton aria-label="Delete" tooltip="Delete" disabled>
        <Trash2Icon />
      </ToolbarButton>
      <ToolbarSeparator />
      <ToolbarButton aria-label="Undo" tooltip="Undo">
        <Undo2Icon />
      </ToolbarButton>
      <ToolbarButton aria-label="Redo" tooltip="Redo" disabled>
        <Redo2Icon />
      </ToolbarButton>
    </Toolbar>
  ),
}
