# Countdown

The time left until a moment: a launch, the end of an offer, a session that expires, a code that can be sent again.

**The consumer provides** `to` (a Date or a timestamp). Optional: `variant` (`clock` 1:02:14:07, `boxes` with named units, `text` "2 h 14 min"), `days` (`auto`, `always`, `never`), `onComplete`, `completed` (shown at zero, such as "Live now") and a fixed `now` for previews and tests. `splitDuration` is exported.

- It updates every second; screen readers get the time left in words, without being interrupted each second.
- Use `text` in sentences and for long delays, `boxes` for one big moment on a page, `clock` in compact places.
- Countdowns create pressure: use them for real deadlines only, and never reset a fake one.
- Compute the end on the server and pass it in; the visitor's clock may be wrong by minutes.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/countdown` and import from `@/components/ui/countdown`.
