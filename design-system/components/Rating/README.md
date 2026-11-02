# Rating

Stars to give a score, or to show one.

**The consumer provides** `value` + `onValueChange` (0 means no score; or `defaultValue`), a name for the group (`aria-label` or `aria-labelledby` pointing at its label), and optionally `max` (5), `size` (`sm`, `default`, `lg`), `disabled`, `name` (the radios' form name) and `readOnly`.

- Giving a score uses real radio buttons: Tab reaches the group, arrows change the score, and each star is read as "3 stars, 3 out of 5". Hovering previews the score; clicking the picked star again clears it.
- `readOnly` draws one image named "4.5 out of 5" and fills partial stars, so it can show averages.
- Stars are `warning`-filled, empty ones `border-strong` (3:1). Put the count of reviews next to an average, and say what is being rated in the label.

_On `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/rating` and import from `@/components/ui/rating`._
