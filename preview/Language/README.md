# Language

Every string the components and blocks show or announce comes from one dictionary, so an app switches language in one place.

**The consumer provides** one `<CoreloomI18nProvider locale dateLocale messages>` around the app (`@/lib/i18n`, installed with the components that use it):

- `locale`: a BCP 47 tag. `"en"` (the default) and `"fr"` are built in; it also formats numbers ("1 234 lignes").
- Spanish and German install apart (`@coreloom/i18n-es`, `@coreloom/i18n-de`): pass `messages={es}` with `locale="es"`.
- `dateLocale`: a date-fns locale (`import { fr } from "date-fns/locale"`) for `Calendar` and `DatePicker`: month and day names, week start, the date label.
- `messages`: a partial dictionary merged over the built-in one (`{ auth: { login: { title: "Connexion à Acme" } } }`), or a full one for another language — start from `en`.

- Covered: dialog and sheet close buttons, pagination, breadcrumb, carousel, combobox, command palette, data table (counts, pages, sorting), date picker and calendar, sidebar toggle, spinner, slider thumbs, form errors, theme toggle, copy button, and every block's titles, labels, buttons and validation messages.
- A prop always wins: pass `title`, `placeholder`, `emptyText` or `submitLabel` and it's used as is.
- Entries with values are functions (`rows: (count, n) => …`, `typeToConfirm: (name) => …`), so plurals and word order stay natural in each language.
- Set `<html lang>` to match. Without a provider, everything is English.
- New component text goes into `en`, `fr`, `es` and `de` (TypeScript flags a missing key), read through `useCoreloomI18n().messages`.

_On `window.CoreloomUIDesignSystem_ff5f32` as `CoreloomI18nProvider`, `useCoreloomI18n`, `messagesEn`, `messagesFr`, `messagesEs` and `messagesDe`; in an app, `pnpm dlx shadcn@latest add @coreloom/i18n` and import from `@/lib/i18n`._
