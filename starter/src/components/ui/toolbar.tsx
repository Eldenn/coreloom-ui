'use client'

// Coreloom UI — Toolbar. A row of tools for one thing on screen: text formatting above an editor,
// zoom and layout above a canvas, actions above a table. It is one Tab stop, and the arrow keys
// move between its tools (Home and End to the ends). Buttons, toggles (one or several on),
// links, separators, and a "More" menu for the tools that don't fit.
//
//   <Toolbar aria-label="Formatting">
//     <ToolbarToggleGroup type="multiple" aria-label="Style">
//       <ToolbarToggleItem value="bold" aria-label="Bold"><BoldIcon /></ToolbarToggleItem>
//     </ToolbarToggleGroup>
//     <ToolbarSeparator />
//     <ToolbarButton><LinkIcon /> Link</ToolbarButton>
//   </Toolbar>
import { MoreHorizontalIcon } from 'lucide-react'
import { Toolbar as ToolbarPrimitive } from 'radix-ui'
import * as React from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const toolClass =
  "inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-sm px-2.5 font-sans text-[13px] font-medium whitespace-nowrap text-fg-secondary outline-none transition-colors duration-fast select-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring disabled:pointer-events-none disabled:text-faint-foreground has-[>svg:only-child]:w-8 has-[>svg:only-child]:px-0 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

function Toolbar({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.Root> & {
  /** default: a bordered bar; plain: no border or background, inside your own surface. */
  variant?: 'default' | 'plain'
}) {
  return (
    <ToolbarPrimitive.Root
      data-slot="toolbar"
      data-variant={variant}
      className={cn(
        'flex min-w-0 items-center gap-0.5 font-sans data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch',
        variant === 'default' && 'rounded-md border border-border bg-surface p-1 shadow-xs',
        className,
      )}
      {...props}
    />
  )
}

/** A tool's name in a tooltip; the button keeps it as its accessible name too. */
function WithTooltip({
  tooltip,
  children,
}: {
  tooltip?: React.ReactNode
  children: React.ReactElement
}) {
  if (!tooltip) return children
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  )
}

function ToolbarButton({
  className,
  tooltip,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.Button> & {
  /** Shown on hover and focus; useful for icon-only tools (still pass an aria-label). */
  tooltip?: React.ReactNode
}) {
  return (
    <WithTooltip tooltip={tooltip}>
      <ToolbarPrimitive.Button
        data-slot="toolbar-button"
        className={cn(toolClass, className)}
        {...props}
      />
    </WithTooltip>
  )
}

function ToolbarLink({ className, ...props }: React.ComponentProps<typeof ToolbarPrimitive.Link>) {
  return (
    <ToolbarPrimitive.Link
      data-slot="toolbar-link"
      className={cn(toolClass, 'text-primary-text hover:text-primary-text', className)}
      {...props}
    />
  )
}

function ToolbarToggleGroup({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.ToggleGroup>) {
  return (
    <ToolbarPrimitive.ToggleGroup
      data-slot="toolbar-toggle-group"
      className={cn('flex items-center gap-0.5', className)}
      {...props}
    />
  )
}

function ToolbarToggleItem({
  className,
  tooltip,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.ToggleItem> & { tooltip?: React.ReactNode }) {
  return (
    <WithTooltip tooltip={tooltip}>
      <ToolbarPrimitive.ToggleItem
        data-slot="toolbar-toggle-item"
        className={cn(
          toolClass,
          // aria-* rather than data-state: a tooltip trigger replaces data-state with its own.
          'aria-checked:bg-primary-subtle aria-checked:text-primary-text aria-pressed:bg-primary-subtle aria-pressed:text-primary-text',
          className,
        )}
        {...props}
      />
    </WithTooltip>
  )
}

function ToolbarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.Separator>) {
  return (
    <ToolbarPrimitive.Separator
      data-slot="toolbar-separator"
      className={cn(
        'mx-1 h-5 w-px shrink-0 bg-border [[data-orientation=vertical]_&]:mx-0 [[data-orientation=vertical]_&]:my-1 [[data-orientation=vertical]_&]:h-px [[data-orientation=vertical]_&]:w-auto',
        className,
      )}
      {...props}
    />
  )
}

/** Pushes the tools after it to the far end. */
function ToolbarSpacer({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="toolbar-spacer" aria-hidden className={cn('flex-1', className)} {...props} />
  )
}

/**
 * A "More" button at the end opening a menu: put DropdownMenuItem elements in it, for the tools
 * that are hidden at small widths (give those `className="max-sm:hidden"`) or used rarely.
 */
function ToolbarOverflow({
  label,
  children,
  className,
  align = 'end',
}: {
  /** The button's name; "More" by default. */
  label?: string
  children: React.ReactNode
  className?: string
  align?: 'start' | 'center' | 'end'
}) {
  const t = useCoreloomI18n().messages.utility.toolbar
  return (
    <DropdownMenu>
      <ToolbarPrimitive.Button asChild>
        <DropdownMenuTrigger
          data-slot="toolbar-overflow"
          aria-label={label ?? t.more}
          className={cn(toolClass, 'w-8 px-0', className)}
        >
          <MoreHorizontalIcon />
        </DropdownMenuTrigger>
      </ToolbarPrimitive.Button>
      <DropdownMenuContent align={align}>{children}</DropdownMenuContent>
    </DropdownMenu>
  )
}

export {
  Toolbar,
  ToolbarButton,
  ToolbarLink,
  ToolbarOverflow,
  ToolbarSeparator,
  ToolbarSpacer,
  ToolbarToggleGroup,
  ToolbarToggleItem,
}
