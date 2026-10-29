"use client"

// Coreloom UI — i18n. Every string the components and blocks show or announce (button labels,
// placeholders, screen-reader text, validation messages) comes from here.
//
//   <CoreloomI18nProvider locale="fr" dateLocale={fr}>…</CoreloomI18nProvider>
//
// English and French ship built in; any other language is a `messages` object (start from `en`).
// `messages` also overrides single strings: { auth: { login: { title: "Connexion" } } }.
// Without a provider everything is English. Props on a component (a `title`, a `placeholder`)
// still win over the messages.
import * as React from "react"

type Text = React.ReactNode

const en = {
  common: {
    close: "Close",
    cancel: "Cancel",
    loading: "Loading",
    noResults: "No results.",
    menu: "Menu",
    openMenu: "Open menu",
  },
  breadcrumb: { label: "Breadcrumb", more: "More" },
  pagination: {
    label: "Pagination",
    previous: "Previous",
    next: "Next",
    previousPage: "Go to previous page",
    nextPage: "Go to next page",
    morePages: "More pages",
  },
  carousel: { previous: "Previous slide", next: "Next slide" },
  calendar: {
    /** date-fns pattern for the day buttons' accessible names. */
    dayLabel: "EEEE d MMMM yyyy",
    today: "Today",
    selected: "selected",
  },
  datePicker: { placeholder: "Pick a date" },
  dateRange: {
    placeholder: "Pick a date range",
    presets: "Presets",
    today: "Today",
    yesterday: "Yesterday",
    last7: "Last 7 days",
    last30: "Last 30 days",
    thisMonth: "This month",
    lastMonth: "Last month",
  },
  tags: {
    placeholder: "Add a tag…",
    remove: (tag: string) => `Remove ${tag}`,
    added: (tag: string) => `${tag} added`,
    removed: (tag: string) => `${tag} removed`,
  },
  fileUpload: {
    drop: "Drop files here or",
    browse: "browse",
    dropOne: "Drop a file here or",
    remove: (name: string) => `Remove ${name}`,
    tooLarge: (name: string, max: string) => `${name} is larger than ${max}.`,
    wrongType: (name: string) => `${name} isn’t an accepted file type.`,
    tooMany: (max: number) => `You can add up to ${max} files.`,
    uploading: (percent: string) => `Uploading, ${percent}`,
  },
  stepper: {
    label: "Progress",
    step: (n: number, total: number) => `Step ${n} of ${total}`,
    completed: "completed",
    current: "current step",
  },
  combobox: { placeholder: "Select…", search: "Search…", empty: "No results." },
  command: { title: "Command palette", description: "Search for a command to run." },
  dataTable: {
    filter: "Filter…",
    empty: "No results.",
    rows: (count: string, n: number) => `${count} ${n === 1 ? "row" : "rows"}`,
    selected: (selected: string, total: string, n: number) => `${selected} of ${total} selected`,
    rowsPerPage: "Rows per page",
    previousPage: "Previous page",
    nextPage: "Next page",
    sortBy: (column: string) => `Sort by ${column}`,
    pageOf: (page: string, total: string) => `Page ${page} of ${total}`,
  },
  sidebar: { toggle: "Toggle sidebar", title: "Sidebar", description: "Displays the mobile sidebar." },
  slider: { minimum: "minimum", maximum: "maximum" },
  form: { errorTitle: "Couldn’t save" },
  theme: {
    toLight: "Switch to light theme",
    toDark: "Switch to dark theme",
    light: "Light theme",
    dark: "Dark theme",
    menu: "Theme",
    lightOption: "Light",
    darkOption: "Dark",
    systemOption: "System",
  },
  copy: { copy: "Copy", copied: "Copied to clipboard", failed: "Couldn’t copy — select the text instead." },
  commandMenu: { trigger: "Search…", placeholder: "Type a command or search…", empty: "No results found." },
  appShell: { search: "Search or jump to…", workspaces: "Workspaces", newWorkspace: "New workspace", logOut: "Log out" },
  docs: { nav: "Documentation", menu: "Menu", onThisPage: "On this page", preview: "Preview", code: "Code" },
  marketing: { faq: "Questions" },
  auth: {
    or: "or",
    emailPlaceholder: "you@company.dev",
    emailRequired: "Enter your email address.",
    emailInvalid: "Enter a valid email address, like you@company.dev.",
    login: {
      title: "Sign in",
      description: "Welcome back. Enter your email to continue.",
      email: "Email",
      password: "Password",
      passwordRequired: "Enter your password.",
      forgotPassword: "Forgot password?",
      submit: "Sign in",
      submitting: "Signing in",
      noAccount: "No account yet?",
      signUp: "Create one",
    },
    signup: {
      title: "Create your account",
      description: "Start a workspace in under a minute.",
      name: "Name",
      nameRequired: "Enter your name.",
      email: "Work email",
      password: "Password",
      passwordHint: (min: number) => `At least ${min} characters.`,
      passwordTooShort: (min: number) => `Use at least ${min} characters.`,
      submit: "Create account",
      submitting: "Creating account",
      haveAccount: "Already have an account?",
      signIn: "Sign in",
    },
    verify: {
      title: "Check your inbox",
      sentTo: (destination: Text): Text => (
        <>
          We sent a 6-digit code to <span className="text-foreground">{destination}</span>.
        </>
      ),
      sent: "Enter the 6-digit code we sent you.",
      code: "Verification code",
      codeRequired: "Enter the 6 digits of the code.",
      submit: "Verify",
      submitting: "Verifying",
      notReceived: "Didn’t get it?",
      resendIn: (seconds: number) => `Resend in ${seconds}s`,
      resend: "Resend code",
    },
  },
  dashboard: { activity: "Recent activity", noActivity: "No activity yet." },
  dataList: {
    search: "Search…",
    clear: "Clear filters",
    filterBy: (name: string) => `Filter by ${name}`,
    selected: (n: number) => `${n} selected`,
    results: (count: string, n: number) => `${count} ${n === 1 ? "result" : "results"}`,
    empty: "Nothing matches these filters.",
    emptyHint: "Try fewer filters or another search.",
    sort: "Sort",
  },
  pricing: {
    billing: "Billing period",
    monthly: "Monthly",
    yearly: "Yearly",
    perMonth: "/ month",
    billedYearly: (amount: string) => `${amount} billed yearly`,
    save: (percent: string) => `Save ${percent}`,
    popular: "Most popular",
    custom: "Custom",
  },
  onboarding: { back: "Back", next: "Continue", finish: "Finish", skip: "Skip for now" },
  errors: {
    notFoundTitle: "Page not found",
    notFoundText: "The page you’re looking for doesn’t exist or has moved.",
    serverTitle: "Something went wrong",
    serverText: "An unexpected error stopped this page. Try again in a moment.",
    maintenanceTitle: "We’ll be right back",
    maintenanceText: "We’re doing some planned maintenance.",
    backBy: (time: string) => `Back by ${time}.`,
    home: "Go home",
    retry: "Try again",
    back: "Go back",
    status: "Status page",
    reference: (id: string) => `Reference: ${id}`,
  },
  settings: {
    title: "Settings",
    save: "Save changes",
    dangerZone: "Danger zone",
    typeToConfirm: (name: Text): Text => (
      <>
        Type <span className="font-mono text-foreground">{name}</span> to confirm
      </>
    ),
    cannotUndo: "This can’t be undone.",
  },
}

