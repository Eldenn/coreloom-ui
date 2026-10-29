"use client"

// Coreloom UI — ThemeToggle block part. Dark is the default; light sets <html data-theme="light">.
// The choice is kept in localStorage("theme"). Add the inline script from the Getting started
// guide to <head> so the saved theme applies before the first paint.
import * as React from "react"
import { MoonIcon, SunIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useCoreloomI18n } from "@/lib/i18n"

type Theme = "dark" | "light"

function readTheme(): Theme {
  if (typeof document === "undefined") return "dark"
  return document.documentElement.dataset.theme === "light" ? "light" : "dark"
}

/** Current theme, kept in sync with <html data-theme>, plus a setter that persists it. */
function useTheme() {
  const [theme, setThemeState] = React.useState<Theme>(readTheme)

  React.useEffect(() => {
    const observer = new MutationObserver(() => setThemeState(readTheme()))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] })
    return () => observer.disconnect()
  }, [])

  const setTheme = React.useCallback((next: Theme) => {
    const root = document.documentElement
    if (next === "light") root.dataset.theme = "light"
    else delete root.dataset.theme
    try {
      localStorage.setItem("theme", next)
    } catch {
      /* storage unavailable: the choice lasts for this page */
    }
  }, [])

  return { theme, setTheme, toggleTheme: () => setTheme(theme === "light" ? "dark" : "light") }
}

function ThemeToggle({ className }: { className?: string }) {
  const t = useCoreloomI18n().messages
  const { theme, toggleTheme } = useTheme()
  const label = theme === "light" ? t.theme.toDark : t.theme.toLight
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={label} className={className}>
          {theme === "light" ? <MoonIcon /> : <SunIcon />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{theme === "light" ? t.theme.dark : t.theme.light}</TooltipContent>
    </Tooltip>
  )
}

export { ThemeToggle, useTheme, type Theme }
