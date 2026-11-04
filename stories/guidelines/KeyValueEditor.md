# KeyValueEditor

Rows of key and value that people add and remove: HTTP headers, environment variables, metadata, query parameters.

**The consumer provides** `value` + `onValueChange` (or `defaultValue`), with the value as `{ key, value }[]`, a name for the group (`aria-labelledby` pointing at its label), and optionally `keyLabel` / `valueLabel` (the column titles), placeholders (`keyPlaceholder`, `valuePlaceholder`), `addLabel`, `maxRows`, `sensitive` and `disabled`.

- Each field is named by its column and row ("Key, row 2"); each remove button says which row it removes, and focus moves to the next row (or the add button) after a removal.
- A key used twice (ignoring case) is marked invalid on every copy, with a message linked to the group.
- Pasting "KEY=value" or "Name: value" lines (a .env file, copied headers) into a key field fills one row per line. Enter in the last value adds a row.
- `sensitive` shows values as dots and keeps the browser from saving them; use it for secrets.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/key-value-editor` and import from `@/components/ui/key-value-editor`.
