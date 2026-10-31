# Icon

Lucide icons under the Coreloom names, inheriting `currentColor`.

**The consumer provides** a `name` (`search`, `terminal`, `copy`, `check`, `x`, `sun`, `moon`, `chevronRight`, `chevronDown`, `zap`, `blocks`, `package`, `palette`, `arrowRight`, `command`, `menu`, `externalLink`, `star`, `github`, `sliders`, `bookOpen`, `layoutGrid`, `type`, `bell`, `info`, `alertTriangle`, `alertCircle`, `checkCircle`) and optionally `size` (18) and `strokeWidth` (2).

- In app code, importing from `lucide-react` directly is just as good — shadcn components already do. `Icon` keeps the names the docs and previews use.
- 16px inline with text, 18–20px in buttons and nav, 24px standalone. Only the one active or primary icon takes `accent`.
- `github` is drawn locally: Lucide no longer ships brand icons. No emoji, no unicode glyphs as icons.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/icon` and import from `@/components/ui/icon`._
