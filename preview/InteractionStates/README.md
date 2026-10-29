# InteractionStates

How every interactive component looks at rest, hovered, focused, pressed, invalid and disabled.

- **Hover** lifts the surface one step (`surface-hover`) or, on the primary button, to `accent-hover` with `glow-accent`. Hover is a hint only: nothing is reachable by hover alone.
- **Focus** is always the 3px `--ring-focus` (`accent-ring`), shown on `:focus-visible` — keyboard focus, not mouse clicks. It reaches 3:1 against every surface in both themes. Fields also turn their border `accent`. Never remove it; restyle it through `--accent-ring` if you must.
- **Pressed** drops the primary fill to `accent-press` and moves buttons down 1px. Toggles and toggle-group items show their on state with `accent-subtle` and `accent-fg` text, and expose it as `aria-pressed` / `data-state="on"`.
- **Invalid** comes from `aria-invalid`, never from color classes: the border turns `danger` with a `danger-subtle` glow (a stronger `danger` ring when focused), and a `FieldError` says what to do in words.
- **Disabled** uses the `disabled` attribute: buttons drop to `fg-faint` on `surface-2`, fields to 55% opacity, and both leave the tab order. Disabled text is exempt from contrast rules, so never put information only in a disabled control — explain why it's off nearby.
- **Selected / current** uses ARIA, not just color: `aria-current="page"` on nav links and pagination, `aria-selected` on tabs and options, `aria-checked` on checkboxes, radios and switches.
