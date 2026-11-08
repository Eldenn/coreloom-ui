# API Try It

> **Experimental.** This item may still change in a minor release, with an **Upgrading** note in the changelog. See [VERSIONING.md](https://github.com/Eldenn/coreloom-ui/blob/main/VERSIONING.md).

The panel an API reference page shows beside an endpoint, so a reader can call it without leaving the docs: fill the path, query and header parameters, add headers and a JSON body, send, and read the status, time, size, body and headers that came back. "Copy as cURL" gives the same request for a terminal. It is not a Postman: no collections, environments or history. The panel sends nothing itself; the app makes the call, so CORS, authentication and rate limits are the app's (often a small proxy route on the docs site).

**The consumer provides** `endpoint` (`{ method, path, summary?, parameters?, body? }`: `method` is GET, POST, PUT, PATCH or DELETE, `path` names its parameters in braces as in `/projects/{projectId}`, each parameter is `{ name, in: 'path' | 'query' | 'header', required?, description?, example? }`, and `body` is `{ example, contentType? }`, JSON by default), `baseUrl` (put before the path) and `onSend(request, { signal }) => Promise<response>`: `request` is `{ method, url, headers, body? }` with headers as `[name, value]` pairs, and the promise resolves with `{ status, statusText?, headers, body, durationMs? }` or rejects when no answer came. Optionally `auth` (`{ header?, prefix?, defaultToken?, label? }`: a token field sent as `Authorization: Bearer …` by default; `prefix: ''` sends it as is, for an API key header), `defaultValues` (the parameter fields, by name), `defaultResponse` (shown before anything is sent, such as the documented example), `title` ("Try it" by default) and `className`.

- The URL above the form updates as you type, with `{name}` left in for path parameters not filled yet, and has a Copy button. Path values are encoded, so `../` or `?` in a value can't change the route.
- Path parameters are always required; others when marked `required`. Send with one missing shows "Enter projectId: it's required." under each one and focuses the first. A body that isn't valid JSON blocks Send too: focus goes to the editor, which says on which line and column the JSON breaks.
- Enter in a field or Ctrl/⌘+Enter anywhere (the body editor too) sends. While the request runs, Send shows a spinner and Cancel aborts `signal`; focus goes back to Send.
- The status shows its code, text and kind in words (Success, Client error…), not only a colour, then the time and the size. The body is a JSON tree when it parses, plain text otherwise; it is never rendered as HTML. Headers are in their own tab.
- One polite live region announces "Sending…", "Response received: 200 OK." or "Request cancelled."; a failure shows in an alert with the error's message.
- Copy as cURL quotes every value for a POSIX shell (a `'` or `$(…)` in a value stays text). It includes the token: say so to readers who share commands.
- When not to use it: for an internal API client with saved requests and environments, use a dedicated tool. For webhooks you send, use `Webhooks`.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/api-try-it`.
