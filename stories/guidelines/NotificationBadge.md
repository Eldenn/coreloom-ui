# NotificationBadge

A count or a dot on the corner of an icon or an avatar: unread messages on a bell, items in a cart, someone online.

**The consumer provides** the icon or avatar as `children` and a `count` or `dot`. Optional: `max` (99, above it "99+"), `showZero`, `tone` (`danger`, `primary`, `success`, `warning`, `neutral`), `placement` (`top-right`, `bottom-right` for a presence dot), `pulse`, and `label` for screen readers.

- Put the badge around the icon inside the button, and name the button with visually hidden text placed before it, rather than `aria-label`, so the count is read with the name: "Notifications, 3 unread".
- Hidden at 0 by default: a badge means something needs attention.
- A dot says "something new" without a number; a bottom-right dot on an avatar is a presence (pass `label="Online"`).
- Use `pulse` for something urgent only, and stop it once seen. Badge is for a label inside the content.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/notification-badge` and import from `@/components/ui/notification-badge`.
