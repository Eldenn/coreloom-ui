"use client"

// Coreloom UI — DatePicker. A date field: Popover + Calendar, following shadcn's date-picker
// pattern. The value is a Date (or undefined); the label is formatted with date-fns.
import * as React from "react"
import { format, type Locale } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useCoreloomI18n } from "@/lib/i18n"

function DatePicker({
  value,
  defaultValue,
  onValueChange,
  placeholder,
  formatString = "PPP",
  locale,
  disabled,
  className,
  id,
  calendarProps,
  "aria-invalid": ariaInvalid,
  "aria-label": ariaLabel,
}: {
  value?: Date
  defaultValue?: Date
  onValueChange?: (date: Date | undefined) => void
  placeholder?: string
  /** date-fns format string for the trigger label ("PPP" = "Oct 28th, 2026"). */
  formatString?: string
  /** date-fns locale, used for the label and the calendar (e.g. `fr` from "date-fns/locale"). */
  locale?: Locale
  disabled?: boolean
  className?: string
  id?: string
  /** Passed to Calendar: disabled days, locale, startMonth / endMonth, captionLayout… */
  calendarProps?: Omit<React.ComponentProps<typeof Calendar>, "mode" | "selected" | "onSelect">
  "aria-invalid"?: boolean | "true" | "false"
  "aria-label"?: string
}) {
  const i18n = useCoreloomI18n()
  placeholder ??= i18n.messages.datePicker.placeholder
  locale ??= i18n.dateLocale as Locale | undefined
  const [open, setOpen] = React.useState(false)
  const [inner, setInner] = React.useState<Date | undefined>(defaultValue)
  const current = value !== undefined ? value : inner

  const pick = (next: Date | undefined) => {
    if (value === undefined) setInner(next)
    onValueChange?.(next)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          aria-invalid={ariaInvalid}
          aria-label={ariaLabel}
          disabled={disabled}
          data-slot="date-picker-trigger"
          data-placeholder={current ? undefined : ""}
          className={cn(
            "flex h-[42px] w-full cursor-pointer items-center gap-2.5 rounded-md border border-input bg-inset px-[13px] text-left font-sans text-[14px] whitespace-nowrap text-foreground transition-[border-color,box-shadow] duration-180 ease-out outline-none focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-55 aria-expanded:border-primary aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive-subtle aria-invalid:focus-visible:ring-destructive/70 data-[placeholder]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0",
            className
          )}
        >
          <CalendarIcon className="size-4 text-muted-foreground" />
          <span className="truncate">{current ? format(current, formatString, { locale }) : placeholder}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={current}
          onSelect={pick}
          defaultMonth={current}
          autoFocus
          locale={locale}
          {...calendarProps}
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }
