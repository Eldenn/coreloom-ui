# @coreloom/phone-input

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/phone-input.tsx

```ts
function isValidPhone(value: string) => boolean
function parsePhone(value: string, prefer?: string) => { country?: PhoneCountry; national: string; }
const PHONE_COUNTRIES: PhoneCountry[]
type PhoneCountry = {}
PhoneCountry.code: string
PhoneCountry.dial: string
PhoneCountry.length: [number, number]
PhoneCountry.groups?: number[] | undefined
PhoneCountry.trunk?: string | undefined
function PhoneInput
PhoneInput.value?: string | undefined
PhoneInput.defaultValue?: string | undefined
PhoneInput.onValueChange?: ((value: string) => void) | undefined
PhoneInput.defaultCountry?: string | undefined
PhoneInput.countries?: PhoneCountry[] | undefined
PhoneInput.placeholder?: string | undefined
PhoneInput.disabled?: boolean | undefined
PhoneInput.className?: string | undefined
PhoneInput.id?: string | undefined
PhoneInput.name?: string | undefined
PhoneInput.onBlur?: (() => void) | undefined
PhoneInput.aria-invalid?: boolean | 'true' | 'false' | undefined
PhoneInput.aria-label?: string | undefined
PhoneInput.aria-describedby?: string | undefined
```
