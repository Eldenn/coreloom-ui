// The webview's entry point. syncVsCodeTheme() runs before the first render, so the page opens in
// the editor's colours and follows every theme change after that.
import * as React from 'react'
import { createRoot } from 'react-dom/client'

import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { CoreloomI18nProvider } from '@/lib/i18n'
import { syncVsCodeTheme } from '@/lib/vscode'

import { App } from './app'

syncVsCodeTheme()

const root = document.getElementById('root')
if (root) {
  createRoot(root).render(
    <React.StrictMode>
      {/* <html lang> is VS Code's display language: the components' built-in text follows it. */}
      <CoreloomI18nProvider locale={document.documentElement.lang || 'en'}>
        <TooltipProvider>
          <App />
          <Toaster position="bottom-right" />
        </TooltipProvider>
      </CoreloomI18nProvider>
    </React.StrictMode>,
  )
}
