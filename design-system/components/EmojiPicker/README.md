# EmojiPicker

A small, built-in set of common emoji (about 400) to react with or insert in a message, grouped by category and searchable.

**The consumer provides** `onSelect` (it gets `{ emoji, name, keywords, category }`), and optionally `emojis` (your own set, or one with names in your language), `label` for the button and `disabled`. Pass a Button as `children` to use your own trigger. `EmojiPickerPanel` is the panel alone, for your own popover or toolbar.

- Typing in the search narrows the grid and says how many match; Down arrow enters the grid, arrows move, Enter picks; Enter in the search picks the first match.
- Each emoji is a button named by its English name ("thumbs up"), so screen readers don't read the glyph alone.
- The built-in names and keywords are English: pass `emojis` with your own names for search in another language.

_On `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/emoji-picker` and import from `@/components/ui/emoji-picker`._
