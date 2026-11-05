import type { Meta, StoryObj } from '@storybook/react-vite'
import { Share2Icon } from 'lucide-react'
import * as React from 'react'

import { ShareDialog, type ShareVisibility } from '@/components/share-dialog'
import { Button } from '@/components/ui/button'

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })

// Codes and links come from the app's server; these stand in for them.
const LINKS = ['https://uml.coreloom.dev/s/k7Qp2Rw9', 'https://uml.coreloom.dev/s/Vn4xT8bM']
const CODES = ['H7KM-3QPX', 'R2WN-8DTF']

/** A share button and the dialog, with the app's state faked: each change takes 600 ms. */
function Demo({
  title = 'Checkout',
  initial = 'private',
  failNext = false,
  open: startOpen = true,
  ...rest
}: Partial<React.ComponentProps<typeof ShareDialog>> & {
  initial?: ShareVisibility
  /** The next change fails, to show the revert. */
  failNext?: boolean
}) {
  const [open, setOpen] = React.useState(startOpen)
  const [visibility, setVisibility] = React.useState<ShareVisibility>(initial)
  const [link, setLink] = React.useState(0)
  const [code, setCode] = React.useState(0)
  const [fail, setFail] = React.useState(failNext)
  return (
    <>
      <Button
        type="button"
        variant="secondary"
        onClick={() => {
          setOpen(true)
        }}
      >
        <Share2Icon aria-hidden />
        Share
      </Button>
      <ShareDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        visibility={visibility}
        onVisibilityChange={async (next) => {
          await wait(600)
          if (fail) {
            setFail(false)
            throw new Error('Network error')
          }
          setVisibility(next)
        }}
        link={LINKS[link % LINKS.length]}
        code={CODES[code % CODES.length]}
        onRegenerateLink={async () => {
          await wait(600)
          setLink((n) => n + 1)
        }}
        onRegenerateCode={async () => {
          await wait(600)
          setCode((n) => n + 1)
        }}
        {...rest}
      />
    </>
  )
}

const meta = {
  title: 'Blocks/Sharing/Share dialog',
  component: ShareDialog,
  tags: ['autodocs'],
  args: {
    open: true,
    onOpenChange: () => undefined,
    title: 'Checkout',
    visibility: 'public',
    onVisibilityChange: () => wait(600),
    link: LINKS[0],
    code: CODES[0],
  },
  argTypes: {
    visibility: { control: 'inline-radio', options: ['private', 'public', 'protected'] },
    pending: { control: 'boolean' },
    error: { control: 'text' },
  },
  parameters: {
    layout: 'padded',
    docs: {
      story: { inline: false, height: '640px' },
      description: {
        component:
          'Who can open a document: only its owner, anyone with the link, or the link and a code. The consumer passes `visibility`, `link` and `code`, and applies a choice in `onVisibilityChange` (a promise: the card spins until it settles, and a rejection puts the old choice back). `onRegenerateLink` and `onRegenerateCode` make a new link or code, after a confirmation. "Copy link and code" copies a short message ready to send.',
      },
    },
  },
} satisfies Meta<typeof ShareDialog>
export default meta
type Story = StoryObj<typeof meta>

export const Private: Story = {
  render: () => <Demo initial="private" />,
}

export const Public: Story = {
  render: () => <Demo initial="public" />,
}

export const Protected: Story = {
  render: () => <Demo initial="protected" />,
}

/** The next change fails: the choice goes back and the dialog says so. */
export const ChangeFails: Story = {
  render: () => <Demo initial="public" failNext />,
}

/** The app is still loading the settings: the choices wait. */
export const Pending: Story = {
  render: () => <Demo initial="public" pending />,
}

export const LoadError: Story = {
  render: () => (
    <Demo initial="protected" error="Couldn’t load the sharing settings. Check your connection." />
  ),
}

export const LongTitle: Story = {
  render: () => (
    <Demo
      initial="protected"
      title="Payments platform: services, queues and the reconciliation jobs between them"
    />
  ),
}

export const French: Story = {
  globals: { locale: 'fr' },
  render: () => <Demo title="Paiement" initial="protected" />,
}

export const Phone: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => <Demo initial="protected" />,
}
