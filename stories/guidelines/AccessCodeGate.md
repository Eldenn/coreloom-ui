# Access Code Gate

> **Experimental.** This item may still change in a minor release, with an **Upgrading** note in the changelog. See [VERSIONING.md](https://github.com/Eldenn/coreloom-ui/blob/main/VERSIONING.md).

The screen in front of a protected link: the document's name and one box per character of the access code. It goes in AuthLayout. The app checks the code; the gate collects it.

**The consumer provides** `title` (the shared document's name) and `onSubmit(code) => Promise<void>`, and optionally `length` (characters in a code, `8` by default), `alphabet` (the characters a code can hold; by default upper-case letters and digits without 0, O, 1, I and L, which people mix up), `pending` (the app is checking: the boxes wait, `false` by default), `error` (what went wrong), `attemptsLeft` (shown under the boxes), `lockedUntil` (a Date: until then the boxes are off and a countdown runs) and `className`.

- Typing upper-cases letters, and characters outside `alphabet` are ignored. A pasted code fills every box, even with dashes or spaces in it ("h7km-3qpx" becomes H7KM3QPX).
- The code is sent by itself as soon as the last box is filled; the Open button stays for those who wait, and focuses the first empty box when the code is short.
- A wrong code: reject the promise from `onSubmit`, or pass a new `error` (or a new `attemptsLeft`). The boxes empty and focus goes to the first one.
- While the code is checked the boxes keep focus and ignore typing; the button says "Checking…".
- Locked: the boxes and the button are off, and a warning says when it's possible to try again ("You can try again in 4 min 30 s"). At zero the boxes come back on their own.
- Screen readers hear the field as "Access code", the attempts left as its description, and errors and the lock as alerts.
- The gate draws its title as the page's `h1`, like the other auth screens.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/access-code-gate`, and `@coreloom/auth` for AuthLayout.
