'use client'

// Coreloom UI — Blog (blog block). The index of a blog and its authors: `BlogList` shows the latest
// post large, the others as cards, a category filter and "More posts"; `BlogPostCard` is one post;
// `AuthorCard` and `AuthorProfile` present who wrote them. Posts come from the app (a CMS,
// Markdown files); links go through the app's router (CoreloomLinkProvider). `BlogArticle` is in
// blog-article.tsx.
import * as React from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ChipGroup } from '@/components/ui/chip-group'
import { useCoreloomI18n } from '@/lib/i18n'
import { initials } from '@/lib/initials'
import { AppLink } from '@/lib/link'
import { cn } from '@/lib/utils'

interface BlogAuthor {
  id: string
  name: string
  /** "Design engineer". */
  role?: React.ReactNode
  /** The portrait's URL. */
  avatar?: string
  bio?: React.ReactNode
  /** The author's page. */
  href?: string
  /** Elsewhere: { label: "GitHub", href }. */
  links?: { label: string; href: string }[]
}

interface BlogPost {
  id: string
  title: string
  href: string
  excerpt?: React.ReactNode
  /** An `<img alt="">` (the title is beside it), 16:9 works best. */
  cover?: React.ReactNode
  category?: string
  date: Date
  /** Minutes; `readingTime(text)` estimates it. */
  readingTime?: number
  authors: BlogAuthor[]
}

/** Minutes to read a text at `wordsPerMinute` (default 230), at least 1. */
function readingTime(text: string, wordsPerMinute = 230) {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / wordsPerMinute))
}

/** The categories of the posts, once each, in the order they first appear. */
function blogCategories(posts: BlogPost[]) {
  return [...new Set(posts.flatMap((p) => (p.category ? [p.category] : [])))]
}

function AuthorAvatar({ author, size }: { author: BlogAuthor; size?: 'sm' | 'default' | 'lg' }) {
  return (
    <Avatar size={size} className="ring-2 ring-background">
      {!!author.avatar && <AvatarImage src={author.avatar} alt="" />}
      <AvatarFallback>{initials(author.name)}</AvatarFallback>
    </Avatar>
  )
}

/** Authors, date and reading time on one line, as under a post's title. */
function PostMeta({
  authors,
  date,
  readingTime: minutes,
  className,
}: {
  authors: BlogAuthor[]
  date: Date
  readingTime?: number
  className?: string
}) {
  const { messages, locale } = useCoreloomI18n()
  const t = messages.blog
  const names = new Intl.ListFormat(locale, { type: 'conjunction' }).format(
    authors.map((a) => a.name),
  )
  return (
    <div className={cn('flex items-center gap-3 text-[13px] text-muted-foreground', className)}>
      {authors.length > 0 && (
        <span className="flex shrink-0 -space-x-2">
          {authors.slice(0, 3).map((a) => (
            <AuthorAvatar key={a.id} author={a} size="sm" />
          ))}
        </span>
      )}
      <span className="flex min-w-0 flex-wrap items-center gap-x-1.5">
        {authors.length > 0 && <span className="font-medium text-fg-secondary">{names}</span>}
        {authors.length > 0 && <span aria-hidden>·</span>}
        <time dateTime={date.toISOString()}>
          {new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date)}
        </time>
        {minutes !== undefined && (
          <>
            <span aria-hidden>·</span>
            <span>{t.readingTime(minutes)}</span>
          </>
        )}
      </span>
    </div>
  )
}

function BlogPostCard({
  post,
  variant = 'default',
  headingLevel = 2,
  className,
}: {
  post: BlogPost
  /** "featured": the cover beside the text, larger title (the latest post). */
  variant?: 'default' | 'featured'
  /** The title's heading level: 2 (default) on a blog's index, 3 under a section's `h2`. */
  headingLevel?: 2 | 3
  className?: string
}) {
  const featured = variant === 'featured'
  const Heading = headingLevel === 3 ? 'h3' : 'h2'
  return (
    <article
      data-slot="blog-post-card"
      className={cn(
        'group relative flex flex-col gap-4',
        featured && 'md:grid md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-center md:gap-8',
        className,
      )}
    >
      {!!post.cover && (
        <div className="aspect-video overflow-hidden rounded-lg border border-border bg-inset [&>img]:size-full [&>img]:object-cover [&>img]:transition-transform [&>img]:duration-slow group-hover:[&>img]:scale-[1.02] motion-reduce:[&>img]:transition-none">
          {post.cover}
        </div>
      )}
      <div className="flex flex-col gap-2.5">
        {!!post.category && (
          <span className="font-mono text-[11px] font-semibold tracking-[0.08em] text-primary-text uppercase">
            {post.category}
          </span>
        )}
        <Heading
          className={cn(
            'm-0 font-display leading-[1.25] font-semibold tracking-[-0.015em] text-foreground',
            featured ? 'text-[clamp(24px,3vw,32px)]' : 'text-[19px]',
          )}
        >
          {/* The whole card is clickable through the link's ::after; the link alone is focusable. */}
          <AppLink
            href={post.href}
            className="rounded-xs outline-none after:absolute after:inset-0 after:content-[''] hover:underline hover:underline-offset-4 focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            {post.title}
          </AppLink>
        </Heading>
        {!!post.excerpt && (
          <p
            className={cn(
              'm-0 text-fg-secondary',
              featured ? 'text-[16px] leading-[1.6]' : 'line-clamp-3 text-[14.5px] leading-[1.6]',
            )}
          >
            {post.excerpt}
          </p>
        )}
        <PostMeta
          authors={post.authors}
          date={post.date}
          readingTime={post.readingTime}
          className="mt-1"
        />
      </div>
    </article>
  )
}

