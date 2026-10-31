// A pretend session kept in localStorage, so the sign-in, sign-up and password-reset flows and the
// protected routes work without a backend. Replace the method bodies with calls to your auth
// (cookie session, OAuth…) and keep the shape: the router reads `auth.user` in beforeLoad,
// components use useAuth(). The demo rules are spelled out on each screen.
import { useSyncExternalStore } from 'react'

export interface User {
  name: string
  email: string
}

const KEY = 'session'
const listeners = new Set<() => void>()

function read(): User | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

let current = read()

// A sign-up waiting for its email code. Kept for the tab (sessionStorage), so a reload of /verify works.
const PENDING = 'pending-signup'
function readPending(): User | null {
  try {
    const raw = sessionStorage.getItem(PENDING)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}
function setPending(user: User | null) {
  try {
    if (user) sessionStorage.setItem(PENDING, JSON.stringify(user))
    else sessionStorage.removeItem(PENDING)
  } catch {
    /* private mode */
  }
}

const wait = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms))

/** Thrown with a code the screens turn into a message. */
export class AuthError extends Error {
  code: 'wrong-credentials' | 'email-taken' | 'wrong-code' | 'link-expired'
  constructor(code: AuthError['code']) {
    super(code)
    this.code = code
  }
}

function set(user: User | null) {
  current = user
  try {
    if (user) localStorage.setItem(KEY, JSON.stringify(user))
    else localStorage.removeItem(KEY)
  } catch {
    // Private mode: the session lasts until the tab closes.
  }
  listeners.forEach((listener) => {
    listener()
  })
}

export const auth = {
  get user() {
    return current
  },
  async signIn(email: string, password: string) {
    await wait()
    // Demo rule, so the error state can be tried: any email, any password of 8+ characters.
    if (password.length < 8) throw new AuthError('wrong-credentials')
    const name = email
      .split('@')[0]
      .replace(/[._-]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
    set({ name, email })
  },
  /** Starts a sign-up; the account exists once its email code is verified. */
  async signUp(name: string, email: string, _password: string) {
    await wait()
    if (email.toLowerCase() === 'taken@acme.dev') throw new AuthError('email-taken')
    setPending({ name, email })
  },
  /** The sign-up waiting for its code, if any. */
  get pendingSignUp() {
    return readPending()
  },
  async verify(code: string) {
    await wait()
    const pending = readPending()
    if (!pending || code === '000000') throw new AuthError('wrong-code')
    setPending(null)
    set(pending)
  },
  async resendCode() {
    await wait(300)
  },
  /** Sends the reset link. Says nothing about whether the account exists. */
  async requestPasswordReset(_email: string) {
    await wait()
  },
  async resetPassword(token: string, _password: string) {
    await wait()
    if (token === 'expired') throw new AuthError('link-expired')
  },
  signOut() {
    set(null)
  },
  // An arrow function: useSyncExternalStore gets it unbound (auth.subscribe).
  subscribe: (listener: () => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}

export type Auth = typeof auth

export function useAuth() {
  return useSyncExternalStore(auth.subscribe, () => auth.user)
}
