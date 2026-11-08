---
'@coreloom/ui': minor
---

### Added

- `@coreloom/api-try-it` (experimental): the "Try it" panel of an API reference page. Path, query
  and header parameters, extra headers, a JSON body, Send and Cancel, then the status, time, size,
  body (a JSON tree or text) and headers that came back, and Copy as cURL. The app makes the call
  through `onSend(request, { signal })`. The helpers `buildRequestUrl`, `buildRequest`, `toCurl`,
  `shellQuote`, `parseResponseBody`, `statusKind` and `bodySize` are exported too.
