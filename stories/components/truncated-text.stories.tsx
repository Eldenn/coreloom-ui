import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { Highlight } from '@/components/ui/highlight'
import { Input } from '@/components/ui/input'
import { TruncatedText } from '@/components/ui/truncated-text'

const review =
  'We moved our whole team to the new workspace in an afternoon. The import kept our folders, comments and history, and the permissions mapped one to one. The only thing we had to redo was our automations, which took another hour. Support answered within minutes when a webhook failed, and the fix was on our side. Six weeks in, nobody wants to go back: search is fast, the mobile app works offline, and the weekly digest replaced two meetings.'

const pages = [
  'Écoles et universités : tarifs éducation',
  'Set up single sign-on (SAML, OIDC)',
  'Export your data to CSV or JSON',
  'Invite people and manage roles',
  'Billing: invoices, VAT and payment methods',
  'Connect Slack, GitHub and Linear',
]

const meta = {
  title: 'Components/Data display/Truncated text',
  component: TruncatedText,
  tags: ['autodocs'],
  args: { children: review },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A long text cut after `lines` (3), with Show more when it is actually cut. `Highlight` marks the searched terms in a text, ignoring case and accents.',
      },
    },
  },
} satisfies Meta<typeof TruncatedText>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-6 text-[14px] text-foreground">
      <TruncatedText>{review}</TruncatedText>
      <TruncatedText lines={2}>Short enough to fit: no button.</TruncatedText>
    </div>
  ),
}

export const Search: Story = {
  render: () => {
    const [query, setQuery] = React.useState('ecole export')
    return (
      <div className="flex max-w-md flex-col gap-4">
        <Input
          aria-label="Search the help center"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
          }}
        />
        <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[14px] text-foreground">
          {pages.map((page) => (
            <li key={page}>
              <Highlight text={page} query={query} />
            </li>
          ))}
        </ul>
      </div>
    )
  },
}
