import './storybook.css'

import type { Decorator, Preview } from '@storybook/react-vite'
import { de as deDates, es as esDates, fr as frDates } from 'date-fns/locale'
import * as React from 'react'

import { Toaster } from '../src/components/ui/sonner'
import { TooltipProvider } from '../src/components/ui/tooltip'
import { CoreloomI18nProvider } from '../src/lib/i18n'
import { de } from '../src/lib/i18n-de'
import { es } from '../src/lib/i18n-es'
import { coreloomTheme } from './theme'

const LOCALES = {
  en: { messages: undefined, dateLocale: undefined },
  fr: { messages: undefined, dateLocale: frDates },
  es: { messages: es, dateLocale: esDates },
  de: { messages: de, dateLocale: deDates },
} as const
const ACCENTS = ['cyan', 'blue', 'violet', 'amber', 'rose'] as const
const SURFACES = ['mineral', 'bone'] as const

/** Applies the toolbar's theme, accent and surface to <html data-theme data-accent data-surface> and its language to the i18n
 *  provider, like an app does. */
const WithTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme === 'light' ? 'light' : 'dark'
  const locale = (
    context.globals.locale in LOCALES ? context.globals.locale : 'en'
  ) as keyof typeof LOCALES
  const accent = ACCENTS.find((a) => a === context.globals.accent) ?? 'cyan'
  React.useEffect(() => {
    if (theme === 'light') document.documentElement.dataset.theme = 'light'
    else delete document.documentElement.dataset.theme
  }, [theme])
  React.useEffect(() => {
    if (accent === 'cyan') delete document.documentElement.dataset.accent
    else document.documentElement.dataset.accent = accent
  }, [accent])
  const surface = SURFACES.find((s) => s === context.globals.surface)
  React.useEffect(() => {
    if (surface) document.documentElement.dataset.surface = surface
    else delete document.documentElement.dataset.surface
  }, [surface])
  React.useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])
  return (
    <CoreloomI18nProvider
      locale={locale}
      messages={LOCALES[locale].messages}
      dateLocale={LOCALES[locale].dateLocale}
    >
      <TooltipProvider>
        <Story />
        <Toaster />
      </TooltipProvider>
    </CoreloomI18nProvider>
  )
}

const preview: Preview = {
  decorators: [WithTheme],
  globalTypes: {
    theme: {
      description: 'Coreloom theme',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: 'dark', title: 'Dark', icon: 'moon' },
          { value: 'light', title: 'Light', icon: 'sun' },
        ],
        dynamicTitle: true,
      },
    },
    locale: {
      description: "Language of the components' built-in text",
      toolbar: {
        title: 'Language',
        icon: 'globe',
        items: [
          { value: 'en', title: 'English', right: 'EN' },
          { value: 'fr', title: 'Français', right: 'FR' },
          { value: 'es', title: 'Español', right: 'ES' },
          { value: 'de', title: 'Deutsch', right: 'DE' },
        ],
        dynamicTitle: true,
      },
    },
    accent: {
      description: 'Accent preset (accents.css, data-accent on <html>)',
      toolbar: {
        title: 'Accent',
        icon: 'paintbrush',
        items: [
          { value: 'cyan', title: 'Cyan (default)' },
          { value: 'blue', title: 'Blue' },
          { value: 'violet', title: 'Violet' },
          { value: 'amber', title: 'Amber' },
          { value: 'rose', title: 'Rose' },
        ],
        dynamicTitle: true,
      },
    },
    surface: {
      description: 'Surface preset (surfaces.css, data-surface on <html>)',
      toolbar: {
        title: 'Surface',
        icon: 'contrast',
        items: [
          { value: 'default', title: 'Graphite (default)' },
          { value: 'mineral', title: 'Mineral blue' },
          { value: 'bone', title: 'Bone' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'dark', locale: 'en', accent: 'cyan', surface: 'default' },
  parameters: {
    layout: 'padded',
    backgrounds: { disable: true },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    a11y: { test: 'todo' },
    docs: { theme: coreloomTheme },
    options: {
      storySort: { order: ['Introduction', 'Components', 'Blocks'] },
    },
  },
}

export default preview
