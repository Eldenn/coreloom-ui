# Pagination

Page links for long lists, tables and search results.

**The consumer provides** `<Pagination>` → `<PaginationContent>` of `<PaginationItem>`s holding `<PaginationPrevious href>`, numbered `<PaginationLink href isActive>`s, `<PaginationEllipsis />` and `<PaginationNext href>`. With client state, pass `onClick` and prevent the default.

- Built on `Button`'s `ghost` variant: 36px squares, page numbers in 13px mono; the current page takes the `outline` look with a `border-strong` rim in `fg-1` and `aria-current="page"`. Previous / Next show their label from `sm` up, chevron only below.
- Show the first, last and two neighbours of the current page, ellipsis for the rest. For feeds where position doesn't matter, prefer a "Load more" button.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/pagination` and import from `@/components/ui/pagination`._
