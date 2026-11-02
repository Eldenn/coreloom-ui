# Banner

A message for the whole page or app, across its top: planned maintenance, a trial that ends soon, a failed payment, a new feature, read-only access.

**The consumer provides** the message as `children`, a `tone` (`neutral`, `primary`, `info`, `success`, `warning`, `danger`), and optionally a `title` (a few bold words), an `action` (a Button or a link), `onDismiss` (shows a close button), `icon` (or `null`) and `floating` (a rounded card instead of a full-width bar).

- Show one banner at a time, above the app's header or the page content. It stays until the situation changes or it is dismissed.
- Remember a dismissal yourself (per person and per message), and don't offer one for something that still blocks people, like a failed payment.
- One sentence, then one action. Say what happens and what to do: "Your last payment failed. Update your card before Oct 20."
- An Alert belongs to a section of a page; a toast confirms an action and goes away by itself.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/banner` and import from `@/components/ui/banner`.
