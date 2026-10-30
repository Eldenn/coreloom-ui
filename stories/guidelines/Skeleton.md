# Skeleton

A placeholder shape while content loads.

**The consumer provides** a `className` with the size and radius of what's coming (`h-4 w-2/5`, `size-[34px] rounded-[9px]`).

- `surface-hover` blocks, `radius-md` by default, pulsing; static under reduced motion.
- Mirror the real layout closely so nothing jumps when content arrives; three lines are enough for a paragraph. Don't use it for actions the user is waiting on — that's `Spinner` or `Progress`.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/skeleton` and import from `@/components/ui/skeleton`.
