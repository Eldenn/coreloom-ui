"use client"

// Coreloom UI — Combobox. A searchable Select, composed from Popover + Command (Radix + cmdk),
// following shadcn's combobox pattern. Single value; for several, compose the same parts.
import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type ComboboxOption = {
  value: string
  label: string
  /** Shown before the label (a Lucide icon, an Avatar…). */
  icon?: React.ReactNode
  /** Extra words the search should match. */
  keywords?: string[]
  disabled?: boolean
}

function Combobox({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyText = "No results.",
  disabled,
  className,
  contentClassName,
  id,
  "aria-invalid": ariaInvalid,
  "aria-label": ariaLabel,
}: {
  options: ComboboxOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: React.ReactNode
  disabled?: boolean
  className?: string
  contentClassName?: string
  id?: string
  "aria-invalid"?: boolean | "true" | "false"
  "aria-label"?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [inner, setInner] = React.useState(defaultValue ?? "")
  const current = value !== undefined ? value : inner
  const selected = options.find((o) => o.value === current)

  const pick = (next: string) => {
    if (value === undefined) setInner(next)
    onValueChange?.(next)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          id={id}
          aria-expanded={open}
          aria-invalid={ariaInvalid}
          aria-label={ariaLabel}
          disabled={disabled}
          data-slot="combobox-trigger"
          data-placeholder={selected ? undefined : ""}
          className={cn(
            "flex h-[42px] w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-input bg-inset px-[13px] font-sans text-[14px] whitespace-nowrap text-foreground transition-[border-color,box-shadow] duration-180 ease-out outline-none focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-55 aria-expanded:border-primary aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive-subtle aria-invalid:focus-visible:ring-destructive/70 data-[placeholder]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
            className
          )}
        >
          <span className="flex min-w-0 items-center gap-2 truncate">
            {selected?.icon}
            {selected ? selected.label : placeholder}
          </span>
          <ChevronsUpDownIcon className="text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className={cn("w-(--radix-popover-trigger-width) min-w-56 p-0", contentClassName)}
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  keywords={[option.label, ...(option.keywords ?? [])]}
                  disabled={option.disabled}
                  onSelect={() => pick(option.value)}
                >
                  {option.icon}
                  <span className="truncate">{option.label}</span>
                  <CheckIcon
                    className={cn(
                      "ml-auto text-primary",
                      option.value === current ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export { Combobox, type ComboboxOption }
