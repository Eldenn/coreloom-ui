import * as React from "react"
import type { Decorator, Preview } from "@storybook/react-vite"

import { fr as frDates } from "date-fns/locale"

import "./storybook.css"
import { coreloomTheme } from "./theme"
import { Toaster } from "../src/components/ui/sonner"
import { TooltipProvider } from "../src/components/ui/tooltip"
import { CoreloomI18nProvider } from "../src/lib/i18n"

/** Applies the toolbar's theme to <html data-theme> and its language to the i18n provider, like an app does. */
const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme === "light" ? "light" : "dark"
  const locale = context.globals.locale === "fr" ? "fr" : "en"
  React.useEffect(() => {
    if (theme === "light") document.documentElement.dataset.theme = "light"
    else delete document.documentElement.dataset.theme
  }, [theme])
  React.useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])
  return (
    <CoreloomI18nProvider locale={locale} dateLocale={locale === "fr" ? frDates : undefined}>
      <TooltipProvider>
        <Story />
        <Toaster />
      </TooltipProvider>
    </CoreloomI18nProvider>
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
    locale: {
      description: "Language of the components' built-in text",
      toolbar: {
        title: "Language",
        icon: "globe",
        items: [
          { value: "en", title: "English", right: "EN" },
          { value: "fr", title: "Français", right: "FR" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "dark", locale: "en" },
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
