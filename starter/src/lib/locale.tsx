// The app's language: English or French, saved in localStorage. It drives both the Coreloom
// components' built-in strings (CoreloomI18nProvider) and the app's own copy (useT()).
import * as React from "react"
import { enUS, fr as frDates } from "date-fns/locale"

import { CoreloomI18nProvider } from "@/lib/i18n"
import { en, fr, type Messages } from "@/messages"

export type Locale = "en" | "fr"

const dictionaries: Record<Locale, Messages> = { en, fr }
const dateLocales = { en: enUS, fr: frDates }

function initialLocale(): Locale {
  try {
    const saved = localStorage.getItem("locale")
    if (saved === "en" || saved === "fr") return saved
  } catch {}
  return navigator.language.toLowerCase().startsWith("fr") ? "fr" : "en"
}

const LocaleContext = React.createContext<{ locale: Locale; setLocale: (locale: Locale) => void; t: Messages } | null>(null)

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState(initialLocale)
  const setLocale = React.useCallback((next: Locale) => {
    setLocaleState(next)
    document.documentElement.lang = next
    try {
      localStorage.setItem("locale", next)
    } catch {}
  }, [])
  const value = React.useMemo(() => ({ locale, setLocale, t: dictionaries[locale] }), [locale, setLocale])
  return (
    <LocaleContext.Provider value={value}>
      <CoreloomI18nProvider locale={locale} dateLocale={dateLocales[locale]}>
        {children}
      </CoreloomI18nProvider>
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const value = React.useContext(LocaleContext)
  if (!value) throw new Error("useLocale must be used inside <LocaleProvider>.")
  return value
}

/** The app's own strings in the current language. */
export function useT() {
  return useLocale().t
}
