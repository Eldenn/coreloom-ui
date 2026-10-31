'use client'

// Coreloom UI — CommandMenu block part. The ⌘K palette: a search button for the header and a
// CommandDialog bound to ⌘K / Ctrl+K. Items are plain data; navigate or act in onSelect. With
// `onAskAi`, what you type can also go to an assistant: "Ask AI: “…”" comes first in the list.
import { defaultFilter } from 'cmdk'
import { type LucideIcon, SearchIcon, SparklesIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { Kbd } from '@/components/ui/kbd'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

/** A Lucide icon component (`HomeIcon`) or an element (`<HomeIcon />`): elements also cross the
 *  server → client boundary in Next.js, components don't. */
type IconLike = LucideIcon | React.ReactElement

function renderIcon(icon: IconLike | undefined) {
  if (!icon) return null
  // A component (function, forwardRef or memo, like Lucide's icons) is rendered here. Anything
  // else is already a node: an element, or what a server component's element became on the way to
  // the client (React dedupes repeated elements into lazy references).
  const kind = (icon as { $$typeof?: symbol }).$$typeof
  if (
    typeof icon === 'function' ||
    kind === Symbol.for('react.forward_ref') ||
    kind === Symbol.for('react.memo')
  ) {
    const Icon = icon as LucideIcon
    return <Icon />
  }
  return icon as React.ReactNode
}

interface CommandMenuItem {
  label: string
  icon?: IconLike
  shortcut?: string
  keywords?: string[]
  onSelect: () => void
}

// The Ask AI item always ranks first: cmdk reorders by score, so it gets the top score and every other
// score is scaled just below it (scaled, not capped, so an exact match still beats a near one).
const ASK_AI = 'coreloom-ask-ai'
const rank = (value: string, search: string, keywords?: string[]) =>
  value === ASK_AI ? 1 : defaultFilter(value, search, keywords) * 0.99

interface CommandMenuGroup {
  heading: string
  items: CommandMenuItem[]
}

function CommandMenu({
  groups,
  placeholder,
  triggerLabel,
  emptyText,
  onAskAi,
  className,
}: {
  groups: CommandMenuGroup[]
  placeholder?: string
  triggerLabel?: string
  emptyText?: string
  /** Offers the typed text to an assistant ("Ask AI: “…”", first in the list). Gets the trimmed query; the palette closes. */
  onAskAi?: (query: string) => void
  className?: string
}) {
  const t = useCoreloomI18n().messages
  placeholder ??= t.commandMenu.placeholder
  triggerLabel ??= t.commandMenu.trigger
  emptyText ??= t.commandMenu.empty
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const query = search.trim()

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  // Each opening starts from an empty search, as the uncontrolled input did.
  React.useEffect(() => {
    if (!open) setSearch('')
  }, [open])

  return (
    <>
      <Button
        variant="outline"
        onClick={() => {
          setOpen(true)
        }}
        className={cn(
          'hidden h-8 w-56 justify-between px-3 font-normal text-muted-foreground md:inline-flex lg:w-64',
          className,
        )}
      >
        <span className="flex items-center gap-2">
          <SearchIcon className="size-[15px]" />
          {triggerLabel}
        </span>
        <Kbd>⌘K</Kbd>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => {
          setOpen(true)
        }}
        aria-label={triggerLabel}
      >
        <SearchIcon />
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title={triggerLabel}
        filter={onAskAi ? rank : undefined}
      >
        <CommandInput placeholder={placeholder} value={search} onValueChange={setSearch} />
        <CommandList>
          <CommandEmpty>{emptyText}</CommandEmpty>
          {onAskAi && query && (
            <CommandGroup>
              <CommandItem
                value={ASK_AI}
                onSelect={() => {
                  setOpen(false)
                  onAskAi(query)
                }}
              >
                <SparklesIcon className="text-primary-text" />
                <span className="min-w-0 truncate">{t.commandMenu.askAi(query)}</span>
              </CommandItem>
            </CommandGroup>
          )}
          {groups.map((group, i) => (
            <React.Fragment key={group.heading}>
              {i > 0 && <CommandSeparator />}
              <CommandGroup heading={group.heading}>
                {group.items.map((item) => (
                  <CommandItem
                    key={item.label}
                    keywords={item.keywords}
                    onSelect={() => {
                      setOpen(false)
                      item.onSelect()
                    }}
                  >
                    {renderIcon(item.icon)}
                    {item.label}
                    {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
                  </CommandItem>
                ))}
              </CommandGroup>
            </React.Fragment>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}

export { CommandMenu, type CommandMenuGroup, type CommandMenuItem }
