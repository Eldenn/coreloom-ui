# @coreloom/blog

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/blog.tsx

```ts
function AuthorCard
AuthorCard.author: BlogAuthor
AuthorCard.className?: string | undefined
function AuthorProfile
AuthorProfile.author: BlogAuthor
AuthorProfile.posts: BlogPost[]
AuthorProfile.className?: string | undefined
type BlogAuthor = {}
BlogAuthor.id: string
BlogAuthor.name: string
BlogAuthor.role?: React.ReactNode
BlogAuthor.avatar?: string | undefined
BlogAuthor.bio?: React.ReactNode
BlogAuthor.href?: string | undefined
BlogAuthor.links?: { label: string; href: string; }[] | undefined
function blogCategories(posts: BlogPost[]) => string[]
function BlogList
BlogList.posts: BlogPost[]
BlogList.featured?: boolean | undefined
BlogList.category?: string | undefined
BlogList.defaultCategory?: string | undefined
BlogList.onCategoryChange?: ((category: string) => void) | undefined
BlogList.categories?: string[] | undefined
BlogList.pageSize?: number | undefined
BlogList.className?: string | undefined
type BlogPost = {}
BlogPost.id: string
BlogPost.title: string
BlogPost.href: string
BlogPost.excerpt?: React.ReactNode
BlogPost.cover?: React.ReactNode
BlogPost.category?: string | undefined
BlogPost.date: Date
BlogPost.readingTime?: number | undefined
BlogPost.authors: BlogAuthor[]
function BlogPostCard
BlogPostCard.post: BlogPost
BlogPostCard.variant?: 'default' | 'featured' | undefined
BlogPostCard.headingLevel?: 2 | 3 | undefined
BlogPostCard.className?: string | undefined
function PostMeta
PostMeta.authors: BlogAuthor[]
PostMeta.date: Date
PostMeta.readingTime?: number | undefined
PostMeta.className?: string | undefined
function readingTime(text: string, wordsPerMinute?: number) => number
```

## src/components/blog-article.tsx

```ts
function BlogArticle
BlogArticle.title: React.ReactNode
BlogArticle.description?: React.ReactNode
BlogArticle.category?: string | undefined
BlogArticle.date: Date
BlogArticle.updatedAt?: Date | undefined
BlogArticle.readingTime?: number | undefined
BlogArticle.authors: BlogAuthor[]
BlogArticle.cover?: React.ReactNode
BlogArticle.headings?: BlogHeading[] | undefined
BlogArticle.shareUrl?: string | undefined
BlogArticle.related?: BlogPost[] | undefined
BlogArticle.children: React.ReactNode
BlogArticle.className?: string | undefined
type BlogHeading = {}
BlogHeading.id: string
BlogHeading.title: React.ReactNode
BlogHeading.level?: 2 | 3 | undefined
```
