import type { Meta, StoryObj } from '@storybook/react-vite'

import { NewsletterForm, Waitlist } from '@/components/newsletter'

/** A fake request: refuses one address, accepts the others after a short wait. */
const subscribe = (email: string) =>
  new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      if (email === 'taken@coreloom.dev') reject(new Error('This address is already subscribed.'))
      else resolve()
    }, 600)
  })

const join = () =>
  new Promise<{ position: number; referralUrl: string }>((resolve) => {
    setTimeout(() => {
      resolve({ position: 1205, referralUrl: 'https://coreloom.dev/r/k7f2q' })
    }, 600)
  })

const meta = {
  title: 'Blocks/Newsletter',
  component: NewsletterForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Collect an email address. `NewsletterForm` signs someone up (`onSubscribe`); `Waitlist` puts them in line (`onJoin`, which may return their `position` and a `referralUrl` to share). The form checks the address, shows the wait and the error the callback throws, then a thank-you that takes focus. Try taken@coreloom.dev to see an error.',
      },
    },
  },
  args: {
    onSubscribe: subscribe,
    title: 'The Coreloom letter',
    description: 'New components and what we learned building them. Twice a month, no spam.',
    note: 'Unsubscribe in one click. We never share your address.',
  },
} satisfies Meta<typeof NewsletterForm>
export default meta
type Story = StoryObj<typeof meta>

export const Inline: Story = {
  render: (args) => (
    <div className="max-w-xl">
      <NewsletterForm {...args} />
    </div>
  ),
}

/** On a card, for a sidebar or the end of an article. */
export const OnCard: Story = {
  render: (args) => (
    <div className="max-w-md">
      <NewsletterForm {...args} variant="card" />
    </div>
  ),
}

/** A launch waitlist with how many people are waiting; joining shows the place in line and a link to share. */
export const WaitlistForm: Story = {
  render: () => (
    <div className="max-w-xl">
      <Waitlist
        onJoin={join}
        variant="card"
        title="Coreloom Cloud is coming"
        description="Hosted previews of your design system, shared with one link. Join to get early access."
        count={1204}
      />
    </div>
  ),
}

export const French: Story = {
  globals: { locale: 'fr' },
  render: () => (
    <div className="max-w-md">
      <NewsletterForm
        onSubscribe={subscribe}
        variant="card"
        title="La lettre Coreloom"
        description="Les nouveaux composants et ce que nous avons appris. Deux fois par mois."
      />
    </div>
  ),
}

export const Phone: Story = {
  ...Inline,
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}