type Messages = typeof en
type DeepPartial<T> = { [K in keyof T]?: T[K] extends (...args: never[]) => unknown ? T[K] : T[K] extends object ? DeepPartial<T[K]> : T[K] }

const fr: Messages = {
  common: {
    close: "Fermer",
    cancel: "Annuler",
    loading: "Chargement",
    noResults: "Aucun résultat.",
    menu: "Menu",
    openMenu: "Ouvrir le menu",
  },
  breadcrumb: { label: "Fil d’Ariane", more: "Plus" },
  pagination: {
    label: "Pagination",
    previous: "Précédent",
    next: "Suivant",
    previousPage: "Page précédente",
    nextPage: "Page suivante",
    morePages: "Autres pages",
  },
  carousel: { previous: "Diapositive précédente", next: "Diapositive suivante" },
  calendar: { dayLabel: "EEEE d MMMM yyyy", today: "Aujourd’hui", selected: "sélectionné" },
  datePicker: { placeholder: "Choisir une date" },
  dateRange: {
    placeholder: "Choisir une période",
    presets: "Raccourcis",
    today: "Aujourd’hui",
    yesterday: "Hier",
    last7: "7 derniers jours",
    last30: "30 derniers jours",
    thisMonth: "Ce mois-ci",
    lastMonth: "Le mois dernier",
  },
  tags: {
    placeholder: "Ajouter une étiquette…",
    remove: (tag) => `Retirer ${tag}`,
    added: (tag) => `${tag} ajouté`,
    removed: (tag) => `${tag} retiré`,
  },
  fileUpload: {
    drop: "Déposez vos fichiers ici ou",
    browse: "parcourez",
    dropOne: "Déposez un fichier ici ou",
    remove: (name) => `Retirer ${name}`,
    tooLarge: (name, max) => `${name} dépasse ${max}.`,
    wrongType: (name) => `${name} n’est pas un type de fichier accepté.`,
    tooMany: (max) => `Vous pouvez ajouter ${max} fichiers au maximum.`,
    uploading: (percent) => `Envoi en cours, ${percent}`,
  },
  stepper: {
    label: "Progression",
    step: (n, total) => `Étape ${n} sur ${total}`,
    completed: "terminée",
    current: "étape en cours",
  },
  combobox: { placeholder: "Sélectionner…", search: "Rechercher…", empty: "Aucun résultat." },
  command: { title: "Palette de commandes", description: "Rechercher une commande à lancer." },
  dataTable: {
    filter: "Filtrer…",
    empty: "Aucun résultat.",
    rows: (count, n) => `${count} ${n > 1 ? "lignes" : "ligne"}`,
    selected: (selected, total, n) => `${selected} sur ${total} sélectionnée${n > 1 ? "s" : ""}`,
    rowsPerPage: "Lignes par page",
    previousPage: "Page précédente",
    nextPage: "Page suivante",
    sortBy: (column) => `Trier par ${column}`,
    pageOf: (page, total) => `Page ${page} sur ${total}`,
  },
  sidebar: { toggle: "Afficher ou masquer la barre latérale", title: "Barre latérale", description: "Affiche la barre latérale sur mobile." },
  slider: { minimum: "minimum", maximum: "maximum" },
  form: { errorTitle: "Enregistrement impossible" },
  theme: {
    toLight: "Passer au thème clair",
    toDark: "Passer au thème sombre",
    light: "Thème clair",
    dark: "Thème sombre",
    menu: "Thème",
    lightOption: "Clair",
    darkOption: "Sombre",
    systemOption: "Système",
  },
  copy: { copy: "Copier", copied: "Copié dans le presse-papiers", failed: "Copie impossible : sélectionnez le texte." },
  commandMenu: { trigger: "Rechercher…", placeholder: "Tapez une commande ou recherchez…", empty: "Aucun résultat." },
  appShell: { search: "Rechercher ou aller à…", workspaces: "Espaces de travail", newWorkspace: "Nouvel espace de travail", logOut: "Se déconnecter" },
  docs: { nav: "Documentation", menu: "Menu", onThisPage: "Sur cette page", preview: "Aperçu", code: "Code" },
  marketing: { faq: "Questions fréquentes" },
  auth: {
    or: "ou",
    emailPlaceholder: "vous@entreprise.fr",
    emailRequired: "Saisissez votre adresse e-mail.",
    emailInvalid: "Saisissez une adresse e-mail valide, comme vous@entreprise.fr.",
    login: {
      title: "Connexion",
      description: "Bon retour parmi nous. Saisissez votre e-mail pour continuer.",
      email: "E-mail",
      password: "Mot de passe",
      passwordRequired: "Saisissez votre mot de passe.",
      forgotPassword: "Mot de passe oublié ?",
      submit: "Se connecter",
      submitting: "Connexion",
      noAccount: "Pas encore de compte ?",
      signUp: "Créer un compte",
    },
    signup: {
      title: "Créer votre compte",
      description: "Votre espace de travail en moins d’une minute.",
      name: "Nom",
      nameRequired: "Saisissez votre nom.",
      email: "E-mail professionnel",
      password: "Mot de passe",
      passwordHint: (min) => `Au moins ${min} caractères.`,
      passwordTooShort: (min) => `Utilisez au moins ${min} caractères.`,
      submit: "Créer le compte",
      submitting: "Création du compte",
      haveAccount: "Vous avez déjà un compte ?",
      signIn: "Se connecter",
    },
    verify: {
      title: "Consultez votre boîte de réception",
      sentTo: (destination) => (
        <>
          Nous avons envoyé un code à 6 chiffres à <span className="text-foreground">{destination}</span>.
        </>
      ),
      sent: "Saisissez le code à 6 chiffres que nous vous avons envoyé.",
      code: "Code de vérification",
      codeRequired: "Saisissez les 6 chiffres du code.",
      submit: "Vérifier",
      submitting: "Vérification",
      notReceived: "Rien reçu ?",
      resendIn: (seconds) => `Renvoyer dans ${seconds} s`,
      resend: "Renvoyer le code",
    },
  },
  dashboard: { activity: "Activité récente", noActivity: "Aucune activité pour l’instant." },
  dataList: {
    search: "Rechercher…",
    clear: "Effacer les filtres",
    filterBy: (name) => `Filtrer par ${name}`,
    selected: (n) => `${n} sélectionné${n > 1 ? "s" : ""}`,
    results: (count, n) => `${count} résultat${n > 1 ? "s" : ""}`,
    empty: "Aucun résultat pour ces filtres.",
    emptyHint: "Essayez avec moins de filtres ou une autre recherche.",
    sort: "Trier",
  },
  pricing: {
    billing: "Période de facturation",
    monthly: "Mensuel",
    yearly: "Annuel",
    perMonth: "/ mois",
    billedYearly: (amount) => `${amount} facturés par an`,
    save: (percent) => `${percent} d’économie`,
    popular: "Le plus choisi",
    custom: "Sur mesure",
  },
  onboarding: { back: "Retour", next: "Continuer", finish: "Terminer", skip: "Passer cette étape" },
  errors: {
    notFoundTitle: "Page introuvable",
    notFoundText: "La page que vous cherchez n’existe pas ou a été déplacée.",
    serverTitle: "Une erreur est survenue",
    serverText: "Une erreur inattendue a interrompu cette page. Réessayez dans un instant.",
    maintenanceTitle: "Nous revenons très vite",
    maintenanceText: "Une maintenance planifiée est en cours.",
    backBy: (time) => `Retour prévu à ${time}.`,
    home: "Retour à l’accueil",
    retry: "Réessayer",
    back: "Page précédente",
    status: "Page de statut",
    reference: (id) => `Référence : ${id}`,
  },
  settings: {
    title: "Paramètres",
    save: "Enregistrer",
    dangerZone: "Zone de danger",
    typeToConfirm: (name) => (
      <>
        Saisissez <span className="font-mono text-foreground">{name}</span> pour confirmer
      </>
    ),
    cannotUndo: "Cette action est irréversible.",
  },
}

