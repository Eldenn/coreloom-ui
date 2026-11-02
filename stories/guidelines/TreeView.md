# TreeView

A hierarchy to browse: files and folders, the pages of a knowledge base, a site map, an organisation.

**The consumer provides** `nodes` (`{ id, label, icon?, meta?, children?, disabled? }`) and a label (`aria-label` or `aria-labelledby`), and optionally `selectionMode` (`none`, `single` or `multiple`) with `selected` + `onSelectedChange`, `expanded` + `onExpandedChange` (or `defaultExpanded`; `branchIds(nodes)` opens everything) and `onAction` for Enter or a click. `icon` can be a function of the open state (a folder, then an open folder); `meta` sits at the end of the row (a size, a count).

- Keyboard (APG tree): Up and Down move, Right opens a branch or enters it, Left closes it or goes to the parent, Home and End jump, `*` opens every sibling branch, a letter jumps to the next node starting with it. Enter runs the action, Space selects (or opens a branch in a read-only tree).
- Clicking the chevron opens or closes a branch. Clicking a row selects it and runs `onAction`; in a read-only tree, it also opens a branch.
- In `multiple`, each row has a checkbox and the tree says it is multi-selectable. Selecting a branch doesn't select its children: say so if your feature does.
- To pick a value in a form, use TreeSelect; to show a large flat list, use a table or VirtualList.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/tree-view` and import from `@/components/ui/tree-view`.
