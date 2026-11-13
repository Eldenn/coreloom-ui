# Tour

A guided tour: a few steps that each point at a part of the screen and say what it is for. For a first visit or a new feature.

**The consumer provides** `steps` (`{ target?, title, content?, side?, align? }`, where `target` is a CSS selector or a function returning the element), `open` + `onOpenChange` (or `defaultOpen`, to start it as it mounts), and optionally `step` + `onStepChange` (or `defaultStep`), `onFinish` (Done on the last step) and `padding` around the spotlight.

- The target is lit up and the rest of the page dims; the page stays usable. A step without a target, or whose target isn't on the page, shows its card in the middle.
- The card reads "Step 2 of 4" and has Back, Next (Done on the last step) and Skip. Escape ends the tour, and the focus goes back where it was. Each step moves the focus to its title, so a screen reader reads it. The title is a paragraph that names the card, not a heading, so it never breaks the page's heading order.
- Three to five steps. One idea per step, in the order people will use them. Let people restart the tour from a help menu.
- Remember that someone finished or skipped it; don't show it again on the next visit.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/tour` and import from `@/components/ui/tour`.
