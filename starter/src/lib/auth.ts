// A pretend session kept in localStorage, so the sign-in flow and protected routes work without a
// backend. Replace signIn / signOut with calls to your auth (cookie session, OAuth…) and keep
// the shape: the router reads `auth.user` in beforeLoad, components use useAuth().
import { useSyncExternalStore } from "react"

export type User = { name: string; email: string }

const KEY = "session"
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

function set(user: User | null) {
  current = user
  try {
    if (user) localStorage.setItem(KEY, JSON.stringify(user))
    else localStorage.removeItem(KEY)
  } catch {
    // Private mode: the session lasts until the tab closes.
  }
  listeners.forEach((listener) => listener())
}

export const auth = {
  get user() {
    return current
  },
  async signIn(email: string, password: string) {
    await new Promise((resolve) => setTimeout(resolve, 600))
    // Demo rule, so the error state can be tried: any email, any password of 8+ characters.
    if (password.length < 8) throw new Error("wrong-credentials")
    const name = email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    set({ name, email })
  },
  signOut() {
    set(null)
  },
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}

export type Auth = typeof auth

export function useAuth() {
  return useSyncExternalStore(auth.subscribe, () => auth.user)
}
