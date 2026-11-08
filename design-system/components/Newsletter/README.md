# Newsletter

An email sign-up for a newsletter or a launch waitlist. Experimental.

**Install** `pnpm dlx shadcn@latest add @coreloom/newsletter`. It writes `newsletter.tsx`.

**The consumer provides** `onSubscribe(email)` (`NewsletterForm`) or `onJoin(email)` (`Waitlist`, may return `{ position, referralUrl }`). Throw an `Error` to show its message.

- The address is checked first; the thank-you replaces the form and takes focus.

_On `window.CoreloomUIDesignSystem_ff5f32` as `NewsletterForm`, `Waitlist`._
