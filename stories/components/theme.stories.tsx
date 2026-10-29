import type { Meta, StoryObj } from "@storybook/react-vite"

import { ThemeMenu, ThemeToggle } from "@/components/theme-toggle"

const meta = {
  title: "Components/Actions/Theme switch",
  component: ThemeMenu,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "`ThemeMenu` offers Light, Dark and System (follows the OS, live). `ThemeToggle` is the one-button light ↔ dark version. Both save the choice in `localStorage(\"theme\")`; the inline script in Getting started applies it before the first paint.",
      },
    },
  },
} satisfies Meta<typeof ThemeMenu>
export default meta
type Story = StoryObj<typeof meta>

export const Menu: Story = {}

export const Toggle: Story = { render: () => <ThemeToggle /> }
