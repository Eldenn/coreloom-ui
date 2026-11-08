# @coreloom/newsletter

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/newsletter.tsx

```ts
function isEmail(value: string) => boolean
function NewsletterForm
NewsletterForm.onSubscribe: (email: string) => Promise<void> | void
NewsletterForm.title?: React.ReactNode
NewsletterForm.description?: React.ReactNode
NewsletterForm.placeholder?: string | undefined
NewsletterForm.submitLabel?: React.ReactNode
NewsletterForm.note?: React.ReactNode
NewsletterForm.successMessage?: React.ReactNode
NewsletterForm.variant?: 'card' | 'inline' | undefined
NewsletterForm.className?: string | undefined
function Waitlist
Waitlist.onJoin: (email: string) => Promise<WaitlistResult | undefined> | WaitlistResult | undefined
Waitlist.title?: React.ReactNode
Waitlist.description?: React.ReactNode
Waitlist.count?: number | undefined
Waitlist.avatars?: string[] | undefined
Waitlist.placeholder?: string | undefined
Waitlist.submitLabel?: React.ReactNode
Waitlist.note?: React.ReactNode
Waitlist.variant?: 'card' | 'inline' | undefined
Waitlist.className?: string | undefined
type WaitlistResult = {}
WaitlistResult.position?: number | undefined
WaitlistResult.referralUrl?: string | undefined
```
