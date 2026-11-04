# Toolbar

A row of tools for one thing on screen: formatting above an editor, zoom and layout above a canvas, view options above a table.

**The consumer provides** an `aria-label` and the tools: `ToolbarButton`, `ToolbarToggleGroup` with `ToolbarToggleItem` (`type="single"` for one choice, `"multiple"` for on/off styles), `ToolbarLink`, `ToolbarSeparator`, `ToolbarSpacer`, `ToolbarMenu` (a menu named by its text, such as Add ▾) and `ToolbarOverflow` (a More menu holding DropdownMenuItem elements). `tooltip` names a tool on hover; `variant="plain"` drops the border.

- The whole toolbar is one Tab stop: the arrow keys move between its tools, Home and End go to the ends. Don't put text fields in it.
- Icon-only tools need an `aria-label`, and a `tooltip` with the same words helps everyone else.
- Group related tools and separate the groups; put rare tools in `ToolbarOverflow`, and hide the less useful ones on small screens (`className="max-sm:hidden"`) with the same action in the menu.
- For a page's main actions use Buttons or a ButtonGroup; a toolbar is for tools that act on one object.

_On `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/toolbar` and import from `@/components/ui/toolbar`._
