# Roadmap

Where Coreloom UI is heading. This is a plan, not a promise: dates move, and what's here can change
once people use it. To weigh in, comment on an item in
[Discussions](https://github.com/Eldenn/coreloom-ui/discussions), or open a
[component request](https://github.com/Eldenn/coreloom-ui/issues/new?template=component_request.yml).

## Now: 1.0

Release candidates (`1.0.0-rc.x`) are published under `/next/` while the last points are settled:

- The stable API frozen and checked in CI (`api/`, [`VERSIONING.md`](./VERSIONING.md)).
- Install proven in new Vite and Next.js apps, behaviour tested in Chrome, Firefox and Safari's
  engine.
- Adoption docs: Getting started for Vite and Next.js, [Moving to 1.0](./MIGRATING.md), Choose a
  component.
- Remaining fix: the faceted filter's checked options aren't announced as checked by screen
  readers.

## Next: after 1.0

- **Experimental items to stable**, one by one, as their API stops moving: blocks first (app shell,
  auth, settings, data list), then the rich text editor and the node editor.
- **Right-to-left languages.** The components use physical sides (`ml-`, `left-`) in places; moving
  them to logical ones (`ms-`, `start-`) is visible, so it comes as a planned minor with screenshots.
  Until then, RTL isn't supported.
- **Windows high contrast** (`forced-colors`) across every component, not just a few.
- **A compact density** for data-heavy screens.

## Later, maybe

- Performance budgets for the heaviest blocks (render and interaction timings in CI).
- A terminal backed by xterm.js for apps that need a full emulator.
- The feature flags block's rule editor on top of the filter bar.

## Not planned

- A backend, API calls or model calls inside items: async work stays a callback the app provides.
- An npm package: the registry and `shadcn add` are the way to install, so the code stays yours.
