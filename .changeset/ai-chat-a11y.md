---
'@coreloom/ui': patch
---

### Fixed

- `ConversationList`: renaming a conversation with Enter or Escape left focus on the page; it now
  goes back to the conversation. After a delete, focus moves to the next conversation (or the
  previous one, or the list when none is left) instead of being lost with the row.
- `ConversationList`: the row menu (Rename, Delete) was only shown on hover and keyboard focus, so
  it could not be found on a touch screen. It is now always shown there.
- `ConversationList`: a search announces how many conversations match, or that none does, through
  a polite status.
- `ChatMessages`: the typing dots and the error no longer are live regions inside the log, which
  could read them twice or not at all. The log itself says "Waiting for the answer" and reads the
  error once.
- `VoiceAgent`, `PushToTalkButton`: after an error (a blocked microphone) the talk button no longer
  keeps its accent colour; it still works.

### Changed

- `ConversationList`: the day groups (Today, Yesterday…) are lists named by their label instead of
  `h3` headings, so the list no longer changes the heading order of the page it is in.
- `ChatWidget`: the panel and the greeting come in with the theme's `duration-base` instead of a
  fixed 200 ms.
