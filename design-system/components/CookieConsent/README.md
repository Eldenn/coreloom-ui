# Cookie consent

A cookie banner with equal "Reject all" and "Accept all", and a preferences dialog. Experimental.

**Install** `pnpm dlx shadcn@latest add @coreloom/cookie-consent`. It writes `cookie-consent.tsx`.

**The consumer provides** `<CookieConsent value onValueChange categories policyHref position>`: the banner shows while `value` is null; `onValueChange` gets `{ [category]: boolean }`. `parseConsent` reads stored choices back.

- Not a modal: the page stays usable, and focus returns where it was when the banner goes.

_On `window.CoreloomUIDesignSystem_ff5f32` as `CookieConsent`, `CookiePreferences`._