const builtIn: Record<string, Messages> = { en, fr }

function merge<T>(base: T, over: DeepPartial<T> | undefined): T {
  if (!over) return base
  const out = { ...base } as Record<string, unknown>
  for (const [k, v] of Object.entries(over)) {
    const b = (base as Record<string, unknown>)[k]
    out[k] = v && typeof v === "object" && !React.isValidElement(v) && b && typeof b === "object" ? merge(b, v as DeepPartial<typeof b>) : v
  }
  return out as T
}

/** A date-fns locale (`import { fr } from "date-fns/locale"`), passed to Calendar and DatePicker. */
type DateLocale = { code?: string } & object

type CoreloomI18n = {
  locale: string
  messages: Messages
  dateLocale?: DateLocale
  /** Formats a number for the locale (row counts, pages). */
  formatNumber: (n: number) => string
}

const fallback: CoreloomI18n = { locale: "en", messages: en, formatNumber: (n) => new Intl.NumberFormat("en").format(n) }
const I18nContext = React.createContext<CoreloomI18n>(fallback)

function CoreloomI18nProvider({
  locale = "en",
  messages,
  dateLocale,
  children,
}: {
  /** BCP 47 tag: "fr", "fr-CA", "en-GB"… Picks the built-in messages by language (en or fr). */
  locale?: string
  /** A full dictionary for another language, or overrides for single strings. */
  messages?: DeepPartial<Messages>
  dateLocale?: DateLocale
  children: React.ReactNode
}) {
  const value = React.useMemo<CoreloomI18n>(() => {
    const base = builtIn[locale.toLowerCase().split("-")[0]] ?? en
    const nf = new Intl.NumberFormat(locale)
    return { locale, messages: merge(base, messages), dateLocale, formatNumber: (n) => nf.format(n) }
  }, [locale, messages, dateLocale])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

/** The current messages, locale and date-fns locale. English when there's no provider. */
function useCoreloomI18n() {
  return React.useContext(I18nContext)
}

export { CoreloomI18nProvider, useCoreloomI18n, en, fr, type Messages, type DeepPartial, type DateLocale }
