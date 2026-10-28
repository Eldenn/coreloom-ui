import * as React from "react"
import type { Decorator, Preview } from "@storybook/react-vite"

import "./storybook.css"
import { coreloomTheme } from "./theme"
import { Toaster } from "../src/components/ui/sonner"
import { TooltipProvider } from "../src/components/ui/tooltip"

/** Applies the toolbar's theme to <html data-theme>, like an app does. */
const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme === "light" ? "light" : "dark"
  React.useEffect(() => {
    if (theme === "light") document.documentElement.dataset.theme = "light"
    else delete document.documentElement.dataset.theme
  }, [theme])
  return (
    <TooltipProvider>
      <Story />
      <Toaster />
    </TooltipProvider>
  )
}

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: "Coreloom theme",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: [
          { value: "dark", title: "Dark", icon: "moon" },
          { value: "light", title: "Light", icon: "sun" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "dark" },
  parameters: {
    layout: "padded",
    backgrounds: { disable: true },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    a11y: { test: "todo" },
    docs: { theme: coreloomTheme },
    options: {
      storySort: { order: ["Introduction", "Components", "Blocks"] },
    },
  },
}

export default preview
