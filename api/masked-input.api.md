# @coreloom/masked-input

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/masked-input.tsx

```ts
function applyMask(text: string, mask: Mask) => { formatted: string; raw: string; }
function isValidIban(raw: string) => boolean
function isValidLuhn(digits: string) => boolean
type Mask = string | ((raw: string) => string)
function MaskedInput
MaskedInput.preset?: 'iban' | 'card' | 'siren' | 'siret' | undefined
MaskedInput.mask?: Mask | undefined
MaskedInput.validate?: ((raw: string) => boolean) | undefined
MaskedInput.value?: string | undefined
MaskedInput.defaultValue?: string | undefined
MaskedInput.onValueChange?: ((raw: string, details: { formatted: string; complete: boolean; }) => void) | undefined
MaskedInput.invalidMessage?: string | undefined
MaskedInput.onBlur?: (() => void) | undefined
MaskedInput.aria-invalid?: boolean | 'true' | 'false' | undefined
MaskedInput.*: react
function maskLength(mask: Mask, raw?: string) => number
type MaskPreset = {}
MaskPreset.mask: Mask
MaskPreset.validate?: ((raw: string) => boolean) | undefined
MaskPreset.inputMode: 'text' | 'numeric'
MaskPreset.autoComplete?: string | undefined
MaskPreset.placeholder?: string | undefined
const maskPresets: {}
maskPresets.iban: {}
maskPresets.iban.mask: (raw: string) => string
maskPresets.iban.validate: (raw: string) => boolean
maskPresets.iban.inputMode: 'text'
maskPresets.iban.autoComplete: string
maskPresets.iban.placeholder: string
maskPresets.card: {}
maskPresets.card.mask: string
maskPresets.card.validate: (digits: string) => boolean
maskPresets.card.inputMode: 'numeric'
maskPresets.card.autoComplete: string
maskPresets.card.placeholder: string
maskPresets.siren: {}
maskPresets.siren.mask: string
maskPresets.siren.validate: (digits: string) => boolean
maskPresets.siren.inputMode: 'numeric'
maskPresets.siren.placeholder: string
maskPresets.siret: {}
maskPresets.siret.mask: string
maskPresets.siret.validate: (digits: string) => boolean
maskPresets.siret.inputMode: 'numeric'
maskPresets.siret.placeholder: string
```
