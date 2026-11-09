# @coreloom/keyboard-shortcuts

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/keyboard-shortcuts.tsx

```ts
function formatHotkey(combo: string, apple?: boolean) => string[][]
function Hotkey
Hotkey.keys: string
Hotkey.className?: string | undefined
type HotkeyOptions = {}
HotkeyOptions.enabled?: boolean | undefined
HotkeyOptions.preventDefault?: boolean | undefined
HotkeyOptions.enableOnFormFields?: boolean | undefined
HotkeyOptions.event?: 'keydown' | 'keyup' | undefined
HotkeyOptions.target?: React.RefObject<HTMLElement | null> | undefined
function isApplePlatform() => boolean
function matchesHotkey(event: KeyboardEvent, hotkey: ParsedHotkey, apple?: boolean) => boolean
type ParsedHotkey = {}
ParsedHotkey.key: string
ParsedHotkey.mod: boolean
ParsedHotkey.ctrl: boolean
ParsedHotkey.meta: boolean
ParsedHotkey.alt: boolean
ParsedHotkey.shift: boolean
function parseHotkey(combo: string) => ParsedHotkey[]
type ShortcutGroup = {}
ShortcutGroup.title: React.ReactNode
ShortcutGroup.shortcuts: { keys: string; description: string; }[]
function ShortcutsDialog
ShortcutsDialog.open?: boolean | undefined
ShortcutsDialog.defaultOpen?: boolean | undefined
ShortcutsDialog.onOpenChange?: ((open: boolean) => void) | undefined
ShortcutsDialog.groups: ShortcutGroup[]
ShortcutsDialog.title?: React.ReactNode
ShortcutsDialog.description?: React.ReactNode
ShortcutsDialog.filter?: boolean | undefined
function useHotkeys(keys: string | readonly string[], handler: (event: KeyboardEvent, combo: string) => void, { enabled, preventDefault, enableOnFormFields, event, target, }?: HotkeyOptions) => void
```
