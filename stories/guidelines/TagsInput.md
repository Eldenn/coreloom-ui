# TagsInput

A field that turns what you type into removable tags: labels, topics, email invites.

**The consumer provides** `value` + `onValueChange` (`string[]`; or `defaultValue`), an `id` for its `FieldLabel`, and optionally `placeholder`, `maxTags`, `allowDuplicates` (off: duplicates are ignored, case-insensitive) and `transform` (cleans each tag; default trim — e.g. lowercase slugs).

- Tags are 28px chips on `secondary` with a 24px remove button (`aria-label` "Remove react"); the field matches `Input` and takes `--ring-focus` on focus-within, `danger` with `aria-invalid`.
- Enter or a comma adds the typed text; pasting "a, b, c" adds three; leaving the field adds what's typed; Backspace on the empty input removes the last tag. Additions and removals are announced in a polite live region.
- Validate the list in the form (`z.array(z.email())`), not tag by tag. For picking from a known list, use `Combobox`.
