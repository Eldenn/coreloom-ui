# API Try It

The "Try it" panel of an API reference page: path, query and header parameters, extra headers, a JSON body, Send and Cancel, then the status, time, size, body and headers that came back, and Copy as cURL. Experimental.

**`ApiTryIt` takes** `endpoint` (`{ method, path, summary?, parameters?, body? }`), `baseUrl`, `onSend(request, { signal }) => Promise<{ status, statusText?, headers, body, durationMs? }>`, and optionally `auth` (`{ header?, prefix?, defaultToken?, label? }`), `defaultValues`, `defaultResponse`, `title` and `className`.

- The app makes the call (and owns CORS and auth); the panel never fetches.
- Missing required parameters and invalid JSON block Send and focus the field.
- The body shows as a JSON tree or plain text, never as HTML.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/api-try-it`.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`._
