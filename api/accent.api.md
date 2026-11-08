# @coreloom/accent

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/lib/accent.ts

```ts
type AccentAdjustment = {}
AccentAdjustment.theme: Theme
AccentAdjustment.token: 'hover' | 'ringAlpha' | 'accent' | 'press' | 'fg' | 'on'
AccentAdjustment.from: string
AccentAdjustment.to: string
AccentAdjustment.message: string
type AccentCheck = {}
AccentCheck.theme: Theme
AccentCheck.pair: string
AccentCheck.ratio: number
AccentCheck.min: number
AccentCheck.pass: boolean
type AccentFamily = {}
AccentFamily.accent: string
AccentFamily.hover: string
AccentFamily.press: string
AccentFamily.fg: string
AccentFamily.on: string
AccentFamily.border: string
AccentFamily.ringAlpha: number
type AccentOptions = {}
AccentOptions.name?: string | undefined
AccentOptions.lightText?: 'dark' | 'white' | undefined
function accentVariables(theme: Theme, f: AccentFamily) => Record<string, string>
function contrastRatio(a: string, b: string) => number
function generateAccent(input: string, options?: AccentOptions) => GeneratedAccent
type GeneratedAccent = {}
GeneratedAccent.name: string
GeneratedAccent.input: string
GeneratedAccent.dark: AccentFamily
GeneratedAccent.light: AccentFamily
GeneratedAccent.checks: AccentCheck[]
GeneratedAccent.adjustments: AccentAdjustment[]
GeneratedAccent.pass: boolean
GeneratedAccent.css: string
function parseHex(value: string) => string | null
function toAccentName(value: string) => string
function toOklch(hex: string) => Oklch
```
