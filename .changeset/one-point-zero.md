---
'@coreloom/ui': major
---

### Changed

- **1.0: a stable API.** The names, exports and props of stable items, the CSS tokens and the
  message keys described in [`VERSIONING.md`](./VERSIONING.md) now only change in a major release,
  after a deprecation. Coming from 0.11, this release asks for nothing more than the steps under
  **Upgrading** below; [Moving to 1.0](./MIGRATING.md) gathers them for older versions.
- **Experimental items.** Every block, and the components still settling (rich text editor, node
  editor, UML diagrams, terminal, form renderer, media player…), may still change in a minor
  release, with an **Upgrading** note when they do. The 35 blocks that were stable before are now
  experimental too; nothing changes in their code. Their guides and `llms.txt` say which is which.
- **Form errors are no longer alerts.** `FieldError` lost its default `role="alert"`: a form with
  several mistakes fired one assertive alert per field, again while typing. The error is read with
  its control through `aria-describedby` and `aria-invalid`, which every `Form` field already wires.
  When a submit of the `<form>` fails, focus moves to the first invalid field and
  `form.SubmitButton` announces how many fields need attention in one polite status. `FormRenderer`
  does the same. A `form.handleSubmit()` called from code doesn't move focus. `OTPField` now sets
  `aria-invalid` on its input.
- **Fewer headings inside components**, so they stay out of the host page's heading order. These
  labels are paragraphs now, with the same look: `FormRenderer`'s title (it still names the form),
  `ShortcutsDialog`'s group titles, `Tour`'s step titles (they name the card), the day groups of
  `ConversationList` (lists named by their label), `RunTrace`'s step list and labels, the titles in
  `RetrievalTest`, `Playground` and the `NotificationsMenu` panel, `FormBuilder`'s "Add a field",
  "Settings" and "Submitted values", and `TeamMembers`' "Pending invites".
- `onValueChange` everywhere: the node editor's field controls (`CodeControl`,
  `ConditionsControl`, `CredentialControl`, `KeyValueControl`) and the diagram editor's parts
  (`TextField`, `Choice`, `MemberList`) take `onValueChange` instead of `onChange`. Both items are
  experimental.
- `Carousel` is named "Carousel" by default; `aria-label` or `aria-labelledby` still name it your
  way.
- `ChatWidget`, `AgentAvatar`, `AgentGraph`, `DonutChart`, `NodeEditor` and `NavigationMenu`:
  transitions use the duration tokens (`duration-fast`, `duration-base`, `duration-slow`).

### Added

- `@coreloom/use-controllable-state`: `useControllableState({ value, defaultValue, onChange })`,
  the hook behind every component that the app can own or that keeps its own state. With it:
  - `defaultValue` on `ModelList`, `FacetedFilter`, `CodeEditorLanguageSelect`, `ExpressionInput`
    and `StateEditor`, whose `value` and `onValueChange` are now optional;
  - `open` and `onOpenChange` on `AgentPlan`, `Reasoning` and `ToolCall`. With `open`, `Reasoning`
    and `ToolCall` no longer fold or unfold by themselves;
  - `defaultOpen` on `ShareDialog`, `ImageLightbox`, `ShortcutsDialog` and `Tour`, whose `open` and
    `onOpenChange` are now optional.
- `onValueChange` on `CodeEditor` and `DiagramEditor`, the name every Coreloom field uses for its
  change callback.
- **Annotations on diagrams.** `UmlDiagram` takes `annotations`: a status (`ok`, `warning`,
  `error`, `unknown`) on elements, such as the findings of a review against the code. Each shows as
  a ring in the status colour and a badge with an icon and a count, and the finding ends the
  element's accessible name. In a sequence diagram they go on participants and messages (`step:…`
  ids). With `onAnnotationSelect`, each badge is a button that hands the element's id back.
  Thumbnails keep them as marks; images made with `toImage` leave them out.
  `SequenceDiagramView` and `DiagramEditor` take the same two props; `DiagramViewer` and
  `DiagramWorkspace` take `annotations` per view and `onAnnotationSelect(element, viewId)`.
- `FindingCard` (`@coreloom/finding-card`, experimental): one finding of a review, with its status
  and severity, a comment, `file:line` evidence that links out (http and https only), Show in
  diagram, and Mark as done / Ignore / Reopen with the resolution announced.
- `Gantt`: Alt + Left / Right move a task's start alone, as Shift does for its end.
- `SegmentedControl`: an option takes `aria-label`, its accessible name when `label` isn't a string.
- New strings in the four locales: `carousel.label`, `carousel.roleDescription`, `carousel.slide`,
  `fileUpload.removed`, `inputs.image.removed`, `inputs.editable.kept`, `inputs.emoji.jump`,
  `ai.prompt.removedFile`, `fileManager.sortedBy`, `kanban.roleDescription`,
  `formBuilder.dnd.instructions` and `formBuilder.dnd.roleDescription`.

### Deprecated

