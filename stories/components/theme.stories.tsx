import type { Meta, StoryObj } from '@storybook/react-vite'

import { AccentPicker, ThemeMenu, ThemeToggle } from '@/components/theme-toggle'

const meta = {
  title: 'Components/Actions/Theme switch',
  component: ThemeMenu,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`ThemeMenu` offers Light, Dark and System (follows the OS, live). `ThemeToggle` is the one-button light ↔ dark version. Both save the choice in `localStorage("theme")`; the inline script in Getting started applies it before the first paint. `AccentPicker` sets `<html data-accent>` from the presets in `accents.css` and saves it in `localStorage("accent")`.',
      },
    },
  },
} satisfies Meta<typeof ThemeMenu>
export default meta
type Story = StoryObj<typeof meta>

export const Menu: Story = {}

export const Toggle: Story = { render: () => <ThemeToggle /> }

/** One swatch per preset in accents.css; arrow keys move between them. The Accent toolbar shows the same presets. */
export const Accent: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <span id="accent-label" className="text-[13px] font-medium text-foreground">
        Accent colour
      </span>
      <AccentPicker aria-labelledby="accent-label" />
    </div>
  ),
}
