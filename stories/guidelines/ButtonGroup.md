# Button Group

Buttons joined edge to edge: a split button, a set of related actions, a small "− 3 seats +" stepper. It can also hold a `Select` trigger, an `Input` or a `ButtonGroupText` label.

**The consumer provides** the children, `orientation` (`horizontal` default, `vertical`), and an `aria-label` when the buttons alone don't say what the group is for (it renders `role="group"`). `ButtonGroupSeparator` draws a line between two filled buttons (`secondary`, or `default` with `className="bg-primary-press"`), where borders don't show; `ButtonGroupText` is a non-interactive label (`asChild` to make it a `Label`). Groups nest: put groups in a group to space them apart.

- Use one variant across the group (`outline` for most).
- Each button keeps its own tab stop and name. For an on/off choice between options, use `ToggleGroup`, which carries the pressed state and arrow-key navigation.
- A split button is a main `Button` plus an icon `Button` that opens a `DropdownMenu`; name the second one ("More deploy options").
- Match heights: `Input` is 42px and `Button` 36px, so give an input in a group `className="h-9"`.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/button-group` and import from `@/components/ui/button-group`.
