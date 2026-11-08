# @coreloom/cookie-consent

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/cookie-consent.tsx

```ts
function acceptAll(categories: ConsentCategory[]) => ConsentChoices
type ConsentCategory = {}
ConsentCategory.id: string
ConsentCategory.name: React.ReactNode
ConsentCategory.description?: React.ReactNode
ConsentCategory.required?: boolean | undefined
type ConsentChoices = { [x: string]: boolean; }
function CookieConsent
CookieConsent.value: ConsentChoices | null | undefined
CookieConsent.onValueChange: (choices: ConsentChoices) => void
CookieConsent.categories?: ConsentCategory[] | undefined
CookieConsent.title?: React.ReactNode
CookieConsent.description?: React.ReactNode
CookieConsent.policyHref?: string | undefined
CookieConsent.position?: 'bottom' | 'inline' | 'bottom-start' | undefined
CookieConsent.className?: string | undefined
function CookiePreferences
CookiePreferences.open: boolean
CookiePreferences.onOpenChange: (open: boolean) => void
CookiePreferences.value?: ConsentChoices | null | undefined
CookiePreferences.onValueChange: (choices: ConsentChoices) => void
CookiePreferences.categories?: ConsentCategory[] | undefined
CookiePreferences.onCloseAutoFocus?: ((event: Event) => void) | undefined
function parseConsent(raw: unknown, categories: ConsentCategory[]) => ConsentChoices | null
function rejectAll(categories: ConsentCategory[]) => ConsentChoices
```
