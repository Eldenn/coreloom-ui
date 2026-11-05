import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { AccessCodeGate } from '@/components/access-code-gate'
import { AuthLayout } from '@/components/auth-layout'

// The screenshots freeze the clock at this moment.
const NOW = new Date('2026-10-14T10:00:00+02:00')
const inMinutes = (minutes: number) => new Date(NOW.getTime() + minutes * 60_000)

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })

const brand = (
  <span className="font-display text-[20px] font-bold tracking-[-0.03em] text-foreground">
    Core<span className="text-primary-text">loom</span>
  </span>
)

/** The app's side, faked: the right code is H7KM3QPX; three wrong ones lock it for 5 minutes. */
function Demo() {
  const [attemptsLeft, setAttemptsLeft] = React.useState(3)
  const [error, setError] = React.useState<string>()
  const [lockedUntil, setLockedUntil] = React.useState<Date>()
  const [opened, setOpened] = React.useState(false)
  if (opened)
    return (
      <p className="text-center text-[14px] text-foreground" role="status">
        Opening “Checkout”…
      </p>
    )
  return (
    <AccessCodeGate
      title="Checkout"
      attemptsLeft={attemptsLeft}
      error={error}
      lockedUntil={lockedUntil}
      onSubmit={async (code) => {
        await wait(600)
        if (code === 'H7KM3QPX') {
          setOpened(true)
          return
        }
        const left = attemptsLeft - 1
        setAttemptsLeft(left === 0 ? 3 : left)
        setError('That code didn’t work. Check it and try again.')
        if (left === 0) setLockedUntil(new Date(Date.now() + 5 * 60_000))
      }}
    />
  )
}

const meta = {
  title: 'Blocks/Sharing/Access code gate',
  component: AccessCodeGate,
  tags: ['autodocs'],
  args: {
    title: 'Checkout',
    onSubmit: () => wait(600),
  },
  argTypes: {
    length: { control: { type: 'number', min: 4, max: 12 } },
    attemptsLeft: { control: 'number' },
    pending: { control: 'boolean' },
    error: { control: 'text' },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The screen in front of a protected link, in `AuthLayout`. The consumer checks the code in `onSubmit` (a promise; a rejection means a wrong code) and passes `error`, `attemptsLeft` and `lockedUntil` back. Letters are upper-cased, characters outside `alphabet` are ignored, a pasted code fills every box, and the code is sent as soon as the last box is filled.',
      },
    },
  },
  decorators: [
    (Story) => (
      <AuthLayout brand={brand} footer="Shared with Coreloom UML.">
        <Story />
      </AuthLayout>
    ),
  ],
} satisfies Meta<typeof AccessCodeGate>
export default meta
type Story = StoryObj<typeof meta>

/** Try H7KM3QPX, or three wrong codes to see the lock. */
export const Default: Story = {
  render: () => <Demo />,
}

export const WrongCode: Story = {
  args: { error: 'That code didn’t work. Check it and try again.', attemptsLeft: 2 },
}

/** The app is checking the code. */
export const Checking: Story = {
  args: { pending: true },
  render: (args) => (
    <div data-frozen>
      <AccessCodeGate {...args} />
    </div>
  ),
}

export const Locked: Story = {
  args: { lockedUntil: inMinutes(4.5), attemptsLeft: 0 },
}

/** Six digits only: `length` and `alphabet` change the boxes and what they accept. */
export const SixDigits: Story = {
  args: { length: 6, alphabet: '0123456789' },
}

export const LongTitle: Story = {
  args: {
    title: 'Payments platform: services, queues and the reconciliation jobs between them',
    attemptsLeft: 3,
  },
}

export const French: Story = {
  globals: { locale: 'fr' },
  args: { title: 'Paiement', attemptsLeft: 2, error: 'Ce code ne fonctionne pas.' },
}

export const FrenchLocked: Story = {
  globals: { locale: 'fr' },
  args: { title: 'Paiement', lockedUntil: inMinutes(4.5) },
}

export const Phone: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: { attemptsLeft: 3 },
}
