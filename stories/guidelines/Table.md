# Table

Data table with mono headers, quiet rows and row states.

**The consumer provides** `<Table>` → `<TableHeader>` / `<TableBody>` / `<TableFooter>` of `<TableRow>`s holding `<TableHead>` and `<TableCell>`s, plus an optional `<TableCaption>`. Mark a selected row with `data-state="selected"`. For sorting, filtering and pagination, pair it with TanStack Table (shadcn's data-table recipe applies unchanged).

- Framed by a `border-subtle` hairline and `radius-md`; header on `surface-2` with 11px mono uppercase labels in `fg-2`; cells 13.5px in `fg-2`, rows split by `border-subtle`, hover `surface-hover`, selected `accent-subtle`; footer on `surface-2` in `fg-1`.
- Right-align numbers and set them in mono (`font-mono`); put the row's name in `fg-1` / 500; status as a `Badge` with a word.
- The frame scrolls horizontally on narrow screens. Wrap it in `max-w-(--container-app)`; below `breakpoint-md`, hide secondary columns rather than squeezing them.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/table` and import from `@/components/ui/table`.
