# Security policy

## Supported versions

Coreloom UI is installed by copying files into your app (`shadcn add`), so a fix reaches you when you
re-install the item. Fixes are made on `main` and shipped in the next release.

| Version        | Supported |
| -------------- | --------- |
| Latest release | Yes       |
| Older releases | No        |

## Reporting a vulnerability

Please don't open a public issue. Report it privately through GitHub:
[**Report a vulnerability**](https://github.com/Eldenn/coreloom-ui/security/advisories/new).

Say which item is affected (`@coreloom/<item>`), the version or commit, and how to reproduce it. You will
get an answer within a week. Once it's fixed, the release notes credit you (unless you prefer not) and
say what to re-install under **Security** and **Upgrading**.

## What's in scope

The components render content from users and models, so these matter most:

- HTML or script injection through rendered content (Markdown, rich text, diagrams, code, chat messages).
- Links that escape the allowlist (`http`, `https`, `mailto`).
- A registry item that installs something it shouldn't (files outside its paths, unexpected
  dependencies).

Coreloom UI has no server and makes no network calls: what your app does with the callbacks it provides
is your app's code.
