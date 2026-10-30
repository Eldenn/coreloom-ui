# Empty

The empty state: no data yet, no results, nothing to show.

**The consumer provides** `<Empty>` holding an `<EmptyHeader>` with an `<EmptyMedia variant="icon">` (one Lucide icon), an `<EmptyTitle>` and an `<EmptyDescription>`, then `<EmptyContent>` with the action(s). Add `className="border"` for a dashed frame.

- Centered, 24–48px padding. The icon sits in a 44px `accent-subtle` tile in `accent`, the title is `font-display` 18px / 600, the description is 14px in `fg-muted`, and links in it take `accent-fg`.
- Say what's missing and what to do about it: "No projects yet" / "Import a repository to deploy it." Offer one primary action, plus a secondary one at most.
- No results after a search is an empty state too: name the search and offer to clear it.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/empty` and import from `@/components/ui/empty`.
