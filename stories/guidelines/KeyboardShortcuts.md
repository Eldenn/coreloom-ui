# KeyboardShortcuts

Keyboard shortcuts for an app: running them (`useHotkeys`), drawing them (`Hotkey`) and listing them (`ShortcutsDialog`).

**The consumer provides** to `useHotkeys(keys, handler, options)` one or several combinations: "mod+k" (⌘ on a Mac, Ctrl elsewhere), "shift+?", or a sequence such as "g i"; options are `enabled`, `preventDefault`, `enableOnFormFields`, `event` and `target`. `Hotkey keys="mod+k"` draws a combination; `ShortcutsDialog` takes `groups` of `{ keys, description }`, `open` and `onOpenChange` (or `defaultOpen`).

- Single keys and sequences don't fire while someone types in a field; combinations with Ctrl, ⌘ or Alt do.
- Open the list with "?" and from a help menu, so people who don't know the shortcut can find it.
- Don't take the browser's or the screen reader's keys (⌘L, ⌘T, Ctrl+Tab, single letters while reading), and offer a way to turn single-key shortcuts off.
- Show a shortcut next to its action (menus, tooltips) with `Hotkey`, so people learn it.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/keyboard-shortcuts` and import from `@/components/ui/keyboard-shortcuts`.