function BlogList({
  posts,
  featured = true,
  category: categoryProp,
  defaultCategory = '',
  onCategoryChange,
  categories,
  pageSize = 9,
  className,
}: {
  /** Newest first. */
  posts: BlogPost[]
  /** Shows the first post large, above the others. Default true. */
  featured?: boolean
  /** The category shown; "" for all. */
  category?: string
  defaultCategory?: string
  onCategoryChange?: (category: string) => void
  /** The filter's chips; defaults to the posts' categories. An empty array hides the filter. */
  categories?: string[]
  /** Cards shown before "More posts" (the featured post not counted). Default 9. */
  pageSize?: number
  className?: string
}) {
  const t = useCoreloomI18n().messages.blog
  const [innerCategory, setInnerCategory] = React.useState(defaultCategory)
  const category = categoryProp ?? innerCategory
  const [shown, setShown] = React.useState(pageSize)
  const listRef = React.useRef<HTMLUListElement>(null)
  const chips = categories ?? blogCategories(posts)
  const filtered = category ? posts.filter((p) => p.category === category) : posts
  const lead = featured && !category ? filtered.at(0) : undefined
  const rest = lead ? filtered.slice(1) : filtered
  const visible = rest.slice(0, shown)

  function more() {
    const first = visible.length
    setShown((n) => n + pageSize)
    // The new cards' links get focus: the button may have gone, and reading resumes there.
    requestAnimationFrame(() => {
      listRef.current?.querySelectorAll<HTMLElement>(':scope > li a')[first]?.focus()
    })
  }

  return (
    <div data-slot="blog-list" className={cn('flex w-full flex-col gap-10', className)}>
      {chips.length > 1 && (
        <ChipGroup
          type="single"
          aria-label={t.categories}
          value={category}
          onValueChange={(v) => {
            setInnerCategory(v)
            setShown(pageSize)
            onCategoryChange?.(v)
          }}
          options={[{ value: '', label: t.all }, ...chips.map((c) => ({ value: c, label: c }))]}
        />
      )}
      {!!lead && <BlogPostCard post={lead} variant="featured" />}
      {visible.length > 0 && (
        <ul
          ref={listRef}
          aria-label={t.posts}
          className="m-0 grid list-none gap-x-6 gap-y-10 p-0 sm:grid-cols-2 lg:grid-cols-3"
        >
          {visible.map((post) => (
            <li key={post.id}>
              <BlogPostCard post={post} />
            </li>
          ))}
        </ul>
      )}
      {filtered.length === 0 && <p className="m-0 text-[14px] text-muted-foreground">{t.empty}</p>}
      {rest.length > visible.length && (
        <Button variant="secondary" className="self-center" onClick={more}>
          {t.more}
        </Button>
      )}
    </div>
  )
}

function AuthorLinks({ links }: { links: NonNullable<BlogAuthor['links']> }) {
  const t = useCoreloomI18n().messages.blog
  return (
    <ul className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 text-[13px]">
      {links.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-xs text-primary-text underline underline-offset-4 outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            {link.label}
            <span className="sr-only"> {t.newTab}</span>
          </a>
        </li>
      ))}
    </ul>
  )
}

function AuthorCard({ author, className }: { author: BlogAuthor; className?: string }) {
  const t = useCoreloomI18n().messages.blog
  return (
    <div
      data-slot="author-card"
      className={cn('flex gap-4 rounded-lg border border-border bg-card p-5', className)}
    >
      <AuthorAvatar author={author} size="lg" />
      <div className="flex min-w-0 flex-col gap-1.5">
        <p className="m-0 font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
          {t.writtenBy}
        </p>
        <p className="m-0 text-[15px] font-medium text-foreground">
          {author.href ? (
            <AppLink
              href={author.href}
              className="rounded-xs outline-none hover:underline hover:underline-offset-4 focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              {author.name}
            </AppLink>
          ) : (
            author.name
          )}
        </p>
        {!!author.role && <p className="m-0 text-[13px] text-muted-foreground">{author.role}</p>}
        {!!author.bio && (
          <p className="m-0 text-[14px] leading-[1.6] text-fg-secondary">{author.bio}</p>
        )}
        {!!author.links?.length && <AuthorLinks links={author.links} />}
      </div>
    </div>
  )
}

function AuthorProfile({
  author,
  posts,
  className,
}: {
  author: BlogAuthor
  /** The author's posts, newest first. */
  posts: BlogPost[]
  className?: string
}) {
  const t = useCoreloomI18n().messages.blog
  return (
    <div data-slot="author-profile" className={cn('flex w-full flex-col gap-10', className)}>
      <header className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <Avatar className="size-20 ring-2 ring-background">
          {!!author.avatar && <AvatarImage src={author.avatar} alt="" />}
          <AvatarFallback className="text-[24px]">{initials(author.name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-2">
          <h1 className="m-0 font-display text-[clamp(28px,4vw,40px)] leading-[1.1] font-semibold tracking-[-0.03em] text-foreground">
            {author.name}
          </h1>
          {!!author.role && <p className="m-0 text-[15px] text-muted-foreground">{author.role}</p>}
          {!!author.bio && (
            <p className="m-0 max-w-[60ch] text-[15px] leading-[1.6] text-fg-secondary">
              {author.bio}
            </p>
          )}
          {!!author.links?.length && <AuthorLinks links={author.links} />}
        </div>
      </header>
      <p className="m-0 border-t border-border-subtle pt-6 font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        {t.postCount(posts.length)}
      </p>
      <BlogList posts={posts} featured={false} categories={[]} />
    </div>
  )
}

export {
  AuthorCard,
  AuthorProfile,
  type BlogAuthor,
  blogCategories,
  BlogList,
  type BlogPost,
  BlogPostCard,
  PostMeta,
  readingTime,
}
