# DescriptionList

Labels and their values, to read: a customer's details, an invoice's summary, a server's settings, the properties of a record.

**The consumer provides** `items` (`{ term, value?, copy?, hint?, wide? }`) or `DescriptionItem` children (`term`, the value as children, `copy`, `hint`, `wide`), and a `layout`: `stacked` (label above value, the default), `inline` (label beside value, in rows) or `grid` (stacked, in `columns` of 2, 3 or 4).

- An empty value (`undefined`, `null`, `''`) says "Not set" in muted italics rather than leaving a hole, so people know the field exists and is empty.
- `copy` adds a Copy button for values people paste elsewhere: IDs, keys, emails. `hint` adds a small line under the value ("Renews on Jan 12").
- It renders a real `<dl>`, so screen readers pair each label with its value. Inline rows stack below the small breakpoint.
- For values people edit, use a form; for many records with the same fields, a table.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/description-list` and import from `@/components/ui/description-list`.
