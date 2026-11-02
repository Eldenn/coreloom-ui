# Timeline

What happened, in order: a ticket's history, a pull request's events, a deployment's steps, an order's tracking, an audit log.

**The consumer provides** `TimelineItem`s inside a `Timeline` (an ordered list, labelled "Activity" unless you pass `aria-label`). Each item takes a `title`, and optionally an `icon` (a Lucide element or an Avatar; without one the marker is a dot), a `tone` (`neutral`, `primary`, `success`, `warning`, `danger`, `info`), a `time`, a `description` and children shown below (a comment, a diff, buttons).

- A line joins the markers; the last item has none. Keep one order for the whole list, oldest first for a history you read like a story, newest first for a feed you check often.
- The tone only tints the marker: the title must say what happened ("Checks failed"), since colour alone tells nothing to a screen reader or a colour-blind person.
- Put a `RelativeTime` in `time` for recent events, an exact date for older ones or for a record people cite, a duration for the steps of a run.
- For a dashboard card with a title and an empty state, `ActivityFeed` (dashboard block) already wraps this pattern.

_On `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/timeline` and import from `@/components/ui/timeline`._
