import type { Meta, StoryObj } from "@storybook/react-vite"
import { BoldIcon, ItalicIcon, LayoutGridIcon, ListIcon, StarIcon, TerminalIcon, UnderlineIcon } from "lucide-react"

import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const meta = {
  title: "Components/Actions/Toggle",
  component: Toggle,
  tags: ["autodocs"],
  args: { children: "Wrap lines", "aria-label": "Wrap lines" },
  argTypes: { variant: { control: "select", options: ["default", "outline"] }, size: { control: "select", options: ["sm", "default", "lg"] } },
} satisfies Meta<typeof Toggle>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const States: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Toggle aria-label="Favorite" variant="outline" defaultPressed><StarIcon /></Toggle>
      <Toggle aria-label="Terminal"><TerminalIcon />Terminal</Toggle>
      <Toggle aria-label="Disabled" disabled>Disabled</Toggle>
    </div>
  ),
}

export const Group: Story = {
  name: "ToggleGroup",
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <ToggleGroup type="multiple" variant="outline" aria-label="Formatting">
        <ToggleGroupItem value="bold" aria-label="Bold"><BoldIcon /></ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Italic"><ItalicIcon /></ToggleGroupItem>
        <ToggleGroupItem value="underline" aria-label="Underline"><UnderlineIcon /></ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup type="single" defaultValue="grid" variant="outline" aria-label="View">
        <ToggleGroupItem value="list"><ListIcon />List</ToggleGroupItem>
        <ToggleGroupItem value="grid"><LayoutGridIcon />Grid</ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
}