- `onChange` on `CodeEditor` and `DiagramEditor`: use `onValueChange`. It keeps working until 2.0.

### Fixed

- **Installing in any app.** Every item is now installed, type-checked and built in CI in a new
  Next.js app and a new Vite app:
  - `Item` can be imported from a Server Component: its file starts with `'use client'`.
  - `VirtualList` and `LogViewer` compile with Next.js's React types, where a key can be a symbol.
  - `JsonInput` compiles with the Vite template's `erasableSyntaxOnly`.
  - Every npm dependency an item installs names its major (`radix-ui@^1`, `lucide-react@^1`,
    `class-variance-authority@^0.7`…). `shadcn add` used to install the latest version of 14 of
    them, so a dependency's next major could reach an app without a major release here.
  - `@coreloom/rules`: the global CSS step names the folder the theme installs into,
    `src/styles/coreloom/`. It used to say `./coreloom/…`, which doesn't resolve.
- **Focus is never lost** when the control just used goes away:
  - `ApiKeys` (Revoke), `ActiveSessions` (Sign out), `KnowledgeBase` (Remove), `TeamMembers` and
    `Webhooks` (remove, revoke, delete), `ConversationList` (delete): focus moves to the next row,
    the previous one, or the list when it is empty. `KnowledgeBase` returns focus to the row's menu
    when a removal is cancelled; renaming a conversation returns it to the conversation.
  - `FileManager`: opening a folder, going back up, **Move to**, Delete and **Clear** land on an
    item of the list, or on the empty state. The Delete key clears the selection like the button.
  - `KanbanBoard`: **Move to** follows the card to its new column. `FormBuilder`: deleting a field,
    a section or the last option of a field focuses the section, the form or the option before.
  - `FacetedFilter`, `DataListToolbar` and `DataListEmpty`: "Clear filters" hands focus to the
    search box (Enter on the faceted filter's Clear used to toggle the highlighted option).
    `NotificationsMenu`: "Mark all as read" keeps focus in the panel.
  - `Playground`: removing a variant focuses the neighbouring variant. `TerminalConsole`: closing a
    split pane focuses the tab that stays.
  - `ImageInput`: Remove hands focus to Upload. `PromptInput`: removing an attachment focuses the
    next one, or the text box. `CommentThread`: sending or cancelling a reply returns to Reply.
  - `MultiSelect` (**Select all**, **Clear**) and `TransferList` (move buttons): a button with
    nothing left to do is `aria-disabled` and keeps the focus. `MultiSelect`'s buttons also answer
    to Enter (it toggled the highlighted option). `FilterBar`: after **Save view**, focus moves to
    **Add filter**.
  - `EditableText`: Tab or a click away no longer pulls focus back to the text; Enter and Escape
    still do. With `required`, an emptied text is put back and screen readers are told.
  - `UmlDiagram`: deleting the focused element from the keyboard keeps focus on the canvas, also
    when the app hands the new diagram back a frame late (seen in Safari).
- **What screen readers hear:**
  - `FacetedFilter` and `MultiSelect` announce which options are checked (`aria-checked`). The
    `aria-selected` they used was overwritten with the keyboard highlight.
  - `DataTable`: sortable header cells carry `aria-sort`. `FileManager`: the sort buttons say the
    direction ("Sort by Name, sorted ascending").
  - One polite status instead of whole panes read aloud: `ConversationList` (search results),
    `RunTrace` (the step picked), `RetrievalTest` (passages found), `ShortcutsDialog` (shortcuts
    left), `EventCalendar` (the month, instead of a live heading). `ChatMessages`: the typing dots
    and the error are no longer live regions inside the log.
  - `FileUpload`, `ImageInput` and `PromptInput` announce a removed file. `FormBuilder` announces "Copied"
    and its JSON error once each.
  - `Gantt`: a task that starts before the one it waits for ends says so in its name, and its
    arrow is dashed as well as red. `Spreadsheet`: a cell that isn't a number in a number column has
    a mark, not only red text, and the grid's help says how Tab moves. `Ide`: a tab with errors
    shows and announces their count. `DiagramEditor`: each problem starts with "Error" or
    "Warning". `StatusPage`: on phones, the uptime slider steps through the 30 days shown.
  - `EventCalendar`: the button that collapses a day is named "Show less" (it was "−"), and the
    phone agenda says "Today". `Marquee`: the pause button no longer reads "Play, pressed".
  - `KanbanBoard` and `FormBuilder`: drag instructions and role descriptions follow the locale.
    `Carousel`: "carousel" and "slide" too. `SiteHeader` and `SettingsLayout`: the navigations have
    distinct, translated names, and the phone menu marks the current page.
  - `AgentBuilder`: a tool parameter's description shows under its field and is read with it; it
    was a tooltip that keyboard and touch couldn't reach.
- **Keyboard, touch and focus rings:**
  - Boxes that scroll take a tab stop and a focus ring when their content overflows, and only then:
    `Table`'s frame, `DiffViewer`, `ToolCall`'s input and output, tables in `Markdown`, code blocks
    in the editor's AI preview, `ShortcutsDialog`'s list.
  - `Carousel`: fields, selects, radios and sliders inside a slide keep their arrow keys; a
    vertical carousel pages with Up and Down. `EmojiPicker`: the category shortcuts are one tab stop
    with Left and Right between them.
  - Controls that only showed on hover show on touch screens: `ConversationList`'s row menu,
    `Ide`'s tab close mark, `FileManager`'s selection tick.
  - 24 px targets: `Gantt`'s bar ends, `Ide`'s tab close, `FileManager`'s tick, `Changelog`'s
    anchor, `PromptInput`'s attachment remove, `NodeEditor`'s add and chip-remove buttons.
  - Focus rings where they were missing: `SiteHeader`'s links, `PhoneInput`'s country button,
    `ShortcutsDialog`'s search box, and `SaveStatus`, `SuggestionList`, `LoadMore` and `Tour`
    where they move focus.
  - `Gantt`: Today no longer scrolls smoothly under reduced motion.
- **Phones and narrow cards:**
  - `PipelineRun` and `DiffViewer` no longer make the page scroll sideways. `PlanCard`,
    `UsageMeters`, `PaymentMethod`, `InvoiceTable`, `ChartCard` and `ActivityFeed` can shrink in a
    grid, and the invoices table scrolls inside its card.
  - `ChartCard`'s actions, `TeamMembers`' role and remove button, `EnvVars`' Import and Add, and
    `Webhooks`' delivery details go to a second line instead of squeezing or hiding text.
  - `CodeReview` shows diffs unified under 640 px, and `EvalRunReport` compares outputs in one
    column under 480 px (it also says "No output" instead of an empty box).
  - `ProductDetail`: "Add to cart" keeps its height. `CodeBlock`: a long line scrolls under the
    copy button. `DiagramEditor`: long problems wrap.
- **Look:**
  - `NodeEditor`: a long workflow opens on its start at a readable zoom instead of shrunk until the
    text is a few pixels high. Fit, the minimap and zooming out still show everything.
  - `Heatmap`, `CalendarHeatmap`: empty cells and steps are tints of the surface under them, so the
    ramp reads from faint to strong on a card and on the page, in both themes.
  - `Switch`: the thumb of a switch that is off uses a token instead of white (5.5:1 against the
    track in dark, 7.2:1 in light). `InputOTP`: slots have the same outline as `Input`.
  - `Gauge`: threshold marks are notches across the track, and `unit="%"` is spaced as the locale
    writes it ("86 %" in French, Spanish and German). `DonutChart`: every share has one decimal.
  - `AvatarGroup`: avatars overlap by 4 px, so two wide initials stay whole. `UmlDiagram`: a narrow
    sequence diagram is centered. `SegmentedControl` fills a container that stretches it.
    `TransferList` and `RecurrenceInput` use the system's `Checkbox` and `RadioGroup`.
  - `VoiceAgent`, `PushToTalkButton`: after an error, the talk button no longer keeps its accent.
- **Behaviour:**
  - `CodeEditor` and `RichTextEditor`, controlled: fast typing no longer loses or reorders
    characters when the app hands `value` back a keystroke late (seen in Firefox).
  - `AudioRecorder`: the elapsed time and `maxDuration` work when the browser keeps its audio
    context suspended.
  - `FileManager`: several items can be selected without a keyboard.

### Upgrading

- **From 0.11**, re-install the theme and the messages first:
  `pnpm dlx shadcn@latest add @coreloom/theme @coreloom/i18n --overwrite` (plus `@coreloom/i18n-es`
  and `@coreloom/i18n-de` if you use them). If you keep your own messages object for another
  language, add the twelve keys under **Added**: your type check lists them.
- **New dependencies between items:** re-add with `--overwrite` `uml-diagram` (it installs
  `uml-diagram-annotations.tsx` and needs `badge`), `diagram-workspace` (it needs `uml-diagram`),
  `transfer-list` (it installs `checkbox`) and `recurrence-input` (it installs `radio-group`).
- **Form errors:** if you relied on `FieldError` announcing itself, pass `role="alert"` to it, or
  point the control's `aria-describedby` at the error and move focus to the first invalid control
  when a submit fails. Tests that used `getByRole('alert')` should read the control's accessible
  description.
- **Headings:** styles or tests that targeted the `<h2>` of a `FormRenderer` title, the `<h3>` of a
  `ShortcutsDialog` group or a tour step's heading should use the form's or the dialog's name
  (`getByRole('form', { name })`), or the text.
- **Node editor and diagram editor parts:** if you render their field controls yourself, rename
  `onChange` to `onValueChange`.
- **Tests:** the marquee's pause button no longer has `aria-pressed`; find it by name.
- **From an older version**, follow the **Upgrading** section of each release you skipped, oldest
  first, or [Moving to 1.0](./MIGRATING.md).
