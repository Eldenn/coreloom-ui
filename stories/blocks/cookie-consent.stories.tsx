import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import {
  type ConsentChoices,
  CookieConsent,
  CookiePreferences,
  parseConsent,
} from '@/components/cookie-consent'
import { Button } from '@/components/ui/button'

const meta = {
  title: 'Blocks/Cookie consent',
  component: CookieConsent,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The banner that asks before a site sets non-essential cookies, with "Reject all" and "Accept all" given the same weight, and `CookiePreferences`, the dialog with a switch per category. The consumer keeps the choices (`value`, `onValueChange`), stores them (a cookie, localStorage, read back with `parseConsent`) and loads its scripts from them.',
      },
    },
  },
  args: {
    value: null,
    onValueChange: () => {},
    position: 'inline',
    policyHref: '#cookie-policy',
  },
} satisfies Meta<typeof CookieConsent>
export default meta
type Story = StoryObj<typeof meta>

/** The banner as it first appears (here in the page flow: `position="inline"`). */
export const Banner: Story = {}

/** How an app wires it: the banner until a choice is made, then a "Cookie settings" link to change it. */
export const InAnApp: Story = {
  render: function Render() {
    // An app would read this from localStorage with parseConsent(localStorage.getItem(key), categories).
    const [consent, setConsent] = React.useState<ConsentChoices | null>(null)
    const [settings, setSettings] = React.useState(false)
    return (
      <main className="flex min-h-[420px] flex-col justify-between gap-6">
        <div className="flex flex-col gap-2 text-[14px] text-fg-secondary">
          <p className="m-0">
            Choices: <code>{consent ? JSON.stringify(consent) : 'none yet'}</code>
          </p>
          <Button variant="link" className="self-start px-0" onClick={() => setSettings(true)}>
            Cookie settings
          </Button>
        </div>
        <CookieConsent value={consent} onValueChange={setConsent} position="inline" />
        <CookiePreferences
          open={settings}
          onOpenChange={setSettings}
          value={consent}
          onValueChange={setConsent}
        />
      </main>
    )
  },
}

/** A card in the corner instead of a bar. */
export const Corner: Story = {
  args: { position: 'bottom-start' },
  parameters: { layout: 'fullscreen', docs: { story: { inline: false, height: '360px' } } },
  render: (args) => (
    <div className="h-[360px]">
      <CookieConsent {...args} />
    </div>
  ),
}

/** Your own categories and wording. */
export const CustomCategories: Story = {
  args: {
    title: 'Cookies on this site',
    description: 'We only measure visits, and only if you agree.',
    categories: [
      { id: 'essential', name: 'Essential', required: true, description: 'Your session.' },
      { id: 'stats', name: 'Visit statistics', description: 'Anonymous, kept 13 months.' },
    ],
  },
}

/** Stored choices are read back once, where they enter: unknown ids dropped, required ones on. */
export const ReadingStoredChoices: Story = {
  render: () => {
    const categories = [
      { id: 'necessary', name: 'Necessary', required: true },
      { id: 'analytics', name: 'Analytics' },
    ]
    const stored = '{"analytics":true,"ads":true}'
    return (
      <pre className="m-0 rounded-md bg-inset p-4 font-mono text-[12.5px] text-foreground">
        {JSON.stringify(parseConsent(stored, categories))}
      </pre>
    )
  },
}

export const French: Story = { globals: { locale: 'fr' } }

export const Phone: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } }
