# Cookie consent

> **Experimental.** This item may still change in a minor release, with an **Upgrading** note in the changelog. See [VERSIONING.md](https://github.com/Eldenn/coreloom-ui/blob/main/VERSIONING.md).

The banner that asks before a site sets cookies it doesn't strictly need, and the dialog where people choose category by category. "Reject all" and "Accept all" have the same weight, as data protection authorities expect; "Customize" opens the details.

**The consumer provides** `<CookieConsent value onValueChange categories title description policyHref position>`: `value` is the saved choices (`{ [categoryId]: boolean }`), and the banner shows while it is `null` or `undefined`; `onValueChange(choices)` receives every category's choice: save it, then load the scripts it allows. `categories` are `{ id, name, description?, required? }` (default: necessary, which is `required`, preferences, analytics and marketing). `policyHref` adds a link to your cookie policy. `position` is `bottom` (a bar, default), `bottom-start` (a card in the corner) or `inline` (in the flow).

**`CookiePreferences` takes** `open`, `onOpenChange`, `value`, `onValueChange`, `categories` and `onCloseAutoFocus`: open it from a "Cookie settings" link in your footer so people can change their mind.

- `parseConsent(stored, categories)` reads stored choices back (the JSON string or its value): unknown ids are dropped, required categories are on, and it returns `null` when nothing matches, so the banner asks again after you change the categories. `acceptAll` and `rejectAll` give the two shortcuts.
- The banner is a labelled region, not a modal: the page stays usable. When it goes, focus returns to where it was (or to `main`), never to the body.
- Each category is a switch with its description; required ones are locked on and say "Always on".
- Load nothing optional before a choice, and keep a way to change it.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/cookie-consent`.
