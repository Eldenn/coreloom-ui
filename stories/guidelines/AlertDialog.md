# AlertDialog

A confirmation that must be answered before anything else, for destructive or irreversible actions.

**The consumer provides** `<AlertDialog open onOpenChange>` (or a `<AlertDialogTrigger asChild>`), and an `<AlertDialogContent>` (`size="sm"` for a compact, centered one) holding an `<AlertDialogHeader>` with an optional `<AlertDialogMedia>` icon, an `<AlertDialogTitle>` and an `<AlertDialogDescription>`, then an `<AlertDialogFooter>` with `<AlertDialogCancel>` and `<AlertDialogAction variant>`.

- Same frame as `Dialog`: `surface-1`, `border`, `radius-lg`, `shadow-xl` over the `scrim` at `z-modal`. The media tile is `danger-subtle` with a `danger` icon. Cancel is a `ghost` Button, the action takes the variant you pass: `destructive` for deletions.
- Unlike `Dialog`, it has no close button and doesn't close on a scrim click: the user must pick one of the two. Focus starts on Cancel (Radix), so Enter never confirms by accident.
- Title as the question with the object named ("Delete coreloom-web?"). Description says what goes with it and that it can't be undone. The action repeats the verb ("Delete project"), never "OK" or "Yes".

**In an app:** `pnpm dlx shadcn@latest add @coreloom/alert-dialog` and import from `@/components/ui/alert-dialog`.
