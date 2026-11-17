---
'@coreloom/ui': patch
---

### Fixed

- `NodeEditor`: a long workflow no longer opens shrunk until its text is a few pixels high. When fitting everything would draw the names under about 11px, the
  canvas opens on the start of the graph (left, top) at a readable zoom; pan for the rest. The Fit
  button, the minimap and zooming out still show everything.
- `UmlDiagram`: a sequence diagram narrower than its box is centered, like the other kinds.
- `Heatmap`, `CalendarHeatmap`: a cell with nothing in it is a faint neutral tint of the surface
  under it instead of a dark well, and the steps are tints of that surface too, so the ramp runs
  from faint to strong on a card and on the page, in dark and in light.
- `AvatarGroup`: avatars overlap by 4px instead of 8px, so two wide initials ("MC") stay whole.
- `Gauge`: the threshold marks are notches across the track, under the value, instead of lines
  sticking out over it. With `unit="%"`, the sign is spaced as the locale writes it: "86%" in
  English, "86 %" in French, Spanish and German.
- `DonutChart`: every share in the legend has one decimal ("32.0%" under "53.6%").
- `InputOTP`: the slots have the same outline as `Input`, so an empty slot reads as a field.
- `Switch`: the thumb of a switch that is off uses a token (`fg-2`) instead of white: 5.5:1
  against the track in dark, 7.2:1 in light, where the white thumb had almost none.
- `NodeEditor`: the "add a node" buttons on a card and on an edge, and the button that removes a
  chip, have a 24px hit area.
- `AgentAvatar`, `AgentGraph`, `DonutChart`, `NodeEditor`, `NavigationMenu`: transitions use the
  duration tokens (`duration-fast`, `duration-base`, `duration-slow`).
