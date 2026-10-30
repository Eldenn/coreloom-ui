# Breadcrumb

Shows where the current page sits in the hierarchy.

**The consumer provides** `<Breadcrumb>` → `<BreadcrumbList>` of `<BreadcrumbItem>`s, each holding a `<BreadcrumbLink href>` (or `asChild` around a router `Link`) or, for the last one, a `<BreadcrumbPage>`; a `<BreadcrumbSeparator />` between items (chevron by default) and `<BreadcrumbEllipsis />` for collapsed levels — put a `DropdownMenu` on it to reveal them.

- 13px Geist; links in `fg-muted`, hover `fg-1`; the current page in `fg-1` / 500 with `aria-current="page"`; separators in `fg-faint`. Focus shows `--ring-focus`.
- Use it above the page title in docs and nested settings — three to five levels; collapse the middle beyond that. Labels are the pages' own titles, in sentence case.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/breadcrumb` and import from `@/components/ui/breadcrumb`.
