# Choose a component

Find the item for what you're building, then read its guide (**Guidelines** in the sidebar) before
you use it. The name is what you install: `pnpm dlx shadcn@latest add @coreloom/<name>`. Items
marked _experimental_ may still change in a minor release (see `VERSIONING.md`).

## Text and choices

| You need people to…                    | Use                          | Rather than                                             |
| -------------------------------------- | ---------------------------- | ------------------------------------------------------- |
| type a line or a paragraph             | `input`, `textarea`          |                                                         |
| type with an icon, unit or button      | `input-group`                | positioning an icon over an `input`                     |
| pick one of 2–5 visible options        | `radio-group`, `choice-card` | `select` (hides the options)                            |
| switch a view in one pill ("Day/Week") | `segmented-control`          | `tabs` (tabs show panels)                               |
| pick one of many                       | `select`, `combobox`         | `native-select` except on phones or in long forms       |
| pick several from a known list         | `multi-select`, `chip-group` | a column of checkboxes past ~7 options                  |
| enter free values as tags              | `tags-input`                 | `multi-select` (that one is for a known list)           |
| pick in a hierarchy                    | `tree-select`                | nested selects                                          |
| turn a setting on now                  | `switch`                     | `checkbox` (that one waits for Save)                    |
| move items between two lists           | `transfer-list`              |                                                         |
| order a few items                      | `sortable-list`              |                                                         |
| mention people with @                  | `mention-textarea`           |                                                         |
| type a structured value                | `masked-input`, `json-input` | a plain `input` with a regex                            |
| give a score                           | `rating`, `scale-input`      |                                                         |
| type a one-time code                   | `input-otp`                  |                                                         |
| choose a colour                        | `color-picker`               |                                                         |
| sign                                   | `signature-pad`              |                                                         |
| build a whole form                     | `form` (TanStack Form + zod) | wiring `field` by hand for more than a couple of fields |
| render a form from JSON                | `form-renderer` _(exp.)_     |                                                         |

## Numbers, dates and time

| You need people to…    | Use                                                  | Rather than                    |
| ---------------------- | ---------------------------------------------------- | ------------------------------ |
| type a number          | `number-input`, `slider-input`, `unit-input`         | `input type="number"`          |
| type an amount         | `money-input`                                        |                                |
| type a phone number    | `phone-input`                                        |                                |
| pick a date or a range | `date-picker`, `date-range-picker`                   | a bare `calendar` in a form    |
| pick a month or a week | `month-picker`, `week-picker`                        |                                |
| pick a time or a zone  | `time-picker`, `timezone-select`                     |                                |
| type a duration        | `duration-input`                                     |                                |
| set a repeat           | `recurrence-input`                                   |                                |
| read a date or number  | `relative-time`, `format` (numbers, currency, bytes) | formatting by hand: use `Intl` |

## Files and media

| You need…                | Use                                                |
| ------------------------ | -------------------------------------------------- |
| files dropped or chosen  | `file-upload`, `file-card`                         |
| one image (avatar, logo) | `image-input`, `image-crop` _(exp.)_               |
| pictures to browse       | `image-gallery`, `carousel`                        |
| video or audio           | `media-player` _(exp.)_, `audio-recorder` _(exp.)_ |

## Feedback and status

| You need to tell people…              | Use                                                   | Rather than                     |
| ------------------------------------- | ----------------------------------------------------- | ------------------------------- |
| something about this part of the page | `alert`                                               | a toast (it disappears)         |
| something about the whole app         | `banner`                                              |                                 |
| an action went through                | `sonner` (`toast`)                                    | an `alert` that stays           |
| to confirm something destructive      | `alert-dialog`, or `popconfirm` for one row           | `dialog` with two buttons       |
| it's loading                          | `skeleton` (layout known), `spinner`, `status-button` | a spinner where a skeleton fits |
| how far along it is                   | `progress`, `stepper`, `quota-bar`, `gauge`           |                                 |
| a status                              | `badge`, `status-indicator`, `ping`                   | colour alone: say it in words   |
| there's nothing yet                   | `empty`                                               |                                 |
| when an autosave happened             | `save-status`                                         |                                 |

## Overlays

