# Blog

A blog's index, article and author pages. Experimental.

**Install** `pnpm dlx shadcn@latest add @coreloom/blog`. It writes `blog.tsx` and `blog-article.tsx`.

**The consumer provides** posts `{ id, title, href, excerpt?, cover?, category?, date, readingTime?, authors }` and authors `{ id, name, role?, avatar?, bio?, href?, links? }`. `BlogArticle` takes the body as children and `headings` for its table of contents.

- The latest post is featured; a category filter and "More posts" follow. Links use the app's router.

_On `window.CoreloomUIDesignSystem_ff5f32` as `BlogList`, `BlogPostCard`, `BlogArticle`, `AuthorCard`, `AuthorProfile`._
