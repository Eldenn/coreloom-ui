# JsonViewer

JSON to read and explore: an API response, a webhook payload, a tool call's input, an event's properties.

**The consumer provides** `value` (parsed JSON: an object, an array or a value), and optionally `rootLabel` (a file name, shown in the header), `defaultExpandDepth` (levels open at first, 1; `Infinity` opens all), `sortKeys`, `maxHeight` and `copyable` (true). `containerPaths(value, depth)` lists the paths of the objects and arrays down to a depth.

- Each object and array is a button that folds and unfolds it; folded, it shows how many keys or items it holds.
- Values are coloured by type: strings, numbers, booleans, and `null` in italics. Keys stay in their given order unless `sortKeys`.
- The header has Expand all, Collapse all and Copy (the whole value, indented by 2).
- It is read only: to edit JSON, use JsonInput. For a few known fields, a description list reads better.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/json-viewer` and import from `@/components/ui/json-viewer`.
