---
'@coreloom/ui': patch
---

### Fixed

- `@coreloom/rules`: the global CSS step names the folder the theme really installs into,
  `src/styles/coreloom/` (`./styles/coreloom/…` from `src/index.css`, `../styles/coreloom/…` from
  `src/app/globals.css`). It used to say `./coreloom/…`, which doesn't resolve.
