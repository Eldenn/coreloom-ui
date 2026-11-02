# VS Code webviews

Coreloom UI runs inside a VS Code extension's webview, which is a Chromium page. React, Radix, Tailwind, React Flow, Recharts and Tiptap all work there. `@coreloom/vscode` makes the components look like part of the editor and covers what a webview does differently.

**Install** `pnpm dlx shadcn@latest add @coreloom/vscode`. It writes `lib/vscode.ts` and `styles/coreloom/vscode.css`. Import `vscode.css` after `theme.css` in the webview's stylesheet. The Coreloom fonts aren't needed: the theme uses the editor's. Then call `syncVsCodeTheme()` once, before the first render. The example extension in `examples/vscode-webview` shows the whole setup.

**The theme.** `vscode.css` maps every token onto the `--vscode-*` variables VS Code sets in the webview. The page is the editor background, menus use the widget background, the primary button is the editor's button, focus rings use `focusBorder`, charts use VS Code's chart colours, text uses the workbench font and code uses the editor font. Corners get VS Code's tighter radii.

- `syncVsCodeTheme()` reads VS Code's body class and writes `<html data-vscode="dark | light | high-contrast | high-contrast-light">`. It adds `data-theme="light"` for the light kinds. It follows theme changes live and does nothing outside VS Code. `useVsCodeTheme()` returns the current kind when a component needs it, for example to pick a chart palette.
- In high contrast, every edge is the theme's contrast border and fills use its active border colour, so checked boxes, progress bars and the primary button stay visible.
- In light themes, warning and error colours are mixed with the text colour, so they keep 4.5:1 as text.
- VS Code adds default styles to every webview: body padding, link, `code` and `kbd` colours, and focus outlines. They're unlayered, so they beat Tailwind's utilities. `vscode.css` sends them back to the components' own styles. The scrollbars keep VS Code's look.
- Don't combine it with `data-accent` or `ThemeToggle`. The editor owns the theme: hide the theme switch in a webview.

**State and messages.**

- VS Code destroys a webview's page when its tab is hidden, unless the extension pays for `retainContextWhenHidden`. `useVsCodeState(key, initial)` works like `useState`, and the value survives hiding. Values must be JSON. `localStorage` isn't reliable in a webview: don't use it for anything that matters.
- `postToExtension(message)` sends `{ type, … }` to `webview.onDidReceiveMessage`. `useExtensionMessages(onMessage, accept?)` receives what the extension posts. Pass a type guard as `accept`, because anything on the page can post to the window. Share one union of message types between both sides, and check messages on the extension side too.
- `getVsCodeApi()` returns the API (VS Code allows one `acquireVsCodeApi()` call per page), or `null` outside VS Code. Every helper is then a no-op, so the same page runs in Storybook or a browser preview.

**Content Security Policy.** Use a strict policy with a nonce, like the example's `src/html.ts`: `default-src 'none'`, scripts only with the page's nonce, styles, fonts and images only from `webview.cspSource`.

- `style-src` needs `'unsafe-inline'`. Sonner (toasts) and Vaul (drawers) add a `<style>` tag at runtime and take no nonce. Radix, React Flow and Recharts only set style attributes from JavaScript, which a policy never blocks.
- Zod 4 tries `new Function` to compile schemas. It falls back on its own, but the console then shows a CSP error. Call `z.config({ jitless: true })` at startup when the webview uses forms or the form renderer.
- No network: the components never fetch. Images from content need `img-src https:`. Leave it out if the view doesn't show any.

**Layout and keyboard.**

- Popovers, menus, dialogs and toasts render inside the webview's frame and never overflow it. In a side bar view (about 300px wide), prefer inline panels, `Popover` and `DropdownMenu` over `Sheet`, `Drawer` and large `Dialog`s. Blocks made for a whole page, such as the marketing, auth, pricing and app shell blocks, don't belong in a webview.
- Ctrl/Cmd+B (Sidebar) and Ctrl/Cmd+K (CommandMenu) are VS Code shortcuts. Turn them off with `<SidebarProvider keyboardShortcut={false}>` and `<CommandMenu shortcut={false}>`. Contribute real keybindings from the extension instead, and post a message to the page when one fires.
- External links open in the browser through VS Code. `window.open` is blocked: ask the extension to call `vscode.env.openExternal`.
- `<html lang>` should carry `vscode.env.language`. Pass it to `CoreloomI18nProvider` and the built-in text follows the editor's language.

**Bundle size.** Bundle only the components the view uses: shadcn copies each one, and esbuild drops the rest. The example's whole webview (about ten components, React included) is about 490 KB minified, while every Coreloom component together is about 3.4 MB. Tiptap, React Flow and Recharts are the heavy ones. Load them with `React.lazy` when they aren't on the first screen. Files load from disk, so size costs parse time, not download time.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/vscode`, then see `examples/vscode-webview/README.md` for the extension side.
