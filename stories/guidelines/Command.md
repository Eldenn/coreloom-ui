# Command

Searchable command list — the ⌘K palette of Coreloom products and docs.

**The consumer provides** `<Command>` (inline) or `<CommandDialog open onOpenChange>` (the palette) holding a `<CommandInput placeholder>`, a `<CommandList>` with `<CommandEmpty>`, `<CommandGroup heading>`s of `<CommandItem onSelect>` (a Lucide icon first, a `<CommandShortcut>` last) and `<CommandSeparator>`s. Wire ⌘K / Ctrl-K yourself to open the dialog.

- `surface-1` with a `border-subtle` rule under the 56px search row; group headings mono 11px uppercase; items 14px in `fg-2`, the highlighted one on `surface-hover` in `fg-1` with its icon in `accent`. As a dialog it sits 12vh from the top, 560px wide, over the `scrim` — the layout of the UI kit's palette.
- Filtering, ranking and arrow / Enter navigation come from `cmdk`; Escape closes the dialog. Separators are hidden from assistive tech so the listbox only holds options and groups.
- Name items as destinations or verbs ("Quick start", "Toggle theme"). The empty state says what was searched: "No components match that search."

**In an app:** `pnpm dlx shadcn@latest add @coreloom/command` and import from `@/components/ui/command`.
