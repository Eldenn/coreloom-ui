# @coreloom/theme-toggle

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/theme-toggle.tsx

```ts
type Accent = 'violet' | 'blue' | 'cyan' | 'amber' | 'rose'
function AccentPicker
AccentPicker.accents?: readonly ('violet' | 'blue' | 'cyan' | 'amber' | 'rose')[] | undefined
AccentPicker.*: @radix-ui/react-primitive | @radix-ui/react-radio-group | react
const ACCENTS: readonly ['cyan', 'blue', 'violet', 'amber', 'rose']
type Theme = 'dark' | 'light'
function ThemeMenu
ThemeMenu.className?: string | undefined
ThemeMenu.align?: 'end' | 'center' | 'start' | undefined
type ThemePreference = Theme | 'system'
function ThemeToggle
ThemeToggle.className?: string | undefined
function useAccent() => { accent: 'violet' | 'blue' | 'cyan' | 'amber' | 'rose'; setAccent: (next: Accent) => void; }
function useTheme() => { theme: Theme; preference: ThemePreference; setTheme: (next: ThemePreference) => void; toggleTheme: () => void; }
```
