---
'@coreloom/ui': minor
---

### Added

- **Share dialog** block (`@coreloom/share-dialog`): choose who can open a document.
  - Three radio cards: Private (only you), Public (anyone with the link), Protected (the link and a code).
  - A choice applies through `onVisibilityChange` (a promise). Its card spins until it settles, and the old choice comes back if it rejects.
  - The link is read-only with Copy. The code is in SecretValue. "Regenerate the link" and "Generate a new code" ask first, in a Popconfirm that says what stops working.
  - "Copy link and code" copies a short message ready to send.
- **Access code gate** block (`@coreloom/access-code-gate`): the screen in front of a protected link, for AuthLayout.
  - One box per character (`length`, 8 by default). Letters are upper-cased and characters outside `alphabet` are ignored; by default the alphabet leaves out 0, O, 1, I and L.
  - A pasted code fills every box, and the code is sent as soon as the last box is filled.
  - After a wrong code the boxes empty and focus goes to the first one. `attemptsLeft` shows under the boxes; `lockedUntil` turns them off and shows a countdown.
