# Item

A list row with media, title, description and actions — the system's List.

**The consumer provides** `<Item variant size>` (`default`, `outline` on `surface-2`, `muted`; `default` or `sm`) holding an `<ItemMedia variant="icon">` (a Lucide icon in the 34px cyan tile, or `image`), `<ItemContent>` with `<ItemTitle>` and `<ItemDescription>`, and `<ItemActions>`. Group rows in `<ItemGroup>` split by `<ItemSeparator />`; `asChild` turns a row into a link. Inside a group each row is a list item (`role="listitem"`; a link row is wrapped in one).

- Title 14px / 600 in `fg-1`, description 13px in `fg-muted` (two lines max); rows that are links highlight on hover. The icon tile matches `CardIcon`.
- For lists of things the user acts on — packages, members, integrations. For columns of data to compare, use `Table`.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/item` and import from `@/components/ui/item`._