| You need…                              | Use                             | Rather than                               |
| -------------------------------------- | ------------------------------- | ----------------------------------------- |
| a task that blocks the page            | `dialog`                        |                                           |
| a side panel (filters, details)        | `sheet`, or `drawer` on phones  |                                           |
| a small form or details by a button    | `popover`                       | `dialog` for two fields                   |
| a hint on a control                    | `tooltip`                       | essential information (touch can't hover) |
| a preview of a link or a person        | `hover-card`                    |                                           |
| actions from a button or a right-click | `dropdown-menu`, `context-menu` |                                           |
| a ⌘K palette                           | `command-menu`                  |                                           |
| a guided tour                          | `tour`                          |                                           |

## Navigation and layout

| You need…                | Use                                                    |
| ------------------------ | ------------------------------------------------------ |
| an app with a sidebar    | `app-shell` block (or `sidebar`)                       |
| a site header and footer | `site-header`, `site-footer`, `navigation-menu`        |
| where the page sits      | `breadcrumb`                                           |
| panels on one page       | `tabs`, `accordion`                                    |
| pages of a long list     | `pagination`, `load-more` _(exp.)_, `virtual-list`     |
| a row of tools           | `toolbar`, `button-group`, `action-bar` (bulk actions) |
| resizable panes          | `resizable`                                            |

## Data

| You need to show…            | Use                                                                        | Rather than                |
| ---------------------------- | -------------------------------------------------------------------------- | -------------------------- |
| rows to sort, filter, select | `data-table` (or `data-list` block with URL state)                         | `table` (static rows only) |
| filters as chips             | `filter-bar` _(exp.)_                                                      |                            |
| labels and values            | `description-list`                                                         | a two-column `table`       |
| a list of rows               | `item`                                                                     |                            |
| a hierarchy                  | `tree-view`                                                                |                            |
| events in order              | `timeline`                                                                 |                            |
| code, JSON, a diff or logs   | `code-viewer`, `json-viewer`, `diff-viewer`, `log-viewer`                  | `pre` with no copy or wrap |
| a trend in a sentence        | `sparkline`                                                                | a full chart               |
| a ranking or a share         | `bar-list`, `donut-chart`, `funnel-chart`                                  | a pie with ten slices      |
| a chart                      | `chart` (area, bar, line, pie) and the `charts` item                       |                            |
| a matrix or flows            | `heatmap`, `treemap-chart`, `sankey-chart`, `scatter-chart`, `radar-chart` |                            |

## Editors

| You need people to edit… | Use                                              |
| ------------------------ | ------------------------------------------------ |
| rich text                | `rich-text-editor` _(exp.)_ (Tiptap)             |
| code                     | `code-editor` (CodeMirror)                       |
| a workflow as a graph    | `node-editor` _(exp.)_, `workflow-builder` block |
| diagrams as text         | `diagram-editor` block _(exp.)_                  |
| a spreadsheet            | `spreadsheet` block                              |
| a value in place         | `editable-text`                                  |
| key/value rows           | `key-value-editor`                               |

## AI

| You're building…               | Use                                                                         |
| ------------------------------ | --------------------------------------------------------------------------- |
| a chat with `useChat`          | `ai-chat` block, or `prompt-input` + `markdown` + `reasoning` + `tool-call` |
| a chat in the corner of a page | `ai-chat-widget` block                                                      |
| a model picker                 | `model-picker`, `model-field` in forms                                      |
| an agent's progress            | `agent-plan`, `tool-call`, `tool-form`, `agent-avatar`                      |
| agent admin, runs and evals    | `ai-agents`, `ai-runs`, `ai-evals`, `ai-agent-replay` blocks                |
| a document a model writes      | `ai-artifact` block                                                         |
| a voice conversation           | `voice-agent` block                                                         |

**Guidelines → AI → With the AI SDK** shows the wiring.

## Whole screens

Blocks are complete screens to adapt. All of them are experimental: they follow the components and
may still move in a minor release.

| Screen                  | Block                                                                                                                                                      |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| sign-in, sign-up, reset | `auth`                                                                                                                                                     |
| settings                | `settings`, `team`, `billing`, `api-keys`, `webhooks`, `security-settings`, `notification-preferences`                                                     |
| dashboard and lists     | `dashboard`, `data-list`, `kanban`, `event-calendar`, `gantt`, `inbox`, `file-manager`                                                                     |
| errors and onboarding   | `error-pages`, `onboarding`                                                                                                                                |
| public site             | `marketing`, `pricing`, `comparison-table`, `testimonials`, `changelog`, `blog`, `newsletter`, `cookie-consent`, `showcase`, `shop`, `status-page`, `docs` |
| developer tools         | `api-try-it`, `code-review`, `sql-explorer`, `env-vars`, `feature-flags`, `pipeline-run`, `terminal-console`, `ide`                                        |
