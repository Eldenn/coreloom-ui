# @coreloom/command-menu

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/command-menu.tsx

```ts
function CommandMenu
CommandMenu.groups: CommandMenuGroup[]
CommandMenu.placeholder?: string | undefined
CommandMenu.triggerLabel?: string | undefined
CommandMenu.emptyText?: string | undefined
CommandMenu.onAskAi?: ((query: string) => void) | undefined
CommandMenu.shortcut?: boolean | undefined
CommandMenu.className?: string | undefined
type CommandMenuGroup = {}
CommandMenuGroup.heading: string
CommandMenuGroup.items: CommandMenuItem[]
type CommandMenuItem = {}
CommandMenuItem.label: string
CommandMenuItem.icon?: IconLike | undefined
CommandMenuItem.shortcut?: string | undefined
CommandMenuItem.keywords?: string[] | undefined
CommandMenuItem.onSelect: () => void
```
