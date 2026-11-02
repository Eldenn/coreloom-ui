# StatusIndicator

A coloured dot and the word for it: a service that is up, a job that is running, a person who is away, a feature in beta.

**The consumer provides** the status in words as `children`, a `tone` (`neutral`, `primary`, `success`, `warning`, `danger`, `info`), and optionally `pulse` (a ring for something live or in progress) and `variant` (`plain`, or `pill` to stand out in a table or a header). `StatusDot` is the dot alone, for a label you already show.

- The word is required: colour alone tells nothing to a screen reader or a colour-blind person. The dot is hidden from assistive tech.
- Keep the vocabulary short and consistent across the product: one word per state, the same tone everywhere.
- The pulse stops for people who ask for reduced motion. Use it for one live thing per view, not for every row.
- For a count or a category, use a Badge; for a status that needs explaining, an Alert.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/status-indicator` and import from `@/components/ui/status-indicator`.
