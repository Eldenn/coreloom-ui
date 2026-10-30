"use client"

// Coreloom UI — i18n. Every string the components and blocks show or announce (button labels,
// placeholders, screen-reader text, validation messages) comes from here.
//
//   <CoreloomI18nProvider locale="fr" dateLocale={fr}>…</CoreloomI18nProvider>
//
// English and French ship built in; Spanish and German are in i18n-es.tsx and i18n-de.tsx (pass them as
// `messages`); any other language is a `messages` object too (start from `en`).
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
  datePicker: {
    placeholder: "Pick a date",
    openCalendar: "Choose from a calendar",
    /** Shown under a typed date that can't be read; `format` is the expected shape ("mm/dd/yyyy"). */
    invalid: (format: string) => `Enter a date as ${format}.`,
    formatTokens: { day: "dd", month: "mm", year: "yyyy" },
  },
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
  multiSelect: {
    placeholder: "Select…",
    search: "Search…",
    empty: "No results.",
    selectAll: "Select all",
    clear: "Clear",
    more: (count: string) => `+${count}`,
    selected: (count: string, _n: number) => `${count} selected`,
    max: (count: string) => `Up to ${count}.`,
  },
  money: { amount: "Amount" },
  phone: {
    country: "Country",
    searchCountry: "Search a country…",
    number: "Phone number",
  },
  command: { title: "Command palette", description: "Search for a command to run." },
  dataTable: {
    filter: "Filter…",
    empty: "No results.",
    rows: (count: string, n: number) => `${count} ${n === 1 ? "row" : "rows"}`,
    selected: (selected: string, total: string, _n: number) => `${selected} of ${total} selected`,
    rowsPerPage: "Rows per page",
    previousPage: "Previous page",
    nextPage: "Next page",
    sortBy: (column: string) => `Sort by ${column}`,
    pageOf: (page: string, total: string) => `Page ${page} of ${total}`,
    loading: "Loading…",
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
    accent: "Accent colour",
    accents: { cyan: "Cyan", blue: "Blue", violet: "Violet", amber: "Amber", rose: "Rose" },
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
    forgot: {
      title: "Reset your password",
      description: "Enter your account’s email and we’ll send you a link to choose a new password.",
      email: "Email",
      submit: "Send reset link",
      submitting: "Sending",
      sentTitle: "Check your inbox",
      sentTo: (email: Text): Text => (
        <>
          If an account uses <span className="text-foreground">{email}</span>, a link to reset its password is on its way.
        </>
      ),
      otherEmail: "Use another email",
      backToSignIn: "Back to sign in",
    },
    reset: {
      title: "Choose a new password",
      description: "You’ll use it to sign in from now on.",
      password: "New password",
      confirm: "Confirm the password",
      mismatch: "The two passwords don’t match.",
      submit: "Save password",
      submitting: "Saving",
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
  notifications: {
    trigger: "Notifications",
    triggerUnread: (count: string, _n: number) => `Notifications, ${count} unread`,
    title: "Notifications",
    all: "All",
    unread: "Unread",
    markAllRead: "Mark all as read",
    markRead: "Mark as read",
    empty: "You're all caught up.",
    emptyUnread: "No unread notifications.",
    viewAll: "View all",
  },
  team: {
    title: "Members",
    description: "People with access to this workspace.",
    invite: "Invite",
    inviteTitle: "Invite people",
    inviteDescription: "They get an email with a link to join.",
    emails: "Email addresses",
    emailsHint: "Separate addresses with a comma or Enter.",
    emailsRequired: "Add at least one email address.",
    emailsInvalid: (list: string) => `Not an email address: ${list}.`,
    role: "Role",
    send: "Send invites",
    sending: "Sending…",
    you: "You",
    member: "Member",
    remove: (name: string) => `Remove ${name}`,
    removeTitle: (name: string) => `Remove ${name}?`,
    removeDescription: "They lose access right away. You can invite them again later.",
    removeConfirm: "Remove",
    roleOf: (name: string) => `Role of ${name}`,
    pending: "Pending invites",
    invitedOn: (date: string) => `Invited ${date}`,
    revoke: (email: string) => `Revoke the invite to ${email}`,
    revokeShort: "Revoke",
  },
  billing: {
    plan: "Plan",
    renews: (date: string) => `Renews on ${date}`,
    ends: (date: string) => `Ends on ${date}`,
    perMonth: "/ month",
    perYear: "/ year",
    changePlan: "Change plan",
    cancel: "Cancel subscription",
    usage: "Usage",
    usageHint: "Resets at the start of each billing period.",
    usageOf: (used: string, limit: string) => `${used} of ${limit}`,
    nearLimit: "Close to the limit",
    overLimit: "Over the limit",
    paymentMethod: "Payment method",
    expires: (date: string) => `Expires ${date}`,
    cardEnding: (brand: string, last4: string) => `${brand} ending in ${last4}`,
    update: "Update",
    invoices: "Invoices",
    invoice: "Invoice",
    date: "Date",
    amount: "Amount",
    status: "Status",
    download: (id: string) => `Download invoice ${id}`,
    paid: "Paid",
    due: "Due",
    failed: "Failed",
    noInvoices: "No invoices yet.",
  },
  kanban: {
    moveTo: "Move to",
    actions: (title: string) => `Actions for ${title}`,
    dragHandle: (title: string) => `Move ${title}`,
    limit: (count: string, limit: string) => `${count} of ${limit}`,
    empty: "Drop cards here",
    instructions: "To pick up a card, press Space or Enter. Use the arrow keys to move it, Space or Enter to drop it, Escape to cancel.",
    picked: (title: string, column: string) => `Picked up ${title} in ${column}.`,
    over: (title: string, column: string, position: number) => `${title} is over ${column}, position ${position}.`,
    dropped: (title: string, column: string, position: number) => `${title} dropped in ${column}, position ${position}.`,
    cancelled: (title: string) => `Moving ${title} cancelled.`,
    moved: (title: string, column: string) => `${title} moved to ${column}.`,
  },
  eventCalendar: {
    today: "Today",
    previous: "Previous month",
    next: "Next month",
    more: (count: string) => `${count} more`,
    events: (count: string, n: number) => `${count} ${n === 1 ? "event" : "events"}`,
    noEvents: "No events",
    allDay: "All day",
  },
  editor: {
    toolbar: "Formatting",
    bold: "Bold",
    italic: "Italic",
    underline: "Underline",
    strike: "Strikethrough",
    code: "Code",
    heading2: "Heading",
    heading3: "Subheading",
    bulletList: "Bulleted list",
    orderedList: "Numbered list",
    quote: "Quote",
    codeBlock: "Code block",
    link: "Link",
    linkUrl: "Link address",
    linkApply: "Apply",
    linkRemove: "Remove link",
    undo: "Undo",
    redo: "Redo",
    placeholder: "Write something…",
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
  datePicker: {
    placeholder: "Choisir une date",
    openCalendar: "Choisir dans un calendrier",
    invalid: (format) => `Saisissez une date au format ${format}.`,
    formatTokens: { day: "jj", month: "mm", year: "aaaa" },
  },
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
  multiSelect: {
    placeholder: "Sélectionner…",
    search: "Rechercher…",
    empty: "Aucun résultat.",
    selectAll: "Tout sélectionner",
    clear: "Effacer",
    more: (count) => `+${count}`,
    selected: (count, n) => `${count} sélectionné${n > 1 ? "s" : ""}`,
    max: (count) => `${count} au maximum.`,
  },
  money: { amount: "Montant" },
  phone: {
    country: "Pays",
    searchCountry: "Rechercher un pays…",
    number: "Numéro de téléphone",
  },
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
    loading: "Chargement…",
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
    accent: "Couleur d’accent",
    accents: { cyan: "Cyan", blue: "Bleu", violet: "Violet", amber: "Ambre", rose: "Rose" },
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
    forgot: {
      title: "Réinitialiser le mot de passe",
      description: "Saisissez l’e-mail de votre compte : nous vous enverrons un lien pour choisir un nouveau mot de passe.",
      email: "E-mail",
      submit: "Envoyer le lien",
      submitting: "Envoi",
      sentTitle: "Consultez votre boîte de réception",
      sentTo: (email) => (
        <>
          Si un compte utilise <span className="text-foreground">{email}</span>, un lien pour réinitialiser son mot de passe est en route.
        </>
      ),
      otherEmail: "Utiliser une autre adresse",
      backToSignIn: "Retour à la connexion",
    },
    reset: {
      title: "Choisir un nouveau mot de passe",
      description: "Vous l’utiliserez désormais pour vous connecter.",
      password: "Nouveau mot de passe",
      confirm: "Confirmez le mot de passe",
      mismatch: "Les deux mots de passe ne correspondent pas.",
      submit: "Enregistrer",
      submitting: "Enregistrement",
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
  notifications: {
    trigger: "Notifications",
    triggerUnread: (count, n) => `Notifications, ${count} non lue${n > 1 ? "s" : ""}`,
    title: "Notifications",
    all: "Toutes",
    unread: "Non lues",
    markAllRead: "Tout marquer comme lu",
    markRead: "Marquer comme lue",
    empty: "Vous êtes à jour.",
    emptyUnread: "Aucune notification non lue.",
    viewAll: "Tout voir",
  },
  team: {
    title: "Membres",
    description: "Les personnes qui ont accès à cet espace.",
    invite: "Inviter",
    inviteTitle: "Inviter des personnes",
    inviteDescription: "Elles reçoivent un e-mail avec un lien pour rejoindre l’espace.",
    emails: "Adresses e-mail",
    emailsHint: "Séparez les adresses par une virgule ou Entrée.",
    emailsRequired: "Ajoutez au moins une adresse e-mail.",
    emailsInvalid: (list) => `Adresse e-mail invalide : ${list}.`,
    role: "Rôle",
    send: "Envoyer les invitations",
    sending: "Envoi…",
    you: "Vous",
    member: "Membre",
    remove: (name) => `Retirer ${name}`,
    removeTitle: (name) => `Retirer ${name} ?`,
    removeDescription: "Son accès est coupé immédiatement. Vous pourrez l’inviter à nouveau.",
    removeConfirm: "Retirer",
    roleOf: (name) => `Rôle de ${name}`,
    pending: "Invitations en attente",
    invitedOn: (date) => `Invité le ${date}`,
    revoke: (email) => `Annuler l’invitation de ${email}`,
    revokeShort: "Annuler",
  },
  billing: {
    plan: "Offre",
    renews: (date) => `Renouvellement le ${date}`,
    ends: (date) => `Se termine le ${date}`,
    perMonth: "/ mois",
    perYear: "/ an",
    changePlan: "Changer d’offre",
    cancel: "Résilier l’abonnement",
    usage: "Consommation",
    usageHint: "Remise à zéro au début de chaque période de facturation.",
    usageOf: (used, limit) => `${used} sur ${limit}`,
    nearLimit: "Proche de la limite",
    overLimit: "Limite dépassée",
    paymentMethod: "Moyen de paiement",
    expires: (date) => `Expire en ${date}`,
    cardEnding: (brand, last4) => `${brand} se terminant par ${last4}`,
    update: "Modifier",
    invoices: "Factures",
    invoice: "Facture",
    date: "Date",
    amount: "Montant",
    status: "Statut",
    download: (id) => `Télécharger la facture ${id}`,
    paid: "Payée",
    due: "À payer",
    failed: "Échec",
    noInvoices: "Aucune facture pour l’instant.",
  },
  kanban: {
    moveTo: "Déplacer vers",
    actions: (title) => `Actions pour ${title}`,
    dragHandle: (title) => `Déplacer ${title}`,
    limit: (count, limit) => `${count} sur ${limit}`,
    empty: "Déposez des cartes ici",
    instructions: "Pour prendre une carte, appuyez sur Espace ou Entrée. Déplacez-la avec les flèches, déposez-la avec Espace ou Entrée, annulez avec Échap.",
    picked: (title, column) => `${title} prise dans ${column}.`,
    over: (title, column, position) => `${title} au-dessus de ${column}, position ${position}.`,
    dropped: (title, column, position) => `${title} déposée dans ${column}, position ${position}.`,
    cancelled: (title) => `Déplacement de ${title} annulé.`,
    moved: (title, column) => `${title} déplacée vers ${column}.`,
  },
  eventCalendar: {
    today: "Aujourd’hui",
    previous: "Mois précédent",
    next: "Mois suivant",
    more: (count) => `${count} de plus`,
    events: (count, n) => `${count} évènement${n > 1 ? "s" : ""}`,
    noEvents: "Aucun évènement",
    allDay: "Toute la journée",
  },
  editor: {
    toolbar: "Mise en forme",
    bold: "Gras",
    italic: "Italique",
    underline: "Souligné",
    strike: "Barré",
    code: "Code",
    heading2: "Titre",
    heading3: "Sous-titre",
    bulletList: "Liste à puces",
    orderedList: "Liste numérotée",
    quote: "Citation",
    codeBlock: "Bloc de code",
    link: "Lien",
    linkUrl: "Adresse du lien",
    linkApply: "Appliquer",
    linkRemove: "Retirer le lien",
    undo: "Annuler",
    redo: "Rétablir",
    placeholder: "Écrivez quelque chose…",
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
