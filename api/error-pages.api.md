# @coreloom/error-pages

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/error-page.tsx

```ts
function ErrorPage
ErrorPage.code?: React.ReactNode
ErrorPage.title: React.ReactNode
ErrorPage.description?: React.ReactNode
ErrorPage.actions?: React.ReactNode
ErrorPage.brand?: React.ReactNode
ErrorPage.footer?: React.ReactNode
ErrorPage.className?: string | undefined
function MaintenancePage
MaintenancePage.footer?: React.ReactNode
MaintenancePage.className?: string | undefined
MaintenancePage.description?: React.ReactNode
MaintenancePage.actions?: React.ReactNode
MaintenancePage.brand?: React.ReactNode
MaintenancePage.title?: React.ReactNode
MaintenancePage.until?: Date | undefined
MaintenancePage.statusHref?: string | undefined
function NotFoundPage
NotFoundPage.footer?: React.ReactNode
NotFoundPage.className?: string | undefined
NotFoundPage.description?: React.ReactNode
NotFoundPage.actions?: React.ReactNode
NotFoundPage.brand?: React.ReactNode
NotFoundPage.title?: React.ReactNode
NotFoundPage.homeHref?: string | undefined
function ServerErrorPage
ServerErrorPage.footer?: React.ReactNode
ServerErrorPage.className?: string | undefined
ServerErrorPage.description?: React.ReactNode
ServerErrorPage.actions?: React.ReactNode
ServerErrorPage.brand?: React.ReactNode
ServerErrorPage.title?: React.ReactNode
ServerErrorPage.onRetry?: (() => void) | undefined
ServerErrorPage.reference?: string | undefined
ServerErrorPage.homeHref?: string | undefined
ServerErrorPage.statusHref?: string | undefined
```
