# ScrollArea

A scroll container with a slim, themed scrollbar.

**The consumer provides** a fixed height or max-height (`className="h-72"`) and the content. Add `<ScrollBar orientation="horizontal" />` as a child for horizontal scrolling.

- 10px gutter, `border-strong` thumb (hover `fg-faint`) on a transparent track. The viewport is in the tab order (`tabIndex={0}`), so keyboard users can scroll it, and takes `--ring-focus` when focused.
- Native scrolling underneath (Radix): wheel, touch, keyboard and scroll position all behave as usual.
- For panels with their own scroll inside a fixed layout: a sidebar list, a log, a long select. Let the page itself scroll natively.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/scroll-area` and import from `@/components/ui/scroll-area`.
