"use client"

// Coreloom UI — CommandMenu block part. The ⌘K palette: a search button for the header and a
// CommandDialog bound to ⌘K / Ctrl+K. Items are plain data; navigate or act in onSelect.
import * as React from "react"
import { SearchIcon, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { Kbd } from "@/components/ui/kbd"

type CommandMenuItem = {
  label: string
  icon?: LucideIcon
  shortcut?: string
  keywords?: string[]
  onSelect: () => void
}

type CommandMenuGroup = {
  heading: string
  items: CommandMenuItem[]
}

function CommandMenu({
  groups,
  placeholder = "Type a command or search…",
  triggerLabel = "Search…",
  emptyText = "No results found.",
  className,
}: {
  groups: CommandMenuGroup[]
  placeholder?: string
  triggerLabel?: string
  emptyText?: string
  className?: string
}) {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className={cn(
          "hidden h-8 w-56 justify-between px-3 font-normal text-muted-foreground md:inline-flex lg:w-64",
          className
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
        onClick={() => setOpen(true)}
        aria-label={triggerLabel}
      >
        <SearchIcon />
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen} title={triggerLabel}>
        <CommandInput placeholder={placeholder} />
        <CommandList>
          <CommandEmpty>{emptyText}</CommandEmpty>
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
                    {item.icon && <item.icon />}
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
