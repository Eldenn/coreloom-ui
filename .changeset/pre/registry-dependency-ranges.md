---
'@coreloom/ui': patch
---

### Fixed

- Every npm dependency an item installs now names its major (`radix-ui@^1`, `lucide-react@^1`,
  `class-variance-authority@^0.7`…). `shadcn add` used to install the latest version of 14 of
  them, so a dependency's next major could have reached an app without a major release here.
