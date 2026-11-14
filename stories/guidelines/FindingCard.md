# Finding Card

> **Experimental.** This item may still change in a minor release, with an **Upgrading** note in the changelog. See [VERSIONING.md](https://github.com/Eldenn/coreloom-ui/blob/main/VERSIONING.md).

One finding of a review, such as a diagram checked against the code: what it is about, its status and severity, a comment, and the evidence as `file:line` places. People mark it done or ignore it, and reopen it. The card only asks; the app saves the resolution.

**The consumer provides** `title` (what the finding is about, such as an element's name) and `status` (`ok`, `warning`, `error` or `unknown`), and optionally `statusLabel` (a few words on the status, such as "Missing from the code"; default: the status's name), `severity` (`low`, `medium` or `high`), `comment` (plain text; line breaks are kept), `evidence` (`{ path, line?, href? }[]`), `resolution` / `onResolutionChange` or `defaultResolution` (`open`, `done` or `dismissed`; default `open`), `onSelect` (shows "Show in diagram"), `selected` (false: the outline of the finding whose element is selected), `disabled` (false: the buttons are off while the app saves) and `className`.

- Evidence is listed in monospace as `path:line`. With an `href`, the place is a link that opens in a new tab (and says so to screen readers); only `http` and `https` links are followed, anything else shows as text. Long paths wrap.
- Open: Ignore and Mark as done. Done or ignored: the title is struck through, the resolution shows beside the badges, and Reopen takes the buttons' place. Focus moves to the button that took the place of the one pressed, never to the page.
- The new resolution ("Marked as done", "Ignored") is announced through one polite status per card.
- The status is a badge with an icon and words, never colour alone; the severity is its own badge ("Severity: High").
- The card is an `article` named by its title; it renders no heading, so it fits in any page's outline. `selected` adds `aria-current`.
- Pair it with UML Diagram's `annotations`: the same statuses as rings and badges on the elements, and `onAnnotationSelect` to bring a finding into view.
- Not for suggestions to accept or edit (use SuggestionList) or for comments in a discussion (use CommentThread).

**In an app:** `pnpm dlx shadcn@latest add @coreloom/finding-card` and import from `@/components/ui/finding-card`.
