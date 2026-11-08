# Newsletter

> **Experimental.** This item may still change in a minor release, with an **Upgrading** note in the changelog. See [VERSIONING.md](https://github.com/Eldenn/coreloom-ui/blob/main/VERSIONING.md).

Collect an email address. `NewsletterForm` signs someone up to a newsletter; `Waitlist` puts them in line for a launch and can show their place and a link to share. The app does the sending; the form checks the address, shows the wait and the error, then a thank-you.

**The consumer provides** `onSubscribe(email)` (`NewsletterForm`) or `onJoin(email)` (`Waitlist`), which may return a promise. Throw an `Error` to show its message ("This address is already subscribed."); anything else shows a generic line. `onJoin` may return `{ position, referralUrl }`.

**`NewsletterForm` takes** `onSubscribe`, `title`, `description`, `placeholder`, `submitLabel` (default "Subscribe"), `note` (a line under the field: how often you write, your privacy policy), `successMessage` and `variant` (`inline` or `card`).

**`Waitlist` takes** `onJoin`, `title`, `description`, `count` ("1,204 people are waiting"), `avatars` (a few portraits' URLs beside it), `placeholder`, `submitLabel` (default "Join the waitlist"), `note` and `variant`.

- The field has a label (visually hidden), `type="email"` and `autocomplete="email"`. An empty or malformed address is refused before your callback runs, with the reason tied to the field.
- Errors are announced; the thank-you replaces the form and takes focus, so it is read at once.
- Ask for the address only: a name or a company can come later. Say how often you write.
- Use double opt-in for a newsletter (the default thank-you asks to confirm by email).

**In an app:** `pnpm dlx shadcn@latest add @coreloom/newsletter`.
