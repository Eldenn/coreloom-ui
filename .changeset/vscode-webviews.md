---
'@coreloom/ui': minor
---

### Added

- `@coreloom/vscode`: Coreloom UI in VS Code extension webviews. `vscode.css` maps the tokens onto the editor's `--vscode-*` variables (dark, light, high contrast, the editor's fonts) and cancels the default styles VS Code injects into webviews. `syncVsCodeTheme()` follows the editor's theme live. `useVsCodeState` keeps UI state while the tab is hidden. `postToExtension` and `useExtensionMessages` exchange typed messages with the extension. Guide: Foundations / VS Code. The new `examples/vscode-webview` is a working extension with a strict Content Security Policy and a browser preview.
- `SidebarProvider` takes `keyboardShortcut={false}` and `CommandMenu` takes `shortcut={false}`, to leave Ctrl/Cmd+B and Ctrl/Cmd+K to the host (VS Code uses both).
