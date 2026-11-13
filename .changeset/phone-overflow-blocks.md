---
'@coreloom/ui': patch
---

### Fixed

- `PipelineRun`: on a phone the page scrolled sideways once the job strip held more jobs than
  fit. The strip now keeps its hidden status words inside itself.
- `PlanCard`, `UsageMeters`, `PaymentMethod`, `InvoiceTable`, `ChartCard`, `ActivityFeed`: in a
  grid, a wide table or chart stretched every card past the viewport. The cards can now shrink,
  and the invoices table scrolls inside its card.
- `ChartCard`: on a narrow card the `actions` go under the title instead of squeezing it.
- `CodeReview`: narrower than 640 px, the diffs are shown unified and the layout choice is
  hidden; the split layout only showed its "Before" half there. Nothing changes on wide screens.
- `EvalRunReport`: the outputs of two runs are compared in one column when the detail panel is
  narrower than 480 px. A case without output says "No output" instead of showing an empty box,
  and a case with an error and no output shows only the error.
- `Webhooks`: on a phone, a delivery's status sat under its duration and the event name
  disappeared. The details and Redeliver now wrap to a second line.
- `ProductDetail`: on a phone, "Add to cart" keeps its height under the quantity.
- `TeamMembers`: on a narrow card the role and the remove button go under the name, which is no
  longer cut. The "Pending invites" label is a paragraph, not a heading, so it no longer breaks
  the page's heading order.
- `TeamMembers`, `Webhooks`: after a member is removed, an invite revoked or an endpoint deleted,
  focus moves to the list instead of being lost.
- `EnvVars`: on a narrow card the Import and Add buttons go under the title and description. The
  import summary is no longer announced on every keystroke: it describes the field.
