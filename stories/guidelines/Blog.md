# Blog

> **Experimental.** This item may still change in a minor release, with an **Upgrading** note in the changelog. See [VERSIONING.md](https://github.com/Eldenn/coreloom-ui/blob/main/VERSIONING.md).

A blog's pages: the index, an article, and the authors. `BlogList` shows the latest post large, the others as cards, a category filter and "More posts"; `BlogArticle` is one post with its header, cover, a table of contents beside the text, the body, its authors and related posts; `AuthorProfile` is an author's page.

**The consumer provides** the `posts`, each `{ id, title, href, excerpt?, cover?, category?, date, readingTime?, authors }`, and the authors, each `{ id, name, role?, avatar?, bio?, href?, links? }` (`avatar` is the portrait's URL, `links` `{ label, href }[]`). `readingTime(text)` estimates the minutes. Links go through the app's router (`CoreloomLinkProvider`).

**`BlogList` takes** `posts` (newest first), `featured` (default true: the first post large), `category`, `defaultCategory`, `onCategoryChange`, `categories` (default: the posts' categories; `[]` hides the filter) and `pageSize` (default 9).

**`BlogArticle` takes** `title` (the page's `h1`), `description`, `category`, `date`, `updatedAt`, `readingTime`, `authors`, `cover`, `headings` (`{ id, title, level? }`, the body's `h2` / `h3`: a table of contents from two of them), `shareUrl` (a "Copy link" button), `related` and `children` (the body: your rendered Markdown or rich text, styled here).

**`BlogPostCard` takes** `post`, `variant` (`featured` puts the cover beside the text) and `headingLevel` (2 by default, 3 under a section's `h2`). **`AuthorCard` takes** `author`; **`AuthorProfile` takes** `author` and `posts`.

- A whole card is clickable, but only its title link is focusable and read: no duplicate links.
- "More posts" reveals the next cards and moves focus to the first new one.
- The body's headings need the `id` you list in `headings`. Render Markdown with `skipHtml` (or the Coreloom `Markdown`): post content is untrusted.
- Covers are decorative (`alt=""`) when the title says it all; describe them when they carry information.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/blog`.
