# Spinner

An indeterminate loading indicator.

**The consumer provides** nothing, or a `className` for size (`size-4` default, `size-6`) and color (`text-current` inside a button).

- Lucide's loader in `fg-muted`, spinning; `role="status"` with the label "Loading". Under reduced motion it turns slower rather than stopping, so the state stays visible — the one animation the system keeps then.
- Pair it with a word ("Installing dependencies…"). Inside a button, disable the button and keep its label ("Publishing"). Wait ~300 ms before showing one so fast responses don't flash.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/spinner` and import from `@/components/ui/spinner`.
