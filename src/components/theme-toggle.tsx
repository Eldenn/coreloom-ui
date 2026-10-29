"use client"

// Coreloom UI — theme switching (block part). Dark is the default; light sets <html data-theme="light">.
// The choice — "light", "dark" or "system" (follow the OS) — is kept in localStorage("theme").
// Add the inline script from the Getting started guide to <head> so it applies before the first paint.
//   ThemeToggle: one icon button, light ↔ dark.
//   ThemeMenu:   a menu with Light, Dark and System.
import * as React from "react"
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useCoreloomI18n } from "@/lib/i18n"

/** The theme on screen. */
type Theme = "dark" | "light"
/** What the user chose. */
type ThemePreference = Theme | "system"

const STORAGE_KEY = "theme"
const LIGHT_QUERY = "(prefers-color-scheme: light)"

function readTheme(): Theme {
  if (typeof document === "undefined") return "dark"
  return document.documentElement.dataset.theme === "light" ? "light" : "dark"
}

function readPreference(): ThemePreference {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === "light" || saved === "dark" || saved === "system") return saved
  } catch {
    /* storage unavailable */
  }
  return readTheme()
}

function systemTheme(): Theme {
  return typeof window !== "undefined" && window.matchMedia?.(LIGHT_QUERY).matches ? "light" : "dark"
}

function apply(theme: Theme) {
  const root = document.documentElement
  if (theme === "light") root.dataset.theme = "light"
  else delete root.dataset.theme
}

/**
 * The theme on screen (`theme`), the user's choice (`preference`) and a setter that applies and
 * persists it. With "system", the theme follows the OS and updates when it changes.
 */
function useTheme() {
  const [theme, setThemeState] = React.useState<Theme>(readTheme)
  const [preference, setPreferenceState] = React.useState<ThemePreference>("dark")

  React.useEffect(() => {
    setPreferenceState(readPreference())
    const observer = new MutationObserver(() => setThemeState(readTheme()))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] })
    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    if (preference !== "system" || !window.matchMedia) return
    const mq = window.matchMedia(LIGHT_QUERY)
    const onChange = () => apply(mq.matches ? "light" : "dark")
    onChange()
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [preference])

  const setTheme = React.useCallback((next: ThemePreference) => {
    setPreferenceState(next)
    apply(next === "system" ? systemTheme() : next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* storage unavailable: the choice lasts for this page */
    }
  }, [])

  return { theme, preference, setTheme, toggleTheme: () => setTheme(theme === "light" ? "dark" : "light") }
}

/** One icon button that flips between light and dark. */
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

/** A menu with Light, Dark and System (follows the OS). */
function ThemeMenu({ className, align = "end" }: { className?: string; align?: "start" | "center" | "end" }) {
  const t = useCoreloomI18n().messages.theme
  const { theme, preference, setTheme } = useTheme()
  const options = [
    { value: "light", label: t.lightOption, icon: SunIcon },
    { value: "dark", label: t.darkOption, icon: MoonIcon },
    { value: "system", label: t.systemOption, icon: MonitorIcon },
  ] as const
  const current = options.find((o) => o.value === preference) ?? options[1]
  const Icon = preference === "system" ? MonitorIcon : theme === "light" ? SunIcon : MoonIcon
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={`${t.menu}: ${current.label}`} className={className}>
              <Icon />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>{t.menu}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align={align} className="min-w-40">
        <DropdownMenuLabel>{t.menu}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={preference} onValueChange={(v) => setTheme(v as ThemePreference)}>
          {options.map((o) => (
            <DropdownMenuRadioItem key={o.value} value={o.value}>
              <o.icon />
              {o.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { ThemeMenu, ThemeToggle, useTheme, type Theme, type ThemePreference }
