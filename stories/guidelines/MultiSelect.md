# MultiSelect

Several values from a known list: regions, roles, labels. The trigger shows the picks as chips; the list is a searchable checklist.

**The consumer provides** `options` (`[{ value, label, icon?, keywords?, disabled? }]`), `value` + `onValueChange` (`string[]`; or `defaultValue`), an `id` for its `FieldLabel`, and optionally `placeholder`, `maxShown` (chips before "+n", 3), `maxSelected` (the rest of the list disables once reached).

- The trigger matches `Combobox`: chips on `secondary`, "+2" in mono `fg-muted`, the chevron at the right. It grows to a second line rather than truncate.
- In the list, each option has a checkbox (`accent` when picked); Enter or a click toggles it and the list stays open. The footer counts the picks in a polite live region, with **Select all** and **Clear**.
- Up to ~50 options. For free-form values (emails, labels anyone can invent), use `TagsInput`. For one value, `Combobox` or `Select`.
