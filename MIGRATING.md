# Moving to 1.0

What to do in an app that installed Coreloom UI items before 1.0. Each release lists its own steps
under **Upgrading** in the [changelog](./CHANGELOG.md); this page gathers them, from the most common
to the most specific, so you can do it in one pass.

## What 1.0 changes for you

From 1.0 the names, exports and props of stable items, the CSS tokens and the message keys only
change in a major release, after a deprecation. [`VERSIONING.md`](./VERSIONING.md) says exactly what
that covers. Two things stay free to move in a minor release, with an **Upgrading** note when they do:

- **Experimental items**: every block (app shell, auth, settings, dashboard, the AI chat…) and some
  components still settling (rich text editor, node editor, UML diagrams, terminal, form renderer,
  media player…). Their guides say "Experimental", and so does `llms.txt`.
- **Small visual changes**: spacing, a shade within the same token, an animation's curve.

1.0 itself breaks nothing: if you are on 0.11, the steps under [From 0.11](#from-011) are all there
is.

## Before you start

1. Commit your work: installed files are your code, and `--overwrite` replaces them.
2. See what would change before you take it:
   `pnpm dlx shadcn@latest add @coreloom/<item> --diff`.
3. Overwrite the items you haven't edited, re-apply your own edits to the others, then run your type
   check, which catches every renamed prop.

## The steps most apps need

These come up in almost every release. If you skipped several, doing them once at the end is
enough.

- **Theme.** New animations, keyframes, duration utilities, accent presets and `surfaces.css` live
  in the theme: `pnpm dlx shadcn@latest add @coreloom/theme --overwrite`. Your global CSS should
  import, in this order, `fonts.css`, `tokens.css`, `theme.css`, then optionally `accents.css` and
  `surfaces.css`, all from `src/styles/coreloom/` (see **Getting started** in Storybook).
- **Strings.** Most new features read new message keys. Re-install the messages before the items
  that use them: `pnpm dlx shadcn@latest add @coreloom/i18n --overwrite`, plus `@coreloom/i18n-es`
  and `@coreloom/i18n-de` if you use them. If you keep your own messages object for another
  language, start again from `en` in `src/lib/i18n.tsx`: your type check lists the keys you're
  missing.
- **Everything in one command.** `@coreloom/all` no longer includes the components built on large
  libraries. Use `@coreloom/everything`, or add `@coreloom/charts`, `@coreloom/editors` or
  `@coreloom/node-editor` next to `all` for the parts you use (0.11).
- **Links.** Blocks link through `@/lib/link`. Give them your router's link once:
  `<CoreloomLinkProvider component={Link}>` (`next/link` as is; for TanStack Router, the starter's
  `router-link.tsx`) (0.6).
- **Theme before the first paint.** Use the script from **Getting started**, which handles the
  `"system"` choice and the accent (0.5).

## From 0.11

These come with 1.0.

- **Form errors are no longer alerts.** `FieldError` lost its default `role="alert"`: the error is
  read with its control through `aria-describedby`, focus moves to the first invalid field when a
  submit fails, and `form.SubmitButton` says how many fields need attention. If you relied on the
  alert, pass `role="alert"` to `FieldError`, or wire `aria-describedby` and focus yourself. Tests
  that looked errors up with `getByRole('alert')` should read the control's accessible description.
- **Fewer headings inside components.** `FormRenderer`'s title, `ShortcutsDialog`'s group titles and
  `Tour`'s step titles are paragraphs, not `<h2>`/`<h3>`. Target them by the form's or the dialog's
  name, or by text.
- **`onValueChange` everywhere.** `CodeEditor` and `DiagramEditor` take `onValueChange`; their
  `onChange` still works and is deprecated until 2.0. If you render the node editor's field
  controls (`CodeControl`, `ConditionsControl`, `CredentialControl`, `KeyValueControl`) or the
  diagram editor's parts (`TextField`, `Choice`, `MemberList`) yourself, rename `onChange` to
  `onValueChange`.
- **New dependencies between items.** `uml-diagram` installs `uml-diagram-annotations.tsx` and needs
  `badge`; `diagram-workspace` needs `uml-diagram`; `transfer-list` installs `checkbox` and
  `recurrence-input` installs `radio-group`. Re-add those items with `--overwrite`.
- **Eight new message keys** (`carousel.*`, `fileUpload.removed`, `inputs.image.removed`,
  `inputs.editable.kept`, `inputs.emoji.jump`, `ai.prompt.removedFile`) for your own languages.
- **Tests.** The marquee's pause button no longer has `aria-pressed`: find it by name.

## From 0.10

- Re-add the theme (new `agent-*` motions, the logo's keyframes, the duration utilities, the
  `TabsIndicator` rules).
- `@coreloom/all` → `@coreloom/everything` to keep installing everything (see above).
- `DiagramWorkspace`: an `onImport` that adds a view should build on the previous state
  (`setViews((all) => [...all, view])`): several dropped files call it in the same event.
- `setElementFields` with `members` takes `ClassMember` objects (`parseMember(line)` from
  `@/lib/uml-mermaid-class` reads one line as Mermaid writes it).

## From 0.9 and earlier

Mostly new strings and the theme (see above), plus:

- **Rich text editor AI panel (0.10).** A rewrite now opens a review first. To keep Replace as the
  main action, pass `ai={{ onRequest, review: false }}`.
- **Node editor (0.10).** It has new files (`node-editor-fields.tsx`, `node-editor-canvas.tsx`) and
  needs `tabs`, `context-menu` and `@xyflow/react`: re-add it with `--overwrite`. `text` and
  `textarea` fields take expressions (add `expression: false` where that isn't wanted);
  `WorkflowIssue` has a new code, `invalid`. If your app saves workflows, keep `notes` and `groups`;
  if it runs them, ignore notes and groups, skip `disabled` nodes and decide what a `pinned` output
  means.
- **AI blocks (0.10).** `ai-agent-builder` depends on `agent-graph`; `tool-call` and `ai-chat` read
  `@coreloom/ai` and the `ai.plan` and `ai.toolForm` strings: re-install `ai` first.
- **Dashboard and app shell (0.10).** `StatCard` uses `sparkline`, installed with the block.
- **Brand colours (0.10).** Regenerate a `brand.css` made with the theme generator if a dark band of
  your page should use it, and import `surfaces.css` after `accents.css`.
- **Accents (0.8).** The light accent and the `cyan` preset changed: update your own screenshots.
- **Auth and Card (0.7).** Re-add `auth` for its `<h1>` titles and `card` for `CardTitle asChild`.
- **i18n (0.4).** Components read their strings from `CoreloomI18nProvider`; English is used without
  one.

## Staying on a version

To take 1.0 later, pin the namespace to the release you have in `components.json`:

```json
"registries": { "@coreloom": "https://github.com/Eldenn/coreloom-ui/releases/download/v0.11.0/{name}.json" }
```

Questions or something this page misses: open a
[discussion](https://github.com/Eldenn/coreloom-ui/discussions) or an
[issue](https://github.com/Eldenn/coreloom-ui/issues/new/choose).
