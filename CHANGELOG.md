# Changelog

What changed in the `@coreloom` registry, release by release. Versions follow
[Semantic Versioning](https://semver.org), with the API it covers spelled out in
[`VERSIONING.md`](./VERSIONING.md); before 1.0, a minor could change a component's API. Each
entry says what to do under **Upgrading**.

Installed components are your code: `shadcn add` won't touch them unless you pass
`--overwrite`. Read the release before overwriting, and diff with `git` afterwards.

The `@coreloom` namespace (`https://eldenn.github.io/coreloom-ui/r/{name}.json`) serves the
latest release, and `main` is published under `/next/`. Every release is also tagged `vX.Y.Z`
and published on GitHub Releases with its registry attached, so a project can pin one by
pointing the namespace there in `components.json` (dependencies between items resolve through
the same namespace):

```json
"registries": { "@coreloom": "https://github.com/Eldenn/coreloom-ui/releases/download/v0.11.0/{name}.json" }
```

## [1.0.0-rc.0] - 2026-11-11

### Added

- `@coreloom/use-controllable-state`: `useControllableState({ value, defaultValue, onChange })`, the hook behind the components below that can be owned by the app or keep their own state.
- `onValueChange` on `CodeEditor` and `DiagramEditor`, the name every Coreloom field uses for its change callback.
- `defaultValue` on `ModelList`, `FacetedFilter`, `CodeEditorLanguageSelect`, `ExpressionInput` and `StateEditor`. Their `value` and `onValueChange` are now optional.
- `open` and `onOpenChange` on `AgentPlan`, `Reasoning` and `ToolCall`, to own whether they show. With `open`, `Reasoning` and `ToolCall` no longer fold or unfold by themselves.
- `defaultOpen` on `ShareDialog`, `ImageLightbox`, `ShortcutsDialog` and `Tour`. Their `open` and `onOpenChange` are now optional.

### Changed

- The node editor's field controls (`CodeControl`, `ConditionsControl`, `CredentialControl`, `KeyValueControl`) and the diagram editor's parts (`TextField`, `Choice`, `MemberList`) take `onValueChange` instead of `onChange`. Both items are experimental.
- Every block is now **experimental**, and so is `RichTextEditor`: the 35 blocks that were stable
  (app shell, auth, settings, dashboard, data list, kanban, inbox, file manager, the AI chat and
  its siblings…) may still change in a minor release, with an **Upgrading** note when they do.
  Nothing changes in their code. The components in `@coreloom/all` other than the rich text
  editor stay stable. Their guides and `llms.txt` say which is which.
- **1.0.** The API described in [`VERSIONING.md`](./VERSIONING.md) is now stable: the names, exports and props of stable items, the tokens and the message keys only change in a major release, after a deprecation. Items marked experimental (every block, and the heavier components) may still change in a minor release; their guides say so.

### Deprecated

- `onChange` on `CodeEditor` and `DiagramEditor`: use `onValueChange`. It keeps working until 2.0.

### Fixed

- `AudioRecorder`: the elapsed time stayed at 0:00, and `maxDuration` never stopped the recording,
  when the browser kept its audio context suspended (a machine without audio output, for one).
  The time now comes from the page's clock.
- `CodeEditor` and `RichTextEditor`, controlled: fast typing could lose or reorder characters
  when the app handed `value` back a keystroke late (seen in Firefox). The editors now recognise
  their own text coming back and leave what was typed since.
- `UmlDiagram`: deleting the focused element or line from the keyboard could leave focus on the
  page instead of the canvas, when the app handed the new diagram back after the next frame
  (seen in Safari). Focus now moves to the canvas before the element goes.
- `Item` can be imported from a Server Component: its file now starts with `'use client'` (it
  creates a context, which failed a Next.js build).
- `VirtualList` and `LogViewer` compile in a Next.js app, whose React types let a key be a symbol
  that TanStack Virtual's keys can't be.
- Every npm dependency an item installs now names its major (`radix-ui@^1`, `lucide-react@^1`,
  `class-variance-authority@^0.7`…). `shadcn add` used to install the latest version of 14 of
  them, so a dependency's next major could have reached an app without a major release here.

### Upgrading

- If you render the node editor's field controls or the diagram editor's parts yourself, rename their `onChange` prop to `onValueChange`.
- From 0.11, 1.0 asks for nothing more than the steps listed here. From an older version, follow the **Upgrading** section of each release you skipped, oldest first.

## [0.11.0] - 2026-11-09

### Added

- `AgentAvatar` has a `listening` state (wide eyes, sound waves) and an `animated` prop
  (`false` shows the state without moving, for long lists).
- `AgentAvatar` has a `shape` prop: `square` (rounded, the face's default), `circle` (the dots'
  default), `hexagon`, `diamond`, `shield` or `blob`, or `seed` to let the seed pick one. The halo
  and the error flash follow the outline. `Chat`'s `assistantAvatar` and `AgentPlan`'s `avatar`
  take it too.
- `agentAvatarLook(seed)` also returns `phase`, where the agent's idle loops start, and `shape`.
- `CheckboxCardField`: checkbox cards (`CheckboxCard`) as a form field, the many-choice sibling of
  `RadioCardField`; its value is a `string[]`.
- `CheckboxGroupField` and `CheckboxCardField` options take `exclusive`: an answer such as "None
  of these" that can't be ticked with another. Ticking it clears the others, and ticking another
  clears it. `toggleChoice` is the rule, exported for custom fields.
- `Markdown` has an `inline` prop: one line of text in a label, a title or a sentence, keeping
  inline code, emphasis and links and dropping block markup.
- `SortableList` options take `actions` (an item's own buttons, after its move buttons), and the
  list takes `wrap`, so long labels run onto more lines instead of being cut.
- `@coreloom/api-try-it` (experimental): the "Try it" panel of an API reference page. Path, query
  and header parameters, extra headers, a JSON body, Send and Cancel, then the status, time, size,
  body (a JSON tree or text) and headers that came back, and Copy as cURL. The app makes the call
  through `onSend(request, { signal })`. The helpers `buildRequestUrl`, `buildRequest`, `toCurl`,
  `shellQuote`, `parseResponseBody`, `statusKind` and `bodySize` are exported too.
- **Booking** block (`@coreloom/booking`, experimental): online appointment booking.
  - Three steps: a service (skipped when there is only one), a day in the calendar and a free time, then a recap with the visitor's name, email, optional phone and note, and Confirm.
  - Free times come from `onLoadSlots({ serviceId, date })`, grouped as morning, afternoon and evening, shown in the place's `timeZone`; taken times are struck through. A failure offers Retry.
  - `onBook(request)` makes the appointment; its `reference` shows on the confirmation, with an **Add to calendar** (.ics) link. A failure keeps everything filled in.
  - `isDateUnavailable`, `fromDate` and `toDate` limit the calendar; `aside` takes a PractitionerCard or OpeningHours.
  - Each step's title takes focus when it opens, and one polite live region says how many times are free.
- **MediaPlayer** (`@coreloom/media-player`, experimental): a video or audio player with its own controls.
  - Play, back and forward, a seek bar with chapter marks, speed, WebVTT captions, volume and full screen, with keyboard shortcuts (k, j, l, m, c, f, arrows).
  - Chapters and a transcript below: the current line is highlighted, follows playback and plays from where it's clicked.
  - `parseVtt(text)` turns a captions file into transcript lines, speakers included.
- **AudioRecorder** (`@coreloom/audio-recorder`, experimental): records a voice note from the microphone.
  - A live waveform and a timer, pause, stop and discard, then playback and delete; `maxDuration` stops it by itself.
  - The recording (`blob`, `mimeType`, `duration`, `levels`) goes to the app through `onValueChange`.
  - `DictationButton` goes in PromptInput's toolbar: it records, calls your `onTranscribe` and hands back the text (`appendText` adds it to the field).
  - `useAudioRecorder` and `AudioWaveform` for a recorder or a voice message of your own.
- `renderIcon` and the `IconLike` type (`@coreloom/render-icon`), and `initials` (`@coreloom/initials`): the helpers that AppSidebar, NavUser, CommandMenu, FeatureGrid and SettingsLayout (icons), and Team, Kanban, Inbox, AuditLog and CommentThread (avatar initials) each carried their own copy of. Those blocks now install them; nothing changes in how they render.
- **Code review** block (`@coreloom/code-review`, experimental): review a pull request's changes.
  - The changed files in a folder tree with their status, comment count and a check once viewed; Enter or a click goes to the file. Below about 768 px the tree folds behind a "Files" button.
  - Each file's diff, unified or side by side (`layout` / `defaultLayout`), with a comment button on every line, keyboard and touch included. Threads show under their lines: reply, resolve, and resolved threads fold. Threads whose line left the diff are listed after the file.
  - "Viewed" per file folds it (`viewed` / `defaultViewed` / `onViewedChange`).
  - "Finish review" sends a verdict (comment, approve, request changes) and a summary through `onSubmitReview`, waiting for its promise.
  - Your app keeps the files and threads: `onComment`, `onReply` and `onResolve` say what changed.
- `DiffViewer` has two line slots: `renderLineAction(line)` draws a control at the start of each line, and `renderAfterLine(line)` draws content under a line (a line with content never folds away). `showHeader={false}` hides its header line when your own header shows the counts.
- `useDataList` takes `server: { total, counts }` for lists the server filters and paginates:
  `rows` is then the page it returned, the toolbar's result count and the pagination read
  `server.total`, and the facet counts come from `server.counts`. The `DataListServer` type is
  exported.
- `useDataList` returns `matched`, the number of rows matching the search and filters on every
  page (`filtered.length` without `server`, `server.total` with it).
- **DiagramEditor**: an **Import** button in the top bar, between New diagram and Copy. It opens the file picker for a Mermaid (`.mmd`, `.mermaid`), PlantUML (`.puml`, `.plantuml`, `.pu`, `.iuml`, `.wsd`), JSON or `.txt` file. The file is read in the browser, replaces the text and sets the format: from the extension, or from the first words of a `.txt`. Files over 1 MB and binary files are refused, and the status line says why. Import is off when `readOnly`.
- **DiagramWorkspace**: `onImport({ title, value, result, format })`. When it's given, the Add menu ends with "Import a file…", which reads a file the same way and hands it to the app to add as a new view, named after the file.
- Strings for both in English, French, Spanish and German.
- **Diagram viewer** block (`@coreloom/diagram-viewer`): a document of several diagrams to read, as a shared link opens it.
  - Title, description and "Updated …" on top, and an optional `banner` above them.
  - Up to six views are tabs; past six they are a list at the side; on a phone, a menu. `activeId` / `defaultActiveId` / `onActiveChange` set the view.
  - The diagram keeps zoom, fit and full screen. Download makes an SVG or a PNG, named from `fileName` and the view.
  - Left and right arrows, or Page Up and Page Down, change the view. No editing tools.
- **Diagram workspace** block (`@coreloom/diagram-workspace`): the editor of a document with several diagrams.
  - The document's name is edited in place (EditableText), and SaveStatus shows `saveState`, `savedAt` and Retry (`onRetrySave`).
  - The list of views adds a view of a chosen kind (`onAdd(kind)`), renames (`onRename`), reorders with SortableList (`onReorder`) and deletes after a Popconfirm (`onDelete`). The last view can't be deleted.
  - The open view is a controlled DiagramEditor; `onDiagramChange(id, value, result, format)` reports each change.
  - On a phone, the list is in a side sheet.
- **DiagramWorkspace**: diagram files can be dropped on the workspace. With `onImport`, files dragged over it show a dashed hint ("Drop diagram files to add them as views"), and each dropped file is read like "Import a file…" and handed to `onImport`, one call per file, in order. A file dropped on the editor also becomes a new view: the editor no longer pastes its text. The files that can't be read are named in the status under the list of views. Without `onImport`, dropped files are left alone.
- **diagram-import**: `useFileDrop({ enabled, onFiles })`, the drop handling behind it, for an area that takes files.
- The hint's string in English, French, Spanish and German.
- **Filter bar** (`@coreloom/filter-bar`, experimental): filters as chips above a list or a table.
  - "Add filter" picks a field from a searchable list; each chip opens to edit its operator and
    value; × removes it. "Match all" / "Match any", "Clear filters", saved `views` with
    `onSaveView`, and a `resultCount` announced politely.
  - Six field types (`text`, `number`, `date`, `select`, `multiselect`, `boolean`), each with its
    operators (`contains`, `between`, `before`, `anyOf`, `allOf`, `isEmpty`…).
  - `QueryBuilder` edits the same filter as nested AND / OR groups (`maxDepth`, 3 by default).
  - `@/lib/filter`: the `FilterGroup` value and `matchesFilter` to run it on rows,
    `filterToSearchParams` / `parseFilterSearchParams` to keep it in the URL (unknown fields,
    operators and values of the wrong shape are dropped), and helpers to edit it.
- **AppShell** (`@coreloom/app-shell`): `fullWidth` (default `false`) lets the page use the whole width next to the sidebar instead of stopping at `--container-app`, for editors, canvases and wide tables. The gutters stay.
- **Diagram workspace** (`@coreloom/diagram-workspace`): `height` sets the whole workspace's height on wide screens; the editor takes what's left under the top bar and a long list of views scrolls on its own. In `<AppShell fullWidth>`, `height="calc(100svh - 7.5rem)"` makes the editor fill the window. Without it nothing changes (560px panes).
- **Diagram editor** (`@coreloom/diagram-editor`): `height="fill"` makes the panes share the height the editor is given (stretched in a grid or a flex column, or set with a class) instead of a fixed one. They keep 560px where they stack.
- `@coreloom/charts` (Chart, RadarChart, ScatterChart, TreemapChart and SankeyChart, the charts drawn with Recharts), `@coreloom/editors` (RichTextEditor and CodeEditor) and `@coreloom/everything` (`all`, `charts`, `editors` and `node-editor`).
- What each item costs an app, gzipped and without React, published at `r/sizes.json` with its npm packages.
- `Logo` (`@coreloom/logo`): your logo as an inline SVG or an image (with a light version), named for screen readers, optionally linked home, with entrance animations: `fade`, `stagger` (its groups one after the other), `draw` (outlines trace, then fill), `assemble`, `wipe`, `shine` and `pulse`, played on mount, in view or on hover. `logoParts` and `assembleOffset` are exported for your own effects.
- `LogoLoader` (`@coreloom/logo-loader`): the logo as a loading screen (busy status), that fades away into the content.
- `LogoCloud` (`@coreloom/logo-cloud`): customer or partner logos in a grid or a marquee, muted until hovered.
- Motion tokens in the theme: `--duration-fast` / `-base` / `-slow` / `-reveal` (120, 180, 320 and
  600 ms) with the `duration-fast`, `duration-base`, `duration-slow` and `duration-reveal`
  utilities, and `--ease-in-out` next to `--ease-out` and `--ease-spring`.
- `Reveal` and `Stagger` (`@coreloom/reveal`): content that fades, slides, scales or comes into
  focus as it scrolls into view, once, item by item for `Stagger`; `useInView` and
  `useReducedMotion` are exported.
- `WordReveal`, `Typewriter`, `ShimmerText` and `GradientText` (`@coreloom/text-effects`): words
  arriving one by one, typed phrases with a caret, a shimmer for "Thinking…" labels, the accent
  gradient on text. Screen readers get the whole text once.
- `Marquee` (`@coreloom/marquee`): logos or quotes scrolling without end, with faded edges, a
  pause button, and a stop on hover and focus.
- `Spotlight` and `BorderGlow` (`@coreloom/spotlight`): a light that follows the pointer across a
  card, and a light running along its border.
- `useViewTransition` and `startViewTransition` (`@coreloom/view-transition`): fade, slide,
  slide-back or scale between views with the View Transitions API.
- Everything stands still for people who ask for reduced motion, page transitions included.
- `StatusButton` (`@coreloom/status-button`): a button that shows its action, with a spinner,
  a drawn check on success and a shake on error, each announced.
- `DrawIcon`, `MorphIcon` and `MenuToggleIcon` (`@coreloom/animated-icon`): icons that draw
  themselves, turn into one another, or fold into a cross.
- `AnimatedList` (`@coreloom/animated-list`), `AnimatedHeight` (`@coreloom/animated-height`)
  and `TabsIndicator` (`@coreloom/tabs-indicator`): items that slide in and out, a box that
  follows its content's height, a highlight that slides between tabs.
- `Ping` and `PingDot` (`@coreloom/ping`), `fireConfetti` (`@coreloom/confetti`),
  `PageProgress` (`@coreloom/page-progress`) and `TypingIndicator`
  (`@coreloom/typing-indicator`).
- `AnimatedBackground` (`@coreloom/animated-background`), `TiltCard` (`@coreloom/tilt-card`),
  `ScrollProgress` and `Parallax` (`@coreloom/scroll-effects`, CSS scroll-driven), and
  `ScrambleText` in `@coreloom/text-effects`.
- `Reveal` and `Stagger` take mask effects for images: `wipe-up`, `wipe-down`, `wipe-left`,
  `wipe-right` and `circle`.

All of these are experimental: their API may still change in a minor release.

- **Load more** (`@coreloom/load-more`): the end of a paged list, as a button or loaded as it scrolls into view, with
  loading, error (Try again) and end states; `loadMoreStatus` maps a TanStack infinite query to it.
- **Presence** (`@coreloom/presence`): `PresenceAvatars` (who is here, idle shown), `PresenceActivity`
  ("Ada is editing…") and `RemoteCursors` (named pointers over a shared surface).
- **Image crop** (`@coreloom/image-crop`): move and zoom an image in a frame (pointer, keyboard, slider), round
  for avatars; `cropImage` returns the cropped File.
- **Notification preferences** (`@coreloom/notification-preferences`): an event × channel matrix with a toggle
  per channel, required and unavailable cells.
- **Environment variables** (`@coreloom/env-vars`): variables per environment, secrets masked, `.env` import
  with a preview, and a comparison between environments. `@coreloom/dotenv` parses `.env` text.
- **Feature flags** (`@coreloom/feature-flags`): flags per environment with a switch, a rollout percentage,
  targeting rules and history; `evaluateFeatureFlag` evaluates them the same way.
- **Version history** (`@coreloom/version-history`): versions grouped by day, named versions, a diff with the
  previous or current one, and restore.
- **SQL explorer** (`@coreloom/sql-explorer`): schema tree, query tabs in a SQL editor (Mod+Enter runs),
  virtualised results, cancel and CSV export. Your `onRun` runs the query.
- **Agent run replay** (`@coreloom/ai-agent-replay`): play back a multi-agent run from its spans, with a
  timeline, the agent graph at that moment, the turns and per-agent metrics.
- **Image input** has a `crop` prop: the chosen image is framed in a dialog first, and the value is the cropped
  File.
- **Testimonials** (`@coreloom/testimonials`, experimental): `TestimonialGrid`, `TestimonialWall` (columns with "Show more") and `TestimonialCard`, with avatar, logo, rating and source.
- **Comparison table** (`@coreloom/comparison-table`, experimental): plans side by side under a sticky header, words for every cell, "Only show differences", one plan at a time on phones; `differingFeatures`.
- **Changelog** (`@coreloom/changelog`, experimental): a public changelog page with changes tagged New, Improved, Fixed, Security or Deprecated, a filter by kind, anchors, a feed link and paging; `filterChangelog`, `changeKinds`.
- **Blog** (`@coreloom/blog`, experimental): `BlogList` (featured post, categories, "More posts"), `BlogPostCard`, `BlogArticle` (table of contents, authors, related posts), `AuthorCard`, `AuthorProfile`; `readingTime`.
- **Newsletter** (`@coreloom/newsletter`, experimental): `NewsletterForm` and `Waitlist` (place in line, referral link), with address checks, the callback's errors and a focused thank-you.
- **Cookie consent** (`@coreloom/cookie-consent`, experimental): `CookieConsent` with equal "Reject all" / "Accept all", `CookiePreferences`, and `parseConsent`, `acceptAll`, `rejectAll`.
- **Shop** (`@coreloom/shop`, experimental), without payment: `ProductCard`, `ProductGrid`, `ProductDetail` (swatches, sizes, stock, quantity), `Cart`, `CartSheet`, `CartButton`, `OrderSummary` (promo code, shipping, tax); `cartTotals`, `findVariant`, `isValueAvailable`, `formatMoney`.
- **Voice agent** (`@coreloom/voice-agent`, experimental): `VoiceAgent` with push-to-talk (hold, Space, or hands-free), states, a level meter and a live transcript; `PushToTalkButton`, `LiveTranscript`, `VoiceLevel`.
- Message groups `testimonials`, `comparison`, `changelog`, `blog`, `newsletter`, `cookieConsent`, `shop` and `voice` in English, French, Spanish and German.
- **SaveStatus** (`@coreloom/save-status`, also in `all`): where an autosaving document stands.
  - It shows "Saved · 2 minutes ago" (with RelativeTime), "Saving…", "Unsaved changes", or "Couldn't save" with a Retry button (`onRetry`).
  - Screen readers hear one polite status message when the state settles; passing through Saving… isn't announced.
  - After Retry, focus stays on the status line.
- **Diagram card** block (`@coreloom/diagram-card`): a gallery card for a diagram document.
  - The thumbnail is a `diagram` drawn with UmlDiagram's `preview`, or an `image` URL. When there's neither, a neutral drawing stands in.
  - The title is a link (`AppLink`) that covers the whole card.
  - It shows a visibility badge (`private`, `public`, `protected`, with an icon and a word), the number of diagrams and when the document changed.
  - `actions` fill a "…" menu that stays its own button.
- **Share dialog** block (`@coreloom/share-dialog`): choose who can open a document.
  - Three radio cards: Private (only you), Public (anyone with the link), Protected (the link and a code).
  - A choice applies through `onVisibilityChange` (a promise). Its card spins until it settles, and the old choice comes back if it rejects.
  - The link is read-only with Copy. The code is in SecretValue. "Regenerate the link" and "Generate a new code" ask first, in a Popconfirm that says what stops working.
  - "Copy link and code" copies a short message ready to send.
- **Access code gate** block (`@coreloom/access-code-gate`): the screen in front of a protected link, for AuthLayout.
  - One box per character (`length`, 8 by default). Letters are upper-cased and characters outside `alphabet` are ignored; by default the alphabet leaves out 0, O, 1, I and L.
  - A pasted code fills every box, and the code is sent as soon as the last box is filled.
  - After a wrong code the boxes empty and focus goes to the first one. `attemptsLeft` shows under the boxes; `lockedUntil` turns them off and shows a countdown.
- [`VERSIONING.md`](https://github.com/Eldenn/coreloom-ui/blob/main/VERSIONING.md) says what a
  version promises: the API it covers (item names, exports, props, tokens, message keys), what
  makes a major, minor or patch release, how deprecations work and which platforms are supported.
- Items carry a stability level. These are **experimental**, and may still change in a minor
  release: `uml`, `uml-diagram`, `diagram-code-block`, `diagram-editor`, `diagram-card`,
  `diagram-viewer`, `diagram-workspace`, `share-dialog`, `access-code-gate`, `node-editor`,
  `workflow-builder`, `agent-graph`, `ai-agent-builder`, `ai-agent-teams`, `terminal`,
  `terminal-console`, `ansi-output`, `ide`, `pipeline-run`, `form-builder` and `form-renderer`.
  Their registry entry has `"meta": { "stability": "experimental" }`, their guide opens with a
  note, and `llms.txt` marks them. Every other item is stable.
- **SuggestionList** (`@coreloom/suggestion-list`, also in `all`, experimental): suggestions reviewed one by one before they count, such as rules a model proposed.
  - Each suggestion has a `text`, and optionally a `label` above it and a `detail` under it. Its buttons are Accept, Edit (the text opens in a field, then Accept edit or Cancel) and Ignore.
  - `onAccept(suggestion, text)` and `onDismiss(suggestion)` may return a promise: a spinner shows while it runs, and a rejected one keeps the suggestion.
  - The app removes handled suggestions; focus moves to the next one, and one polite message says what happened and how many are left.
  - `renderText` draws the text (inline Markdown, for example), `editable={false}` hides Edit and `empty` replaces "No suggestions left."
- **Component diagrams** (`kind: 'component'`) in `@coreloom/uml` and `@coreloom/uml-diagram`.
  - Elements are components, interfaces and ports. A component holds others through `parent` and is then drawn as a frame.
  - A port sits on its component's edge, half the ports on the left side and half on the right. A dragged port stays where it was put.
  - Interfaces are drawn as lollipops.
  - Relations: `provide` (a plain line to the lollipop), `require` (a socket round it), `assembly` (a ball in a socket), `delegate` (an arrow marked «delegate») and `dependency` (a dashed arrow, the default).
  - Elements take a `stereotype`.
- **Package diagrams** (`kind: 'package'`).
  - Packages are drawn as folders. A package that holds others is a frame with its name in the tab.
  - They contain classes, interfaces and components.
  - Relations: `dependency` (the default), `import` and `merge`, as dashed arrows marked «import» and «merge».
- `parseUmlJson` checks both kinds.
- `parsePlantUml` reads both, and `toPlantUml` writes them back.
  - Component diagrams: `component`, `[Name]`, `interface`, `() Name`, `port` / `portin` / `portout`, groupings in braces. Lines: `-(` requires, `-(0)-` is an assembly, `<<delegate>>` delegates.
  - Package diagrams: `package` in braces around `class`, `interface`, `enum` and components. Lines: `<<import>>` and `<<merge>>`.
- Mermaid has neither kind: `toMermaid` writes them as a flowchart, and the diagram editor turns Mermaid off in its format switch.
- The diagram editor's tools add components, interfaces, ports and packages, and connect them with the kinds above. Its "New diagram" menu and the diagram workspace's Add menu offer both kinds. The properties panel edits the stereotype, with a hint for each kind.
- Strings for both kinds in English, French, Spanish and German.
- **UML diagrams.** `@coreloom/uml` is the typed model of class, sequence, state, entity–relationship and C4 diagrams, with `parseUmlJson` (checks JSON from outside), and `parseMermaid` / `toMermaid` for the matching Mermaid subset (`classDiagram`, `sequenceDiagram`, `stateDiagram-v2`, `erDiagram`, `C4Context`, `C4Container`, `C4Component`), tolerant: what can't be read comes back as a problem on its line. No `mermaid` dependency; nothing is rendered as HTML.
- **UmlDiagram** (`@coreloom/uml-diagram`): draws class, state, ER and C4 diagrams on React Flow, laid out automatically in layers with UML markers, crow's feet, frames (namespaces, composite states, C4 boundaries) and multiplicities; zoom and fit; `editable` lets people drag elements and `onLayoutChange` gives their positions. Sequence diagrams render as an SVG (activations, notes, loop/alt/opt/par blocks, autonumber) with the steps as a list for screen readers. Also in `@coreloom/everything` (React Flow keeps it out of `all`).
- **Diagram editor** block (`@coreloom/diagram-editor`): Mermaid or UML JSON beside the drawing, problems marked on their line, format switch, templates, copy and download.
- **Sequence diagram editing** in `@coreloom/diagram-editor`: the side panel lists participants and steps (the keyboard path to what a click on the drawing selects), and the selected step's form changes a message (ends, text, arrow, activations), a note (text, place, participants), an activation, or a block (loop, alt, opt, par, critical, break: kind, condition, sections). Add holds notes and blocks (a block wraps the selected step), Connect adds a message after the selected step, Move up / Move down reorder steps, and a participant can be an actor. The functions are in `@coreloom/uml` (`uml-edit-sequence`): `insertMessage`, `insertNote`, `insertBlock`, `setStep`, `moveStep`, `addSection`, `removeSection`, `stepId`.
- **Editing on the drawing.** UmlDiagram: `onRename` (F2 or a double click opens a name field over the element), `onElementDrop` (an element type dragged onto the canvas, with `UML_DRAG_TYPE`), "Select an area" for box selection, and an align bar (left, centre, right, top, middle, bottom, space evenly) for two or more selected elements. In the diagram editor, the quick Add buttons can be dragged onto the drawing.
- **Copy, Paste, Duplicate** (Ctrl/⌘ with C, X, V, D) in the diagram editor: elements come with what they hold and the lines between them, under fresh names. `copyItems`, `pasteItems`, `duplicateItems` in `@coreloom/uml`.
- **Layout** menu in the diagram editor: arrange automatically, and turn the flow (top to bottom, left to right, bottom to top, right to left). Dragged positions can now be undone. `alignBoxes`, `setDirection`, `clearLayout` in `@coreloom/uml`.
- **SVG and PNG images.** UmlDiagram takes a `ref` whose `toImage('svg' | 'png')` gives the whole drawing as a data URL; the diagram editor's Download menu offers text, SVG and PNG. `@coreloom/uml-diagram` now depends on `html-to-image`.
- **Class members line by line** in the properties panel: one field per member, typed as in Mermaid, with a menu for visibility, static, abstract, moving and removing; Add attribute and Add method. `memberFromText` in `@coreloom/uml`.
- **Diagram editor tools.** The drawing in `@coreloom/diagram-editor` has its own toolbar: **Add** (the elements this kind of diagram holds: classes, interfaces, notes, states, entities, participants, C4 people, systems, containers, databases, boundaries…), **Connect** (a form for the kind, both ends and a label, filled from the selection), **Delete**, **Undo** and **Redo**. A **Properties** panel changes what's selected: name, stereotype, members, attributes, description, technology; a relation's kind, label, multiplicities or ER ends, and its direction. Each change is made on the model and the Mermaid or JSON text is written again. The tools are off while the text has problems.
- **UML editing functions** in `@coreloom/uml`: `addElement`, `addRelation`, `deleteItems`, `renameElement`, `setElementFields`, `setRelationFields`, `reverseRelation` (and `elementTypes`, `relationTypes` to list what a diagram can hold). Plain functions that return a new diagram, for your own forms or an assistant's tool calls.
- **UmlDiagram**: `selection` / `onSelectionChange`, `onConnect` (with `editable`, drag the dot under an element onto another) and `onDelete` (the Delete key). Selected elements show a ring.
- **ToolbarMenu** in `@coreloom/toolbar`: a menu named by its text ("Add ▾"), one of the toolbar's arrow-key stops.
- **Use case, activity and deployment diagrams** in `@coreloom/uml` and `@coreloom/uml-diagram`: actors (stick figures), use cases (ellipses) in their system, «include», «extend» and generalization; actions, decisions and merges (diamonds), start, end and flow end, fork and join bars, partitions and guards in brackets; nodes, devices and execution environments as 3D boxes with their keyword, artifacts, components, databases and clouds, nested in what they're deployed on, with links, dependencies and «deploy». The diagram editor's Add, Connect, properties, copy and paste work on all three.
- **PlantUML**: `parsePlantUml` and `toPlantUml` (`@coreloom/uml`, `uml-plantuml`) read and write `@startuml` text for every kind (class, sequence, state, ER, C4-PlantUML macros, use case, deployment, and activities in the new syntax), tolerant like `parseMermaid`: problems by line, skin parameters set aside with a warning. No PlantUML dependency, nothing sent to a server. `isPlantUml` tells PlantUML text from Mermaid.
- **Mermaid flowcharts** (`flowchart` / `graph`) are read as activity diagrams: `((start))`, `(((end)))`, `{decision}`, `@{ shape: fork }` and the other activity shapes, subgraphs as partitions, `&` and chained links.
- **Diagram editor**: a PlantUML format (`format="plantuml"`, `.puml` downloads), templates for the three new kinds, and pasted text in another syntax switches the format. A format that can't hold the current kind is disabled.
- **`@coreloom/diagram-code-block`**: draws the `mermaid and `plantuml blocks of a chat answer as diagrams, with a Diagram / Source switch; the plain code block while the answer streams or when the text can't be read. Register it once with `<MarkdownCodeBlocksContext value={diagramCodeBlocks}>`. It's in `everything`.
- **Markdown**: `codeBlocks` and `MarkdownCodeBlocksContext` hand fenced code in a given language to the app's own renderer (it gets `code`, `language`, `streaming` and the plain block as `children`).
- **UmlDiagram** (`@coreloom/uml-diagram`): `preview` draws a still thumbnail for galleries. The drawing fits its box and fits again when the box is resized. It has no controls and nothing inside can be focused, dragged or zoomed. Screen readers get one image named by `label`.
- **UmlDiagram**: a full screen button in the controls, and in the top-right corner of sequence diagrams. It uses the Fullscreen API on the diagram's box. Escape leaves full screen and focus goes back to the button. Browsers without the Fullscreen API don't show the button.
- **Diagram editor** (`@coreloom/diagram-editor`): `view` / `defaultView` / `onViewChange` show the text beside the drawing (`split`, the default), the drawing alone, or the text alone. A switch at the end of the format bar changes the view.
- **Diagram editor**: `actions` puts the app's own buttons (Share, say) at the end of the top bar.
- **Diagram editor**: `readOnly` keeps the text as it is. The text field is read-only; the format switch, New diagram, the drawing tools and the properties are off; nothing can be dragged. Copy, Download, zoom and full screen still work, and the status line starts with "Read only".

### Changed

- `AgentAvatar` is livelier: at rest it breathes, blinks and glances aside, each agent on its
  own beat so a team never blinks in step; thinking and speaking glow with a halo; speech has an
  uneven rhythm; done adds cheeks and a spark, error a red flash, offline a floating "z"; every
  change of state plays a short bounce, and hovering it makes it squint. The dots breathe at rest
  and pulse while listening. Everything still stops for reduced motion.
- `@coreloom/all` no longer installs the components built on Recharts, Tiptap, CodeMirror and React Flow: it now adds about 460 KB of gzipped JavaScript instead of about 1 MB. The light charts (Sparkline, DonutChart, BarList, Gauge, Heatmap, FunnelChart) stay in it.
- Guides now name every prop their component takes: Sidebar `side` and `variant`, AppShell's sidebar shape, QuotaBar's number options, Popconfirm `onCancel` and `defaultOpen`, FormRenderer's `renderField` / `renderSection` / `showHidden`, RichTextEditor `suggestion` and `onReviewEnd`, and a dozen more.
- Components use the duration utilities instead of fixed values (`duration-base` for
  `duration-180`, and so on); nothing moves differently.
- The `@coreloom` namespace (`https://eldenn.github.io/coreloom-ui/r/{name}.json`) now serves the
  latest release instead of `main`, and so do Storybook, the guides and `llms.txt` at the same
  address. An item you install no longer changes between releases.
- What `main` holds before it is released is published under `/next/`
  (`https://eldenn.github.io/coreloom-ui/next/r/{name}.json`, and Storybook at `/next/`).
- In a PlantUML text with packages, no `<<import>>` or `<<merge>>`, no class members in braces and no inheritance, composition or aggregation lines, the text is now read as a package diagram.
- A PlantUML text whose only elements are components, interfaces or ports is now read as a component diagram. A text with nodes, devices, databases or other deployment elements is still read as a deployment diagram.
- A component that holds others in a deployment diagram is drawn with a solid outline, as UML draws it, instead of a dashed one.
- `UmlElementFields.members` (in `uml-edit-fields`) is a `ClassMember[]` instead of a text with one member per line.
- The diagram editor's top bar is a Toolbar (one Tab stop, arrow keys between the format, New diagram, Copy and Download); on phones Copy and Download show their icon only.
- `toMermaid` writes use case and deployment diagrams as a plain flowchart, since Mermaid has no such diagrams; the editor doesn't offer Mermaid for them. `toPlantUml` writes activities in PlantUML's arrow syntax, which isn't read back; the editor doesn't offer PlantUML for them.
- `parseMermaid` no longer says a `flowchart` isn't a diagram type it reads.

### Fixed

- **Rich text editor** and **Settings section**: the link field and the "type to confirm" field take their id from `React.useId()` instead of a fixed string, so two instances on one page no longer share a label target.
- The guide's advice for server-side filtering now works: before, a page of rows passed as
  `rows` was searched, counted and sliced again in the browser.
- **UML diagram** (`@coreloom/uml-diagram`, and the diagram editor, viewer and workspace that use it): leaving full screen (Escape or the button) puts back the view from before. The diagram used to keep the screen-sized pan and zoom and end up off to the side, out of sight.
- **Diagram editor** and **Diagram workspace** (`@coreloom/uml`): elements dragged in a Mermaid or PlantUML diagram keep their place. Their positions used to live only in the open editor, so opening another view, reloading or saving lost them; they now travel in the text, in one comment line the renderers skip (`%% coreloom-layout {…}` in Mermaid, `' coreloom-layout {…}` before `@enduml` in PlantUML). `toMermaid` / `toPlantUml` write it and `parseMermaid` / `parsePlantUml` read it back, keeping only positions of elements the text has.
- **UML diagram**: the Fit to view button (and the refit in full screen) works every time. It went through React Flow's `fitView`, which waits for the next change of the nodes; with the nodes kept by the app, after a drag that change could never come and Fit did nothing, leaving an element dragged out of view out of reach. It now fits the drawn elements at once (`useFitDiagram`).
- `InlineCitation`: Enter on a citation you just tabbed back to now always moves focus to the
  card's link. Before, when the card was mounting or still fading out, focus stayed on the card
  itself or on the citation.
- The Checkbox, Radio, Switch story links the checkbox to its description (`aria-describedby`), as an app should.
- `Logo`: with `trigger="hover"` and `href`, the first click now goes home. Replaying the entrance used to remount the logo, so the element under the pointer changed between mousedown and mouseup and the click was lost; the replay now restarts the animation in place.
- **Slider**: `aria-valuetext` now reaches the thumb (the element with the slider role) when there is one value.
- **Toolbar**: a tool with an icon and text no longer shrinks to an icon's width and overlaps the next one.
- `UmlDiagram`: lines no longer blink or vanish while an element is dragged (or on any other
  re-render). Each box now hands React Flow its size, so React Flow keeps track of where its
  lines attach instead of dropping them until it measures the box again.
- PlantUML: a name in quotes no longer decides what kind of diagram the text is. A title, a
  class, a participant or a message holding brackets (`"Order (v2)"`, `alt refused (fraud)`)
  was read as a use case diagram and lost everything else.
- PlantUML: a `#` inside a quoted name or after a colon is kept (`node "Server #2"`,
  `Placed --> Paid : card #1`). Only colours on a declaration (`#pink`) are left out.
- PlantUML: an entity with no attributes (`entity Order`) reads, and so does an entity's name
  (`entity "Customer account" as Customer`). The editor's own entity–relationship template had a
  problem as soon as it was switched to PlantUML.
- Mermaid flowcharts: quoted text may hold brackets, braces and pipes (`A("Order (v2)")`,
  `B{"Paid {card}?"}`, `-->|"yes | partly"|`).
- Mermaid: `#quot;` turns back into `"` in class names, entity names and attribute comments, so a
  name with quotes shows as typed.
- `DiagramEditor`: a new note takes focus in its text box, as other new elements take it in their
  name field (focus went to the page). An activity diagram written in Mermaid no longer offers
  Note, which a Mermaid flowchart can't hold: it vanished as soon as it was added.

### Upgrading

- The new motions are `agent-*` animations in the theme's `theme.css`: add `@coreloom/theme`
  again (`pnpm dlx shadcn@latest add @coreloom/theme`).
- An app whose `onImport` adds a view with a plain state update (`setViews([...views, view])`) should build on the previous state (`setViews((all) => [...all, view])`): several dropped files call it in the same event.
- To keep installing everything with one command, use `pnpm dlx shadcn@latest add @coreloom/everything` instead of `@coreloom/all`, or add `@coreloom/charts`, `@coreloom/editors` or `@coreloom/node-editor` next to `all` for the parts you use. Files already installed are not touched.
- Re-add `@coreloom/theme` to get the logo keyframes and rules in `theme.css`.
- Add the theme again (`pnpm dlx shadcn@latest add @coreloom/theme`): the duration utilities and
  the keyframes of the new components live in `theme.css`, and updated components need them.
- Add the theme again (`pnpm dlx shadcn@latest add @coreloom/theme`): the new keyframes and the
  TabsIndicator rules live in `theme.css`.
- If you call `setElementFields` with `members`, pass the members as `ClassMember` objects (`parseMember(line)` from `@/lib/uml-mermaid-class` reads one line as Mermaid writes it).

## [0.10.0] - 2026-11-03

### Added

- `AgentAvatar` (`@coreloom/agent-avatar`): a small animated face for an AI agent, `face` or
  `dots`, that is `idle` (blinks), `thinking` (looks around), `speaking` (talks), `done` (smiles),
  `error` or `offline`. A `seed` gives each agent a stable colour and eyes (`agentAvatarLook`);
  the state is said to screen readers and the motion stops for reduced motion.
- `Chat`, `ChatMessages` and `ChatMessage` take `assistantAvatar` to draw the assistant as an
  AgentAvatar that thinks while it waits and talks while it streams.
- `AgentPlan` takes `avatar`; `AgentGraph` and `AgentTeams` take `avatars` (`face` or `dots`),
  whose faces follow the run's `activity`. `agentAvatarState` maps an activity to a state.
- The theme's `theme.css` has the `agent-*` animations.
- `AgentBuilder` (`@coreloom/ai-agent-builder`): the agent side of the node editor.
  - **Reads / Writes**: each node names the state fields it uses and updates.
  - **Structured output**: an Agent can answer in a JSON Schema (checked as JSON).
  - **Tool parameters**: `AgentBuilderTool` takes `parameters` (a JSON Schema object) and
    `sensitive`; each parameter can be fixed per node (a value, an `{{ }}` expression, an `enum`
    value) or left to the model (`toolArgs`).
  - **Ask before running** (`askFirst`): tool calls a person approves first; sensitive tools are
    added when picked.
  - **Limits**: an Agent's max steps, max tokens per answer and timeout; the graph's recursion limit
    under State (`config` / `defaultConfig` / `onConfigChange`).
  - **Pauses**: any Agent, Tools, Function or Subgraph node can pause the run before or after it.
    `toLangGraphConfig(workflow, config)` gives `interrupt_before`, `interrupt_after` and
    `recursion_limit`; `onSave` and `onRun` now also get it as `config`.
  - **Review**: pass `interrupt` when your run pauses and a dialog lets a person approve, edit or
    reject each tool call, or answer a question; `onResume({ nodeId, decisions })` gets the
    decisions in LangChain's human-in-the-loop shape. A Human review node picks which decisions it
    offers.
- `toLangGraphJSON(workflow, state, config)` keeps the config in START's metadata;
  `fromLangGraphJSON` returns it as `config`.
- `AgentGraph` (`@coreloom/agent-graph`): a multi-agent system as a graph. Agents are cards, teams
  are frames, and links show who delegates to whom (solid), who hands off to whom (dashed) and which
  tools and knowledge each agent uses (dotted). Laid out in layers without a graph library. One tab
  stop with arrow-key navigation, a List view that says the same in sentences, zoom and pan, and a
  run shown live with `activity` and `activePath`.
- `AgentTeams` (`@coreloom/ai-agent-teams`): the agent graph with a team filter and a panel on the
  selected agent (role, model, who it reports to, delegates and hands off to, what it uses) and
  links to its page and runs. `agentActivityFromSpans(spans, agents)` derives the live state from a
  run's trace spans.
- `TraceSpan` (ai-runs): optional `agentId` on agent spans, so a multi-agent run's trace can drive
  `AgentTeams`.
- `AgentPlan` (`@coreloom/agent-plan`): the steps an agent works through, ticked off live (to do,
  in progress, done, failed, skipped) with "2 of 5 done" and a bar. It reads the `data-plan` part
  your stream writes and rewrites with the same `id`. `active` stops the spinner when the agent
  stops; `announce` reads the step in progress out on its own.
- `ToolForm` and `formTool()` (`@coreloom/tool-form`): a tool that asks the person with a form
  (text, email, web address, number, date, choice, checkbox) before it goes on. The answer becomes
  the tool's output; Cancel answers with an error the model reads. The fields can be the app's, or
  written by the model as the tool's input (read defensively with `readToolFormFields`).
- `Chat`, `ChatWidget`, `ChatMessages`, `ChatMessage`: `data-plan` parts show as an `AgentPlan`;
  `renderData(part)` draws your own `data-*` parts; `onToolOutput` takes `addToolOutput` as it is.
- `ToolCall`: `onOutput`, and `awaitsInput` on a `tool` entry. While such a call waits, `render`
  gets `submit(output)` and `cancel(reason?)`, the card says "Waiting for you" and the call isn't
  marked busy.
- `@coreloom/ai`: `AiDataPart`, `AiPlan`, `AiPlanStep`, `isDataPart`, `readPlan` (maps other
  agents' statuses such as `in_progress` and `completed`) and `planProgress`.
- `agentTeamToWorkflow(team)` and `workflowToAgentTeam(workflow, { tools })` (ai-agent-builder):
  convert between the agent teams block and the agent builder's graph, in LangGraph's multi-agent
  patterns. A delegation is a supervisor (a Router to each worker, who comes back when done); a
  handoff is a swarm move (a route to the next agent, named by the link's label). Teams, roles,
  descriptions, tools and knowledge survive the trip, including through LangGraph JSON.
- `AgentTeams`: `onEdit(selectedId)` adds an **Edit graph** button to open your agent builder.
- `AgentTeams`: the panel shows each link's label next to the agent's name ("Tech support · Bugs").
- `ai-artifact`: a document or a piece of code a model wrote, opened in a panel beside the chat.
  `ArtifactPanel` shows its versions (‹ v2 ›, labels and times), Preview and Source for Markdown,
  **Changes** against the previous version (a line diff with both line numbers and folded unchanged
  lines), Copy, Download (a file built in the browser) and **Restore this version**.
  `ArtifactCard` is the chip a message shows to open it, drawn with the Chat's `tools`;
  `ArtifactLayout` puts the chat and the panel side by side, resizable, and lays the panel over the
  chat when the space is narrow, keeping the chat mounted. `diffLines` and `artifactFilename` are
  exported for apps that need the same diff or file names.
- `@coreloom/rules`: installs `AGENTS.md` at the app's root with the Coreloom design,
  accessibility and text rules, so coding agents follow them on every change.
- Usage examples for assistants: every Storybook story file is published as a `registry:example`
  item (`button-demo`, `overlays-demo`, `ai-chat-demo`…, 42 in all, covering every component). shadcn's
  MCP server returns their code when an assistant asks for an example.
- README: reading Coreloom from a remote MCP server (GitMCP, GitHub's MCP server) when there is no
  local project, for example in claude.ai.
- `Heatmap` and `CalendarHeatmap` (`@coreloom/heatmap`): values on a grid of squares in five steps
  of one chart color, with a Less → More legend. `Heatmap` takes `{ row, column, value }` cells
  (weekday × hour, service × day); `CalendarHeatmap` lays `{ date, value }` days out in Monday-first
  weeks. One tab stop with arrow keys; every cell is named with its row, column or full date, and
  value.
- `FunnelChart` (`@coreloom/funnel-chart`): the steps of a flow as an ordered list, each with a
  bar against the first step, its count and share of the start, and between steps the share that
  continued.
- `TrendChart` (dashboard): `stacked` (`true`, or `'percent'` for 100 %), a per-series `type` to mix
  bars, lines and areas (combo charts), and `axis: 'right'` with `formatSecondaryValue` for a
  second axis. The tooltip now shows each series' name next to its formatted value.
- `RadarChart` (`@coreloom/radar-chart`): up to three series compared on the same measures, one
  axis each around a circle.
- `ScatterChart` (`@coreloom/scatter-chart`): two measures across many items, up to three groups,
  with an optional `size` measure for a bubble chart and named points in the tooltip.
- `TreemapChart` (`@coreloom/treemap-chart`): many parts of a whole as tiles sized by value,
  colored by up to five groups, with names and values in tiles that have room for them.
- `SankeyChart` (`@coreloom/sankey-chart`): flows between nodes in columns, as wide as the flow,
  colored by the column they leave. Unknown ids, loops and non-positive values are left out.
- All four sit on Recharts through `ChartContainer`, and give screen readers their data as text:
  a table (radar, scatter) or a list with values and shares (treemap, sankey).
- `Sparkline` (`@coreloom/sparkline`): a word-sized trend (line, area or bars) in plain SVG for stat
  cards, table cells and list rows. Screen readers hear your label plus the first and last value,
  the low and the high.
- `DonutChart` (`@coreloom/donut-chart`): parts of a whole as a ring with the total in the middle
  and a legend that states each value and share. Parts past `maxSlices` (3 by default, 5 at most)
  fold into a grey "Other".
- `BarList` (`@coreloom/bar-list`): a ranking as an HTML list, with a proportional bar per row,
  optional links through the app's router and a "Show all" button past `limit`.
- `Gauge` (`@coreloom/gauge`): one value against its range as an open ring, exposed as a `meter`,
  with optional `warning` / `critical` zones (stated in words) and `higherIsBetter` for uptime or
  scores.
- `StatCard` (app-shell, dashboard): `sparkline` prop, recent values drawn as a small area chart
  under the value.
- `CodeEditor` (`@coreloom/code-editor`): code to write, on CodeMirror 6 in Coreloom's colours
  (light and dark from the tokens). Syntax colours for JavaScript / TypeScript (JSX), JSON, CSS,
  HTML, Markdown and Python, line numbers, folding, bracket matching, autocompletion, search and
  replace, diagnostics by line and column, Mod-S through `onSave`, one undo history per `path`, and
  more CodeMirror `extensions`. CodeMirror's own words follow the locale. `languageFromPath` is
  exported.
- `Ide` (`@coreloom/ide`, block): a code workspace laid out like VS Code, all in the browser: file
  explorer (folders from the paths), tabs with modified dots, the CodeEditor, a bottom panel with
  Problems and your own tabs (an output, a terminal, a preview), a status bar, Mod-P file search,
  a command palette (Mod-Shift-P), New file, Rename and Delete. Saving, running and diagnostics are
  your app's callbacks (`onSave`, `onRun`, `diagnostics`). Below 640 px of its own width the explorer
  moves into a sheet.
- `codeEditor` and `ide` message groups in en, fr, es and de.
- `CodeEditorLanguageSelect` (`@coreloom/code-editor`): a language picker to put in a CodeEditor's
  header; `CODE_EDITOR_LANGUAGES` lists the built-in languages with their names.
- `Ide`: the language in the status bar, and the new command "Change the file’s language", open a
  list of languages; the choice sets the file's `language` through `onFilesChange`.
- `Timeline` and `TimelineItem` (`@coreloom/timeline`): events in order on a line, with icon or dot
  markers tinted by tone, a title, a time, a description and any content below.
- `RelativeTime` (`@coreloom/relative-time`): "5 minutes ago", "yesterday", "in 3 days", kept up to
  date, with the full date in its tooltip; `formatRelative` is exported.
- `TreeView` (`@coreloom/tree-view`): a hierarchy to browse (files, pages, an organisation) with the
  APG tree keyboard and type-ahead, icons and trailing meta, read only or with single or multiple
  selection; `branchIds` is exported.
- `CodeViewer` (`@coreloom/code-viewer`): code with line numbers, highlighted lines ("3, 7-9"), a
  wrap toggle and Copy; `renderLine` plugs in a highlighter, `parseLineRanges` is exported.
- `DiffViewer` (`@coreloom/diff-viewer`): a line diff of two texts, unified or split, with unchanged
  runs folded; `diffLines` and `pairLines` are exported.
- `JsonViewer` (`@coreloom/json-viewer`): JSON to explore, objects and arrays folding, values
  coloured by type, Expand all, Collapse all and Copy.
- `DescriptionList` and `DescriptionItem` (`@coreloom/description-list`): labels and values,
  stacked, inline or in a grid; empty values say "Not set", `copy` adds a Copy button.
- `StatusIndicator` and `StatusDot` (`@coreloom/status-indicator`): a coloured dot and the word for
  it, plain or in a pill, with an optional pulse.
- `Banner` (`@coreloom/banner`): a message across the top of a page or app, by tone, with an
  action and an optional close button.
- `TruncatedText` (`@coreloom/truncated-text`): a text cut after a few lines with Show more, only
  when it is cut.
- `Highlight` (`@coreloom/highlight`): searched terms marked in a text, ignoring case and accents;
  `findMatches` is exported.
- `Tour` (`@coreloom/tour`): a guided tour lighting up each step's target, with a step count, Back,
  Next and Skip.
- `ImageGallery` and `ImageLightbox` (`@coreloom/image-gallery`): thumbnails and a full-screen
  viewer with arrows, keys, zoom and captions.
- `CommentThread` and `CommentComposer` (`@coreloom/comment-thread`): comments with one level of
  replies, emoji reactions, "@" mentions and a box to write.
- `RichTextEditor`: **Review changes** in the AI panel. A rewrite of existing text (improve, fix,
  shorten, lengthen, or an instruction) shows as changes in the text itself, removed words struck
  through and new ones underlined, compared word by word. A bar under the text steps through them
  (Previous / Next) and accepts or rejects each one, or all at once. Nothing changes in the document
  or in `value` until a change is accepted; each Accept is one undo step. New file
  `rich-text-review.tsx`, installed with the editor; new `ai.review` option (`false` removes it).
- `RichTextEditor`: `suggestion` takes a proposed version of the whole document (light Markdown,
  like an `onRequest` answer) and shows it as changes to accept or reject, without the AI panel: a
  review agent or a server-side pass can propose edits. Nothing is focused or scrolled when it
  arrives. `onReviewEnd({ accepted, rejected })` is called when a review (from `suggestion` or the
  panel) has nothing left. New type `RichTextReviewResult`.
- `FormRenderer` (`@coreloom/form-renderer`): builds a form at runtime from a FormSpec, a JSON
  description of its sections (in 1 to 3 columns), fields, checks and conditions (`visibleWhen`),
  with the Form fields. Values come back as JSON. `formFieldTypes` is the registry of field types
  (45, one per Form field: from text and money to chips, tree select, ranking,
  recurrence, time zone, image, key-value and JSON), extended with `types={{ ...formFieldTypes, mine }}`. `readFormSpec` reads
  an untrusted spec and reports what it fixed or left out; `fromJSONSchema` (with a
  react-jsonschema-form style UI schema) and `toJSONSchema` convert from and to JSON Schema.
- `FormBuilder` block (`@coreloom/form-builder`): makes a FormSpec without code, with a palette of
  field types, a live canvas (drag and drop, keyboard included), an inspector for each field,
  section and the form, a Preview, the JSON (editable FormSpec, or JSON Schema) and Import.
- `InputGroup` (`@coreloom/input-group`): a field with addons inside its border (icon, prefix,
  unit, button, keyboard hint, or a toolbar above or below a textarea), following shadcn's parts:
  `InputGroupAddon`, `InputGroupButton`, `InputGroupText`, `InputGroupInput`, `InputGroupTextarea`.
  Two ready-made groups: `PasswordInput` (show/hide toggle) and `SearchInput` (clear button,
  Escape clears).
- `ButtonGroup` (`@coreloom/button-group`): buttons, selects, inputs or a text label joined edge to
  edge, horizontal or vertical, with `ButtonGroupSeparator` and `ButtonGroupText`.
- `NumberInput` (`@coreloom/number-input`): a number typed the reader's way, with − / + buttons and
  spin-button keys (arrows, Shift or Page Up/Down, Home/End). Units and percents through
  `formatOptions`; `parseNumber` and `stepNumber` are exported.
- `NativeSelect` (`@coreloom/native-select`): the browser's `<select>` styled like the other fields.
- `AspectRatio` (`@coreloom/aspect-ratio`): Radix's aspect ratio box, as in shadcn.
- `TimePicker` and `DateTimePicker` (`@coreloom/time-picker`): a time typed ("14:30", "2:30 pm",
  "14h30") or picked from a list, shown in the reader's clock, with an `"HH:mm"` value; the
  date-time picker joins it with a `DatePicker` into one `Date`.
- i18n: new `inputs` group (show password, clear search, increase / decrease, time list and error,
  date / time part names) in English, French, Spanish and German.
- Form: `MaskedField`, `ColorField`, `RatingField`, `SliderField`, `UnitField`, `DurationField`,
  `MonthField`, `WeekField`, `SegmentedField`, `RadioCardField`, `CheckboxGroupField` and
  `KeyValueField` on `useAppForm`.
- `ChoiceCard` (`@coreloom/choice-card`): `RadioCardGroup`, `RadioCard` and `CheckboxCard`, radio
  buttons and checkboxes drawn as cards with a title, a description and an icon.
- `SegmentedControl` (`@coreloom/segmented-control`): two to five options in one pill, a radio
  group underneath.
- `UnitInput` (`@coreloom/unit-input`): a number with its unit, `{ value, unit }`, with optional
  conversion.
- `DurationInput` (`@coreloom/duration-input`): "1h30", "90" or "1:30" read as minutes;
  `parseDuration` and `formatMinutes` are exported.
- `MonthPicker` (`@coreloom/month-picker`, "YYYY-MM") and `WeekPicker` (`@coreloom/week-picker`,
  ISO "YYYY-Www").
- `KeyValueEditor` (`@coreloom/key-value-editor`): key and value rows, repeated keys flagged,
  pasted "KEY=value" lines split into rows.
- `EmojiPicker` (`@coreloom/emoji-picker`): a built-in, searchable set of common emoji, as a popover
  button or a panel.
- `SignaturePad` (`@coreloom/signature-pad`): sign with a pointer or type a name; a PNG data URL.
- `PasswordStrength` (`@coreloom/password-strength`): a strength meter and rule checklist.
- `CopyInput` in `@coreloom/input-group`: a read-only value with a copy button.
- Form: `ChipField`, `ScaleField`, `NumberRangeField`, `TimeRangeField`, `JsonField`,
  `MentionField`, `TreeSelectField`, `TransferField`, `ImageField`, `SortableField`,
  `RecurrenceField` and `TimezoneField` on `useAppForm`.
- `ChipGroup` (`@coreloom/chip-group`): pills that toggle on and off, as checkboxes (a `string[]`)
  or radios (`type="single"`), with optional counts.
- `ScaleInput` (`@coreloom/scale-input`): a survey scale, NPS (0–10) or worded Likert, as a radio
  group.
- `NumberRangeInput` and `TimeRangePicker` (`@coreloom/range-inputs`): two ends of a range, either
  may stay empty, an upside-down range flagged; `overnight` for night shifts.
- `JsonInput` (`@coreloom/json-input`): a code field for JSON that says on which line and column it
  breaks, with Format; `parseJson` is exported.
- `MentionTextarea` (`@coreloom/mention-textarea`): a textarea with "@" suggestions that stays
  plain text; `mentionsIn` lists who a text mentions.
- `TreeSelect` (`@coreloom/tree-select`): a select whose options nest, one value or several;
  `flattenTree` is exported.
- `TransferList` (`@coreloom/transfer-list`): two filterable lists with buttons to move items
  between them.
- `ImageInput` (`@coreloom/image-input`): one image with its preview (avatar, logo, cover), click
  or drop, type and size checked.
- `SortableList` (`@coreloom/sortable-list`): items to put in order by dragging, with the keyboard
  or with up and down buttons.
- `RecurrenceInput` (`@coreloom/recurrence-input`): how often something repeats, read back as a
  sentence; `toRRule` and `parseRRule` convert to and from iCalendar RRULE.
- `TimezoneSelect` (`@coreloom/timezone-select`): searchable IANA time zones with UTC offsets.
- `Combobox`: `onCreate` offers "Create “…”" when no option has the searched label.
- Form: `PasswordField`, `NumberField`, `TimeField` and `DateTimeField` on `useAppForm`, and
  `maxCount` on `TextField` / `TextareaField` for a character counter.
- `CharacterCount` (`@coreloom/character-count`): "120/280" under a text field, amber near the
  limit, red past it, announced to screen readers only when a threshold is crossed.
- `EditableText` (`@coreloom/editable-text`): text that becomes a field when clicked; Enter or blur
  saves, Escape restores, focus returns to the text.
- `SliderInput` (`@coreloom/slider-input`): a Slider and a NumberInput on one value.
- `MaskedInput` (`@coreloom/masked-input`): groups typed numbers the way they're printed, with
  presets that check them (IBAN, card, SIREN, SIRET) or your own pattern. `isValidIban`,
  `isValidLuhn` and `applyMask` are exported.
- `ColorPicker` (`@coreloom/color-picker`): a "#rrggbb" colour from swatches, a hex field or the
  system colour dialog.
- `Rating` (`@coreloom/rating`): radio-button stars to give a score, or a read-only score with halves.
- `NodeEditor`: the node panel has Settings, Input and Output tabs. `runs` takes each node's
  `input` and `output`; Input falls back to the output of the node before it.
- `NodeEditor`: text fields take `{{ path }}` expressions. Typing `{{` (or the braces button)
  suggests the input's fields, the app's `variables` and earlier nodes' outputs
  (`$node.<id>.<path>`) with a sample each; a preview under the field fills them from the sample.
  `expression: false` turns it off for a field.
- `NodeEditor`: `onRunNode({ node, input, workflow })` adds "Test node". The app runs that one node
  and resolves with `{ status?, output?, message? }`, shown on the card and under Output and offered
  to the nodes after it.
- `NodeEditor`: new field types — `conditions` (rules matched all or any, with the result for the
  sample), `keyValue` (rows of key and value), `code` (monospace; JSON is checked and an invalid one
  is an issue with the code `invalid`) and `credential` (one of the app's `credentials`, ids and
  names only; `onCreateCredential` adds "New credential").
- `node-editor-fields`: `resolveExpression`, `evaluateConditions`, `keyValuesToObject`, `dataPaths`,
  `readPath`, `jsonError` — path lookup only, nothing is evaluated.
- `WorkflowBuilder` passes the new props through `editorProps`; `AgentBuilder` takes `onRunNode` and
  offers its state fields in expressions.
- `NodeEditor` (`@coreloom/node-editor`): an n8n-style canvas on React Flow (`@xyflow/react`).
  The app declares its node kinds (ports, settings as data, icon, a summary line); people add nodes
  from a searchable list, drag them, draw connections from an output to an input, and configure the
  selected node in a side panel that also lists and makes connections, so everything works from the
  keyboard. Undo/redo, tidy up, zoom; missing settings and loose ends are flagged; `runs` shows what
  the app's run reports for each node. Nothing runs inside. Pure helpers for app code: `addNode`,
  `connectNodes`, `canConnect`, `removeNodes`, `updateNode`, `duplicateNode`, `layoutWorkflow`,
  `validateWorkflow`, `nodePorts`.
- `WorkflowBuilder` (`@coreloom/workflow-builder`): an automation's page — name, Save, Run (which
  waits until no node needs attention) — above the node editor.
- `AgentBuilder` (`@coreloom/ai-agent-builder`): design an agent graph the LangGraph way — shared
  state with replace/append reducers, Agent, Tools, Function, Router (conditional edges, one output
  per route), Human review and Subgraph nodes between START and END. `toLangGraphJSON` /
  `fromLangGraphJSON` read and write the shape of LangGraph's `get_graph().to_json()`; `onSave` and
  `onRun` get the graph and that JSON. No dependency on LangGraph.
- `NodeEditor`: notes and groups on the canvas. `Workflow.notes` (`{ id, position, width, height,
text, color? }`) and `Workflow.groups` (`{ id, position, width, height, label, color? }`) sit behind
  the cards and are never run nor checked. Add them from the toolbar or the canvas menu; Ctrl/⌘+G
  groups the selection. Text and names are edited in place, both resize from handles and take a
  colour from their right-click menu; moving a group moves what's inside, and Tidy up refits groups.
- `NodeEditor`: "Find on the canvas" (Ctrl/⌘+F) lists nodes, notes and groups; picking one selects
  it, brings it into view and focuses it.
- `NodeEditor`: a minimap (React Flow's `MiniMap`, pannable and zoomable) with a toolbar toggle; the
  `minimap` prop (default true) removes both when false.
- Helpers in `node-editor-canvas`: `addNote`, `addGroup`, `updateNote`, `updateGroup`, `moveGroup`,
  `groupMembers`, `removeCanvasItems`, `refitGroups`.
- `NodeEditor`: pinned sample data. `WorkflowNode.pinned` holds a sample output, set from Output
  ("Pin this output", or "Add sample data" as JSON). It stands in while no run reports an output, and
  a node without output passes its input on, so a sample pinned to the trigger feeds every node after
  it.
- `NodeEditor`: drag a field from the Input tab onto a setting; it lands as `{{ path }}`.
- `NodeEditor`: "+" after unconnected outputs and on connections adds a node there, connected;
  right-click menus for nodes, connections and the canvas; Ctrl/⌘+C / X / V copy, cut and paste
  nodes with their connections (also through the system clipboard); D or `WorkflowNode.disabled`
  disables a node (dimmed, not checked).
- Helpers: `insertNodeOnEdge`, `copyNodes`, `pasteNodes` (untrusted input is filtered).
- `@coreloom/ai-evals`: `EvalSuiteList` (suites with their last pass rate against a threshold, the
  trend and Run) and `EvalRunReport` (one eval run case by case with scores, the judge's verdict and
  reasoning, per-metric scores; with `baseline`, two runs side by side with regressions,
  improvements and a split diff of the outputs). `summarizeEvalRun` and `compareEvalRuns` are
  exported. It complements `ai-runs`.
- `@coreloom/file-manager`: `FileManager`, folders and files in a grid or a list with a breadcrumb,
  multi-selection, drag and drop onto folders and crumbs (or Move to), uploads dropped from the
  computer and a details panel. Helpers: `fileManagerPath`, `sortFileItems`, `canMoveTo`,
  `selectRange`, `fileTypeOf`.
- `@coreloom/inbox`: `Inbox`, shared conversations for a support or sales team: list with search
  and filters (status, unread, mine, unassigned), thread with internal notes and attachments, a
  composer for replies and notes, status and assignee. `filterConversations` is exported.
- `@coreloom/spreadsheet`: `Spreadsheet`, an editable grid like a spreadsheet: keyboard navigation,
  type or Enter to edit, range selection, copy, cut and paste as tab-separated text, undo and redo,
  and the sum and average of the selection. `parseTsv`, `toTsv`, `parseSheetValue` and
  `pasteIntoRows` are exported.
- New i18n groups `fileManager`, `inbox`, `spreadsheet` and `ai.evals` in all four languages.
- `Gantt` (`@coreloom/gantt`, block): a roadmap on a timeline, with progress bars, milestones,
  dependency arrows (red when a task starts too early), groups, a today line and a day / week / month
  zoom. With `onTaskChange`, bars move and resize with the mouse or the arrow keys (Shift moves the
  end).
- `StatusPage` (`@coreloom/status-page`, block): the overall state, components with 90 days of
  uptime, ongoing incidents with their updates and past incidents. `UptimeBar` (a slider that reads
  each day aloud) and `IncidentTimeline` are exported too.
- `ApiKeys` (`@coreloom/api-keys`, block): keys with their visible ends, access, last use and expiry;
  Create shows the new secret once in a `SecretValue`; Revoke is confirmed.
- `Webhooks` (`@coreloom/webhooks`, block): endpoints with events, on / off and signing secret, and
  their deliveries with payload, response, Redeliver and Send test event.
- `TwoFactorSettings` and `ActiveSessions` (`@coreloom/security-settings`, block): two-step sign-in
  with an authenticator app (setup, code, recovery codes, turn off) and the signed-in devices.
- `AuditLog` (`@coreloom/audit-log`, block): events grouped by day, with search, actor and action
  filters, details, Export and Load more.
- `Integrations` (`@coreloom/integrations`, block): connectable apps as cards, with search and
  category filters; Connect, Configure, Disconnect.
- `PromptManager` (`@coreloom/prompt-manager`, block): a prompt's versions, an editor that finds
  `{{variables}}`, a diff between versions, Deploy to a label and a streamed test. `templateVariables`
  and `fillTemplate` are exported.
- `apiKeys`, `webhooks`, `security`, `auditLog`, `integrations`, `gantt`, `statusPage` and
  `promptManager` message groups in en, fr, es and de.
- `@coreloom/showcase`: sections for the public site of a practice, a studio or a firm. `PractitionerCard` and `PractitionerGrid` (portrait or initials, profession, specialties, bio, facts, booking actions). `ContactSection`, `ContactDetails` (address with a directions link, phone, email, access and parking) and `OpeningHours` (the week in the locale's format, today marked, "Open now · Closes at 12:30" / "Opens tomorrow at 9:00", exceptional hours; `openingStatus` is exported). `MediaSection` (image beside text), `Quote` (default, large or card) and `LegalLayout` (legal notice or privacy policy with numbered sections and a table of contents). Guide: Blocks / Showcase.
- `surfaces.css` in `@coreloom/theme`: the mineral and bone surface presets (`data-surface` on `<html>` or on a band), every background, border and text grey in both themes, checked AA with every accent preset by `build/gen-surfaces.py`. Storybook has a Surface toolbar. Guide: Foundations / Surfaces.
- `Hero` takes `media` with `layout="split"` (image beside the text, `mediaPosition`) or `layout="cover"` (image behind a scrim, dark theme), an `eyebrow`, `highlightStyle="solid"` and `glow`; extra props go to the `<section>`.
- `SiteFooter` takes `brand`, `columns` (`{ title, links?, content? }`) and `social` for a multi-column footer. Its link row's label is translated.
- `Terminal` (`@coreloom/terminal`): a command line in the page, with a prompt, history (↑ ↓), Tab
  completion (`onComplete`), ANSI output, Ctrl+C, Ctrl+L, Stop, Clear and Copy. It runs nothing
  itself. `onCommand(command, context)` returns text, a promise or an async iterable (a stream).
  `context.signal` aborts on Ctrl+C, and `context.read({ prompt, secret })` asks a question
  mid-command. You can also connect a `session` (`onData`, `write`, `resize`, `interrupt`, `onExit`):
  a process that prints its own prompt, the shape xterm.js uses. `useTerminal` and `createTerminal`
  keep the output outside the component; `useTerminalState` reads it.
- `AnsiOutput` (`@coreloom/ansi-output`): program output with ANSI colours (16 from the theme's
  tokens, 256, true colour), styles, OSC 8 links and progress-bar rewrites (carriage return, erase
  line, cursor up). The incremental parser is exported as `writeAnsi`, `parseAnsi` and `stripAnsi`.
- `LogViewer` (`@coreloom/log-viewer`): a long, virtualized log with ANSI colours. It has search
  (marked words), level filters with counts, wrap, follow the end and copy. Levels and ISO
  timestamps are read from raw `text` (`parseLogText`), or you pass `entries`.
- `TerminalConsole` (`@coreloom/terminal-console`, block): several terminals in tabs, with New
  terminal (a menu of `profiles`), a side by side split and Close.
- `PipelineRun` (`@coreloom/pipeline-run`, block): one CI or deploy run, with its status, jobs,
  steps and each step's searchable log. The failed step opens by itself; Re-run, Cancel and Re-run
  job are callbacks.
- `Ide`: the bottom panel can be controlled (`panelOpen` / `onPanelOpenChange`, `panel` /
  `onPanelChange`), so Run can open a Terminal panel.
- `terminal`, `logViewer`, `terminalConsole` and `pipelineRun` message groups in en, fr, es and de.
- `Toolbar` and its parts (`@coreloom/toolbar`): a row of tools that is one Tab stop, with
  arrow-key navigation, toggle groups, links, separators and a More menu.
- `ActionBar` (`@coreloom/action-bar`): a bar for the selected items, with their count, bulk
  actions, and Escape or a close button to clear the selection.
- `Popconfirm` (`@coreloom/popconfirm`): a small confirmation anchored to its trigger, Cancel
  focused first, with an async confirm.
- `SecretValue` (`@coreloom/secret-value`): an API key or token as dots, with Show and Copy;
  `maskSecret` is exported.
- `FormatNumber`, `AnimatedNumber` and `formatValue` (`@coreloom/format`): numbers, percentages,
  currencies, compact numbers and bytes written for the locale, and a count-up.
- `NotificationBadge` (`@coreloom/notification-badge`): a count (99+) or a dot on an icon or an
  avatar, with the count in words for screen readers.
- `OverflowList` (`@coreloom/overflow-list`): a one-line row that shows what fits and ends with
  "+N" opening the rest.
- `FileCard` and `FileCardList` (`@coreloom/file-card`): an attached file with its type, size,
  upload progress, error, Retry and Remove.
- `useHotkeys`, `Hotkey` and `ShortcutsDialog` (`@coreloom/keyboard-shortcuts`): shortcuts with
  "mod" and sequences, drawn as keys, and a dialog listing them.
- `Countdown` (`@coreloom/countdown`): the time left as a clock, boxes or a short phrase, with
  `onComplete`.
- `QuotaBar` (`@coreloom/quota-bar`): how much of a limit is used, by segment, turning amber then
  red near the limit.
- `@coreloom/vscode`: Coreloom UI in VS Code extension webviews. `vscode.css` maps the tokens onto the editor's `--vscode-*` variables (dark, light, high contrast, the editor's fonts) and cancels the default styles VS Code injects into webviews. `syncVsCodeTheme()` follows the editor's theme live. `useVsCodeState` keeps UI state while the tab is hidden. `postToExtension` and `useExtensionMessages` exchange typed messages with the extension. Guide: Foundations / VS Code. The new `examples/vscode-webview` is a working extension with a strict Content Security Policy and a browser preview.
- `SidebarProvider` takes `keyboardShortcut={false}` and `CommandMenu` takes `shortcut={false}`, to leave Ctrl/Cmd+B and Ctrl/Cmd+K to the host (VS Code uses both).

### Changed

- `AgentGraph`: an agent selected out of sight (from the panel's links, say) scrolls into view.
- `AgentGraph`: without `defaultView`, a box too narrow to read the graph (a phone) starts on the
  list view.
- AI artifact: the Changes tab uses `DiffViewer`; `diffLines` now lives in `@coreloom/diff-viewer`
  (still re-exported from the block). The diff strings moved from `ai.artifact` to `display.diff`
  in the messages (`ai.artifact.noChanges` stays).
- `RichTextEditor`: for a rewrite, **Review changes** is now the main (focused) button in the AI
  panel, and Replace is next to it. Translations, summaries, continuations and answers at the `/`
  spot keep their main action.
- `SelectTrigger` takes `onClear` and `Combobox` takes `clearable`: a × button that empties the
  field while something is picked. With it, `className` goes on a wrapper around the trigger.
- `NumberInput`: holding − or + repeats the step.
- `NodeEditor`: key/value rows put the key above the value, so both stay readable in the panel.
- `updateNode` takes `disabled` and `pinned`; `undefined` (or `disabled: false`) removes the key.
- Every registry item that has a guide now links it: the published `r/<name>.json` and
  `r/registry.json` end the item's description with `Guide: <url>` and carry the same links in
  `docs`. Assistants that browse `@coreloom` through shadcn's MCP server (which only shows
  descriptions) can now open the guide: when to use the item, its props and accessibility rules.
- README: setting up shadcn's MCP server for Codex and OpenCode, and for any other MCP client.
- `Hero`'s highlight gradient follows the accent (from the accent text colour towards the text colour) instead of a fixed cyan, so it matches every accent preset and generated accent.
- Accent presets and generated accents (`generateAccent`) also apply on an element that is itself `data-theme="dark"` inside a light page, so a dark band keeps its accent: put `data-accent` on the same element as `data-theme`.

### Fixed

Gauge: the number, label and status now sit on the ring's center and stay inside the threshold ticks. The number shrinks to fit when it's long ("99.32 %", "7.4M"), and the text scales with `size`.

- `removeNodes` kept only `nodes` and `edges`; it now keeps the rest of the workflow.
- `DiffViewer` (split view): a short line no longer sits vertically centred next to a long wrapped
  one on the other side; both start at the top of the row.

### Upgrading

- To use AgentAvatar in an app that installed `@coreloom/theme` before, add the theme again
  (`pnpm dlx shadcn@latest add @coreloom/theme`) for the new animations.
- New strings in `ai.agentBuilder`: re-install `@coreloom/i18n` (and `@coreloom/i18n-es` /
  `@coreloom/i18n-de` if you use them) with `--overwrite` first. The block now also needs
  `@coreloom/radio-group`.
- Both items read new strings (`ai.agentGraph`, `ai.agentTeams`): re-install `@coreloom/i18n` (and
  `@coreloom/i18n-es` / `@coreloom/i18n-de` if you use them) with `--overwrite` first.
- These read new strings (`ai.plan`, `ai.toolForm`): re-install `@coreloom/i18n` (and
  `@coreloom/i18n-es` / `@coreloom/i18n-de` if you use them) and `@coreloom/ai` with `--overwrite`
  first, then `@coreloom/tool-call` and `@coreloom/ai-chat`.
- `AgentTeams` reads a new string (`ai.agentTeams.edit`): re-install `@coreloom/i18n` (and
  `@coreloom/i18n-es` / `@coreloom/i18n-de` if you use them) with `--overwrite` first.
- `ai-agent-builder` now depends on `@coreloom/agent-graph` (types only).
- The panel reads new strings (`ai.artifact`): re-install `@coreloom/i18n` (and
  `@coreloom/i18n-es` / `@coreloom/i18n-de` if you use them) with `--overwrite` before adding
  `@coreloom/ai-artifact`.
- The new items read new strings in the `charts` group: re-install `@coreloom/i18n` (and
  `@coreloom/i18n-es` / `@coreloom/i18n-de` if you use them) with `--overwrite` first.
- The new items read new strings in the `charts` group: re-install `@coreloom/i18n` (and
  `@coreloom/i18n-es` / `@coreloom/i18n-de` if you use them) with `--overwrite` first.
- The new items read new strings (`charts`): re-install `@coreloom/i18n` (and `@coreloom/i18n-es` /
  `@coreloom/i18n-de` if you use them) with `--overwrite` first. Re-installing the app-shell or
  dashboard block pulls in `@coreloom/sparkline` for `StatCard`.
- The editor reads new strings: re-install `@coreloom/i18n` (and `@coreloom/i18n-es` /
  `@coreloom/i18n-de` if you use them) with `--overwrite` first, then
  `@coreloom/rich-text-editor` with `--overwrite`.
- To keep Replace as the main action, pass `ai={{ onRequest, review: false }}`. Tests that press
  Enter on the panel's focused button after a rewrite now start a review instead of replacing.
- Re-install `@coreloom/i18n` (and `-es` / `-de`) with `--overwrite`, then `@coreloom/node-editor`:
  it now has a second file, `node-editor-fields.tsx`, and needs `@coreloom/tabs`.
- `text` and `textarea` fields now take expressions and show the braces button; add
  `expression: false` where that isn't wanted.
- `WorkflowIssue` has a new code, `invalid`: handle it if you switch over the codes.
- The new items read new strings (`nodeEditor`, `workflow`, `ai.agentBuilder`): re-install
  `@coreloom/i18n` (and `@coreloom/i18n-es` / `@coreloom/i18n-de` if you use them) with
  `--overwrite` first.
- `@coreloom/node-editor` adds the `@xyflow/react` dependency and imports its base stylesheet
  (`@xyflow/react/dist/base.css`) from the component.
- Re-install `@coreloom/i18n` (and `-es` / `-de`) with `--overwrite` (new `nodeCanvas` group), then
  `@coreloom/node-editor`, which adds `node-editor-canvas.tsx`.
- If your app stores or executes workflows, keep `notes` and `groups` when you save, and ignore them
  when you run.
- Re-install `@coreloom/i18n` (and `-es` / `-de`) with `--overwrite`, then `@coreloom/node-editor`
  (it now uses `@coreloom/context-menu`).
- If your run executes the graph, skip nodes with `disabled: true` (pass their input on), and decide
  whether a `pinned` output replaces running the node.
- New strings: re-install `@coreloom/i18n` (and `@coreloom/i18n-es` / `@coreloom/i18n-de` if you
  use them) with `--overwrite` before adding these items.
- Re-add `@coreloom/theme` for `surfaces.css` and import it after `accents.css`. Regenerate a `brand.css` made with the theme generator if a dark band of your page should use it.
- New strings: re-install `@coreloom/i18n` (and `@coreloom/i18n-es` / `@coreloom/i18n-de` if you
  use them) with `--overwrite` before adding these items.

## [0.9.0] - 2026-11-01

### Added

- Generative UI: `Chat` (and `ChatWidget`, `ChatMessages`, `ChatMessage`) take `tools`, a map from
  tool name to `{ render, label, display }`, so a tool call shows as your own component (a weather
  card, a list of results) instead of JSON. `render` gets the call in every state, narrowed by
  `state` (`output` once it answers, a partial `input` while it streams, `respond(approved)` while it
  asks); returning `undefined` keeps the usual card for that state. `display: 'inline'` draws the
  component in place of the card, as a group named after the tool and busy until it answers.
- `ToolCall`: a `tool` prop takes the same object. New types `ToolComponent`, `ToolComponents`
  (typed from your tools: `ToolComponents<InferUITools<typeof tools>>`), `ToolRenderProps` and
  `ToolRenderState`.
- A Generative UI guide.

### Fixed

- `ToolCall`: after Allow or Deny, focus moves to the card instead of being lost with the buttons.

## [0.8.0] - 2026-10-31

### Added

- AI components: `PromptInput` (Enter sends, Shift + Enter breaks the line, Send becomes Stop while
  streaming, attachments), `Markdown` (model output with GFM tables, task lists and code blocks
  with Copy; raw HTML skipped), `Reasoning` (thinking folded under "Thought for N s") and
  `ToolCall` (a tool's state, input, output or error, and Allow / Deny when it needs approval).
- AI blocks: `ai-chat` (`Chat` with reasoning, tool calls, sources, copy, regenerate, feedback,
  a live log and stick-to-bottom scrolling; `ConversationList` with search, day groups, rename and
  delete), `ai-agents` (`AgentList`, `AgentEditor` with `{{variables}}` and ask-first tools),
  `ai-runs` (`RunList`, `RunTrace` waterfall), `ai-playground` and `ai-knowledge`
  (`KnowledgeBase`, `RetrievalTest`). `@coreloom/ai` types read the AI SDK's `UIMessage` parts as
  they are (checked against `ai` 7 in the unit tests); nothing depends on the SDK or calls an API.
- Starter: Assistant, Agents, Runs, Playground and Knowledge pages on in-memory data, with a
  simulated `useChat` (the `@coreloom/demo-chat` item, `src/hooks/use-demo-chat.ts`); the README
  shows the swap to `@ai-sdk/react`.
- `InlineCitation`: numbered source pills in a model's text; hover or focus shows the source,
  click, tap or Enter keeps it open. `Markdown` takes `sources` and turns `[1]` markers into
  citations (not in code or links, and safe while streaming).
- AI chat: edit a sent message (`onEdit`; Escape cancels, ⌘/Ctrl + Enter saves) and switch between
  versions of a message (`branches` + `onBranchChange`, "‹ 2 / 3 ›", announced).
- `ModelPicker` (with `ModelList`, and `ModelField` for the form kit as its own item): a searchable list of models
  grouped by provider, with context window, price per million tokens and capabilities.
  `ContextMeter`: how full the context window is, as a ring or bar with the token breakdown and
  estimated cost. `AiModel` gains optional `contextWindow`, `pricing`, `capabilities`, `disabled`;
  new `AiUsage` and helpers (`formatTokens`, `estimateCost`, `contextLevel`…).
- `ai-chat-widget` block: the support bubble in a page's corner — a launcher with an unread count
  and a greeting, opening the Chat in a card (a full-screen sheet on phones).
- `RichTextEditor` takes an optional `ai` prop: an AI button and ⌘/Ctrl + J open a panel to rewrite
  or write with your own `onRequest` (quick actions, streamed preview with Stop, Replace / Insert
  below / Try again). Answers are inserted as text, never HTML.
- `CommandMenu` and `AppShell` take `onAskAi(query)`: "Ask AI: “…”" comes first in the ⌘K results.
  `CommandDialog` takes a cmdk `filter`.
- Starter: the assistant has a model picker, a context meter, inline citations and editable
  messages; "Ask AI" in ⌘K opens it with the question; project notes have the editor's AI panel.
- Storybook: a page per AI component with Controls, frozen streaming states (waiting, thinking,
  answering), attachments and document sources, a tool result drawn as UI, empty states, a failing
  playground variant, a running trace, French versions, and a "With the AI SDK" guide.
- New logo: Coreloom's ginger cat, redrawn on a 256 grid from three shapes (head, eyes cut out, cyan
  slit pupils) so it holds at 16 px and in one colour; dark, light, one-colour, small-size and tile
  versions with lockups. Storybook's sidebar and tab and the starter's brand and favicon use it.
- `DataTable` `virtual`: thousands of rows in a fixed-height box, only the visible ones rendered
  (TanStack Virtual), header pinned, `aria-rowcount` / `aria-rowindex` for screen readers.
- `VirtualList`: a long list with measured item heights and load-more at the end, made for
  `useInfiniteQuery`.
- Guidelines in Storybook: a page per component and block (when to use it, what it takes, its
  rules, a live example), from the design system's guides; CI checks each one renders.
- Design tokens in the DTCG format (2025.10) at https://eldenn.github.io/coreloom-ui/tokens/ and on
  each release: base, dark and light files plus a resolver, for Figma, Style Dictionary or native
  apps. `pnpm tokens:dtcg` writes them; unit tests check every colour against `tokens.css`.
- `ForgotPasswordForm` and `ResetPasswordForm` in the `auth` block. The first confirms without
  saying whether the account exists and moves focus to its new heading; the second checks the two
  passwords against each other and hands the account's email to password managers.
- `AccentPicker` and `useAccent()` in `@coreloom/theme-toggle`: one swatch per preset, a radio
  group, saved in `localStorage("accent")`. `accents.css` gains a `cyan` preset that brings the
  default back inside an element with another accent.
- Starter: sign-up with an emailed code, forgot / reset password, Settings → Appearance (theme and
  accent, applied before the first paint), and project notes in the rich text editor, loaded with
  `React.lazy` so Tiptap downloads only on project pages.
- `@coreloom/demo-chat`: `useDemoChat`, a stand-in for the AI SDK's `useChat` that simulates a
  model in the browser (reasoning, a tool call, an approval, a streamed answer citing a source), to
  prototype AI screens with the Chat block before there is a backend. Configurable `script` (tool,
  source, approval tool, speed). The starter now installs it from the registry.
- For AI assistants: `llms.txt` (every item with its install name and guide), `llms-full.txt`
  (all guides in one file) and `guides/*.md`, published with the site; the README shows how to turn
  on shadcn's MCP server so Claude Code, Cursor or VS Code can install `@coreloom/*` items. The
  starter ships `.mcp.json`.
- `RichTextEditor`: with `ai` set, typing `/` at the start of a line or after a space opens a menu of AI commands
  (Ask AI…, Continue writing and the quick actions), filtered as you type, keyboard-driven and
  announced to screen readers. Choosing opens the AI panel where the slash was; **Insert here**
  puts the answer there (and is the focused button; **Replace all** stays a click away). The menu
  works inside dialogs and sheets; Enter right after a lone `/` is a plain new line. Turn it off
  with `ai.slashCommand: false`. Continue writing sends the `'continue'` action, whose `text` is the
  document before the cursor: handle it in your `onRequest`.
- Theme generator: from one brand colour, `generateAccent(hex)` (`@coreloom/accent`) builds the
  whole accent family for both themes, checks every contrast pairing (adjusting lightness when a
  check fails) and writes a `brand.css` to import after `accents.css` (`data-accent="<name>"`).
  Try it on the Storybook page Foundations → Theme generator, or run
  `pnpm brand "#ff5a1f" --name orange > brand.css`.
- Repository: unit tests (Vitest, `pnpm test:unit`) for the parsers and formatters (money, phone,
  typed dates, file sizes, emails); visual tests of every block at phone width (390 px); weekly
  Renovate pull requests, nothing younger than 14 days; and the **Visual baselines** workflow now
  starts **Registry & Storybook** after committing the screenshots.

### Changed

- Light theme: `accent` `#009f96` → `#00968d` and `accent-fg` `#007270` → `#006f6c`. The accent
  fill was 2.9:1 on `surface-inset`, under the 3:1 non-text minimum; it is now 3.1:1 or more on
  every surface. The change is barely visible.

### Fixed

- AI blocks: `KnowledgeBase` with no documents says so instead of showing an empty table; ids in
  `AgentEditor`, `RunTrace`, `Playground` and `RetrievalTest` come from `useId`, so two on a page
  don't clash; a running trace step says "Running" to screen readers.
- `ToolCall`: a `renderOutput` that returns `undefined` falls back to JSON (the chat used to show
  nothing), a drawn result shows unfolded, long tool names wrap, and its Input / Output / Error
  labels are no longer headings (they broke the page's heading order).
- `Markdown`: a code block that scrolls sideways takes focus, so keyboard users can scroll it;
  footnotes are translated, labelled with a paragraph instead of a heading, get ids of their own per
  block, and in-page links no longer open a new tab.
- AI chat: source links are limited to http(s) and mailto (others show as text).
- Starter: the French workspace URL hint was in English.

### Upgrading

- The new items read new strings in every locale: re-install `@coreloom/i18n` (and
  `@coreloom/i18n-es` / `@coreloom/i18n-de` if you use them) with `--overwrite` first, then add them.
- Re-install `@coreloom/theme` with `--overwrite` for the new light accent and the `cyan` preset,
  then update your own visual baselines if you keep screenshots.

## [0.7.0] - 2026-10-30

### Added

- `MultiSelect`: several values from a list, chips in the trigger, a searchable checklist with
  select all / clear and an optional maximum. Form field: `MultiSelectField`.
- `MoneyInput`: an amount typed the locale's way ("1 234,50"), the currency symbol where the locale
  puts it, a `number | null` value rounded to the currency's decimals. Form field: `MoneyField`.
- `PhoneInput`: a searchable country picker and the national number in its usual grouping; the
  value is E.164, `isValidPhone()` checks it. Form field: `PhoneField`.
- `DatePicker` `typing`: a text input that reads dates in the locale's order, with the calendar a
  button away; impossible dates are refused with the expected format. `DateField` passes it on.
- `DataTable` `server`: the API sorts, searches and pages; `query` / `onQueryChange` / `rowCount`
  / `loading`. Starter: a Deployments page keeps that query in the URL and fetches it with
  TanStack Query.
- `RichTextEditor`: Tiptap with a Coreloom toolbar (marks, headings, lists, quote, code, links,
  undo), Markdown shortcuts, an HTML value; `RichTextField` for the form kit lives beside it so
  `@coreloom/form` doesn't pull in Tiptap. The form kit now exports `useFieldMeta`,
  `VerticalShell` and `describedBy` for custom fields.
- Blocks: `notifications` (bell, unread count, all / unread, mark read), `team` (members, roles,
  invites with checked emails, confirmed removal), `billing` (plan, usage meters, payment method,
  invoices), `kanban` (drag and drop with pointer or keyboard, announced, plus a Move to menu; WIP
  limits) and `event-calendar` (month grid, agenda on phones, locale week start).
- Starter: notifications in the header (TanStack Query, optimistic mark-as-read), and Members and
  Billing settings sections.
- Accent presets: `accents.css` (part of `@coreloom/theme`) adds blue, violet, amber and rose,
  set with `<html data-accent>`; every pairing is checked in both themes by `build/gen-accents.py`
  and by axe in CI. Storybook has an Accent toolbar.
- Spanish and German: `@coreloom/i18n-es` and `@coreloom/i18n-de`, passed as `messages`. Storybook's
  Language toolbar has them, and CI runs axe in both.
- The starter runs as a live demo at https://eldenn.github.io/coreloom-ui/starter/, deployed with
  Storybook. It honours Vite's `base` as the router's basepath, so it also works under a sub-path.
- `CardTitle` takes `asChild` to render your own heading element with the card title's style.

### Fixed

- `LoginForm`, `SignupForm` and `VerifyForm` title the page with an `<h1>` (it was a `<div>`), so
  screen-reader users can find it from the headings list.
- Starter: the dashboard's demo activity follows the app's language.

### Upgrading

- The new components read new strings: re-install `@coreloom/i18n` with `--overwrite` first
  (it holds English and French), then add them.
- Re-install `@coreloom/auth` with `--overwrite` for the `<h1>` titles, and `@coreloom/card` for
  `CardTitle asChild`.

## [0.6.0] - 2026-10-29

### Added

- **Starter** (`starter/`): a Vite + React app on TanStack Router (file routes), TanStack Query
  and TanStack Form, with the Coreloom components, providers, theme script, English and French,
  and these screens wired: sign in, dashboard, projects (filters in the route's search params),
  project detail, settings, 404 and error. Demo data is local; no API. Start one with
  `pnpm dlx degit Eldenn/coreloom-ui/starter my-app`.
- **Interaction tests** in CI (`tests/interactions.spec.ts`): keyboard and pointer behaviour of
  the inputs, the form kit, the data list's URL state, the onboarding wizard, the theme menu,
  dialogs and menus, run against the built Storybook next to the a11y and visual tests. The
  starter is built in CI and tested end to end, with axe on every screen in both themes.
- `@coreloom/link`: `CoreloomLinkProvider` hands the blocks your router's link, so the sidebar,
  breadcrumbs, settings nav, auth and error pages navigate client-side (TanStack Router, Next.js…).
  Without a provider they render a plain `<a>`, as before.
- `CHANGELOG.md` and the **Release** workflow: pushing a `v*` tag checks the version, then
  publishes a GitHub release with this file's notes and the registry JSON attached.

### Changed

- `FileUpload` sizes read "78 B" / "2.3 MB" ("78 o" / "2,3 Mo" in French) instead of "78 byte".

### Fixed

- Next.js: a server component passing the same icon element twice (two nav items with
  `<HomeIcon />`) made the build fail with "Element type is invalid". The blocks now render any
  icon that isn't a component as a node.

### Upgrading

- Blocks now import `@/lib/link`: re-install them with `--overwrite` (or
  `pnpm dlx shadcn@latest add @coreloom/link`). Next.js: `<CoreloomLinkProvider component={Link}>`
  with `Link` from `next/link`, in your client providers.

<!-- 0.1.0 to 0.5.0 predate the release workflow and have no tags. -->

## [0.5.0] - 2026-10-29

### Added

- Components: `DateRangePicker` (two months, shortcuts), `TagsInput`, `FileUpload` (drop zone,
  thumbnails, progress, type / size / count checks) and `Stepper`.
- Form kit fields: `DateRangeField`, `TagsField`, `FileField`.
- Blocks: `dashboard` (stat grid, trend chart, activity feed), `data-list` (search, faceted
  filters, pagination, state in the URL), `pricing` (monthly / yearly), `onboarding`
  (multi-step wizard) and `error-pages` (404, 500, maintenance).
- `ThemeMenu`: Light, Dark or System; System follows `prefers-color-scheme` live.

### Changed

- The app shell's header uses `ThemeMenu` instead of `ThemeToggle`.
- `useTheme()` returns `{ theme, preference, setTheme, toggleTheme }`; `preference` can be
  `"system"`.

### Upgrading

- Replace the anti-flash script in `index.html` / the root layout with the new one from the
  getting-started guide, which also handles `"system"`.

## [0.4.0] - 2026-10-29

### Added

- `@coreloom/i18n`: `CoreloomI18nProvider` and `useCoreloomI18n()`. Every built-in string
  (labels, placeholders, screen-reader text, validation messages) in English and French,
  overridable per string; dates follow the date-fns locale.
- Next.js App Router support, verified with a production build: blocks accept icons as elements
  (`icon: <HomeIcon />`) so server components can pass them.

### Upgrading

- Components now read their strings from the i18n context; English is used without a provider.
  Re-install with `--overwrite` to get `src/lib/i18n.tsx`.

## [0.3.0] - 2026-10-29

### Added

- `@coreloom/form`: TanStack Form kit (`useAppForm`) with text, textarea, select, combobox,
  date, radio, checkbox, switch and one-time-code fields, a submit button and form-level errors;
  Standard Schema validation (zod).
- CI tests: axe on every story (dark, light, French) and screenshots of every story compared
  with baselines from the **Visual baselines** workflow. Pages deploy only when they pass.

### Changed

- The `auth` and `settings` blocks use the form kit, with validation and a submitting state.

## [0.2.0] - 2026-10-29

### Changed

- Accessibility pass: token contrasts raised to WCAG AA (muted text, strong borders, focus ring,
  accent and status colours in light), every story axe-clean.

## [0.1.0] - 2026-10-29

### Added

- The registry: theme (tokens, fonts, Tailwind mapping), 54 components on shadcn/ui (Radix) and
  the blocks `app-shell`, `auth`, `settings`, `marketing` and `docs`.
- Storybook with a theme switch and the accessibility panel, published on GitHub Pages.

[1.0.0-rc.0]: https://github.com/Eldenn/coreloom-ui/releases/tag/v1.0.0-rc.0
[0.11.0]: https://github.com/Eldenn/coreloom-ui/releases/tag/v0.11.0
[0.10.0]: https://github.com/Eldenn/coreloom-ui/releases/tag/v0.10.0
[0.9.0]: https://github.com/Eldenn/coreloom-ui/releases/tag/v0.9.0
[0.8.0]: https://github.com/Eldenn/coreloom-ui/releases/tag/v0.8.0
[0.7.0]: https://github.com/Eldenn/coreloom-ui/releases/tag/v0.7.0
[0.6.0]: https://github.com/Eldenn/coreloom-ui/releases/tag/v0.6.0
