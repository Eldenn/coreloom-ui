# @coreloom/link

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/lib/link.tsx

```ts
function CoreloomLinkProvider
CoreloomLinkProvider.component: LinkComponent
CoreloomLinkProvider.children: React.ReactNode
function useLinkComponent() => LinkComponent
function isExternalHref(href: string) => boolean
function AppLink
AppLink.href: string
AppLink.*: react
type LinkProps = React.ClassAttributes<HTMLAnchorElement> & React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; }
type LinkComponent = React.ComponentClass<LinkProps, any> | React.FunctionComponent<LinkProps>
```
