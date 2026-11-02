# Coreloom UI in a VS Code webview

A small VS Code extension whose panel is a React app built from Coreloom UI components. The panel finds files in the workspace and opens them. It follows the editor's theme (dark, light, high contrast), keeps its fields while the tab is hidden, and talks to the extension through typed messages, under a strict Content Security Policy.

## Run it

From the repository root:

```bash
pnpm install
pnpm --dir examples/vscode-webview build
code examples/vscode-webview   # then F5: "Run the Coreloom UI example"
```

In the window that opens, run **Coreloom: Open the Coreloom UI example** from the command palette.

Without VS Code, `pnpm --dir examples/vscode-webview preview` serves the same page on http://localhost:5199 with the same policy. A small script plays VS Code's part: the theme variables, the default webview styles and demo answers. `?theme=light` and `?theme=high-contrast` switch the theme.

## What's where

| File                     | What                                                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `src/extension.ts`       | The command, the panel (`localResourceRoots` limited to `dist/`) and the message handler.                          |
| `src/html.ts`            | The page and its Content Security Policy: a nonce for scripts, `'unsafe-inline'` styles (Sonner and Vaul need it). |
| `src/messages.ts`        | The messages both sides exchange, with type guards: each side checks what it receives.                             |
| `src/webview/main.tsx`   | `syncVsCodeTheme()` before the first render, then the providers (i18n follows `vscode.env.language`).              |
| `src/webview/app.tsx`    | The UI: `useVsCodeState` for what must survive hiding, `postToExtension` / `useExtensionMessages`.                 |
| `src/webview/styles.css` | Tailwind, the Coreloom tokens and theme, then `vscode.css`. No brand fonts: the editor's are used.                 |
| `build.mjs`              | esbuild for the extension (Node) and the webview (browser), Tailwind for the CSS.                                  |
| `preview/`               | The browser preview (not shipped: see `.vscodeignore`).                                                            |

## In your own extension

This example builds against the repository's `src/`, through the `@/*` path of the root `tsconfig.json`. In your extension, copy the components in with shadcn and point `@/*` at them:

```bash
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add @coreloom/vscode @coreloom/button @coreloom/card @coreloom/input …
```

Then import `styles/coreloom/tokens.css`, `theme.css` and `vscode.css` in the webview's stylesheet, as `src/webview/styles.css` does. Read the guide (Storybook → Guidelines → Foundations → VS Code) for the details: CSP, state, keyboard shortcuts, layout and bundle size.
