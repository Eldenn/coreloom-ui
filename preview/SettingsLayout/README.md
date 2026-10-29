# Settings page

Settings layout with section navigation, form sections, switch rows and a danger zone, as one installable block.

**Install** `pnpm dlx shadcn@latest add @coreloom/settings`. It writes `settings-layout.tsx` and `settings-section.tsx`.

**The consumer provides**:

- `<SettingsLayout title description nav active onNavigate>`. `nav` items are `{ id, label, icon?, href? }`: with an `href` they're links, without one they're tabs that call `onNavigate(id)`.
- `<SettingsSection title description form footer>` with a `useAppForm` instance and its `form.AppField`s inside: the section is the `<form>` and Save is the form's `SubmitButton`, busy while your `onSubmit` runs. For plain inputs, `onSubmit(formData)` instead. With neither, it's a plain section for settings that apply instantly.
- `<SettingsRow label description htmlFor>` with one control on the right (a `Switch`, a `Select`, a small Button).
- `<DangerZone description actionLabel confirmTitle confirmDescription resourceName onConfirm>` last on the page.

- The nav is a 208px column on desktop (sticky), a scrolling row on phones. The active item uses `accent-subtle` / `accent-fg`.
- Sections are cards: title in `font-display` 17px, footer on a `border-subtle` rule.
- The danger zone is framed in `danger` at 40%. Its button opens an `AlertDialog` that stays disabled until the user types the resource's name.
- One section per concern. Save per section, not per page. Settings that apply instantly use switches and no Save button.

_Parts are on `window.CoreloomUIDesignSystem_ff5f32` (`SettingsLayout`, `SettingsSection`, `SettingsRow`, `DangerZone`)._
