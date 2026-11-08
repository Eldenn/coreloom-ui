'use client'

// Coreloom UI — BlogArticle (blog block). One blog post as a page: category, title, lead, authors
// with the date and reading time, the cover, a table of contents beside the text on wide screens,
// the body (your rendered Markdown or rich text, styled here), who wrote it and related posts.
import * as React from 'react'

import {
  AuthorCard,
  type BlogAuthor,
  type BlogPost,
  BlogPostCard,
  PostMeta,
} from '@/components/blog'
import { CopyButton } from '@/components/copy-button'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface BlogHeading {
  /** The heading's `id` in the body. */
  id: string
  title: React.ReactNode
  /** 2 for `h2` (default), 3 for `h3`, indented. */
  level?: 2 | 3
}

const prose = [
  'text-[17px] leading-[1.75] text-fg-secondary',
  '[&_a]:rounded-xs [&_a]:text-primary-text [&_a]:underline [&_a]:underline-offset-4 [&_a]:outline-none [&_a:focus-visible]:ring-[3px] [&_a:focus-visible]:ring-ring',
  '[&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:scroll-mt-24 [&_h2]:font-display [&_h2]:text-[26px] [&_h2]:leading-[1.25] [&_h2]:font-semibold [&_h2]:tracking-[-0.015em] [&_h2]:text-foreground',
  '[&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:scroll-mt-24 [&_h3]:text-[19px] [&_h3]:font-semibold [&_h3]:text-foreground',
  '[&_p]:my-5 [&_strong]:font-semibold [&_strong]:text-foreground',
  '[&_ul]:my-5 [&_ul]:list-disc [&_ul]:ps-6 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:ps-6 [&_li]:mt-2',
  '[&_blockquote]:my-6 [&_blockquote]:border-s-2 [&_blockquote]:border-primary [&_blockquote]:ps-5 [&_blockquote]:text-foreground',
  '[&_figure]:my-8 [&_figcaption]:mt-2 [&_figcaption]:text-[13px] [&_figcaption]:text-muted-foreground [&_img]:rounded-lg',
  '[&_:not(pre)>code]:rounded-xs [&_:not(pre)>code]:bg-secondary [&_:not(pre)>code]:px-1 [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[0.875em] [&_:not(pre)>code]:text-foreground',
  '[&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-border [&_pre]:bg-inset [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-[13.5px] [&_pre]:leading-[1.6]',
].join(' ')

function Contents({ headings }: { headings: BlogHeading[] }) {
  const t = useCoreloomI18n().messages.blog
  const labelId = React.useId()
  return (
    <nav aria-labelledby={labelId} className="self-start lg:sticky lg:top-24">
      <p
        id={labelId}
        className="m-0 mb-3 font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase"
      >
        {t.contents}
      </p>
      <ol className="m-0 flex list-none flex-col gap-0.5 border-s border-border-subtle p-0">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={cn(
                '-ms-px block rounded-e-sm border-s-2 border-transparent py-1.5 text-[13.5px] text-fg-secondary transition-colors outline-none hover:border-border-strong hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring',
                h.level === 3 ? 'ps-6' : 'ps-3',
              )}
            >
              {h.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

function BlogArticle({
  title,
  description,
  category,
  date,
  updatedAt,
  readingTime,
  authors,
  cover,
  headings,
  shareUrl,
  related,
  children,
  className,
}: {
  /** The page's `h1`. */
  title: React.ReactNode
  /** The lead paragraph under the title. */
  description?: React.ReactNode
  category?: string
  date: Date
  /** Shows "Updated on …" when the post changed after it was published. */
  updatedAt?: Date
  /** Minutes; `readingTime(text)` estimates it. */
  readingTime?: number
  authors: BlogAuthor[]
  /** An `<img alt="…">` or a `<figure>`, shown wide under the header. */
  cover?: React.ReactNode
  /** The body's `h2` / `h3` with their ids: a table of contents beside the text (wide screens). */
  headings?: BlogHeading[]
  /** The post's address: shows "Copy link". */
  shareUrl?: string
  /** Posts to read next, shown at the end (two or three). */
  related?: BlogPost[]
  /** The body: your rendered Markdown or rich text. */
  children: React.ReactNode
  className?: string
}) {
  const { messages, locale } = useCoreloomI18n()
  const t = messages.blog
  const relatedId = React.useId()
  const toc = headings && headings.length > 1 ? headings : undefined
  return (
    <article data-slot="blog-article" className={cn('flex w-full flex-col gap-10', className)}>
      <header className="mx-auto flex w-full max-w-[760px] flex-col gap-5">
        {!!category && (
          <p className="m-0 font-mono text-[11px] font-semibold tracking-[0.08em] text-primary-text uppercase">
            {category}
          </p>
        )}
        <h1 className="m-0 font-display text-[clamp(32px,5vw,48px)] leading-[1.1] font-semibold tracking-[-0.03em] text-foreground">
          {title}
        </h1>
        {!!description && (
          <p className="m-0 text-[19px] leading-[1.55] text-fg-secondary">{description}</p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <PostMeta authors={authors} date={date} readingTime={readingTime} />
          {!!shareUrl && <CopyButton value={shareUrl} label={t.copyLink} />}
        </div>
        {!!updatedAt && (
          <p className="m-0 text-[13px] text-muted-foreground">
            {t.updated(new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(updatedAt))}
          </p>
        )}
      </header>
      {!!cover && (
        <div className="overflow-hidden rounded-xl border border-border bg-inset [&_img]:w-full [&_img]:object-cover">
          {cover}
        </div>
      )}
      <div
        className={cn(
          'mx-auto grid w-full gap-10',
          toc ? 'max-w-[1040px] lg:grid-cols-[minmax(0,1fr)_220px]' : 'max-w-[760px]',
        )}
      >
        <div className={cn('min-w-0', toc && 'lg:col-start-1 lg:row-start-1')}>
          <div className={prose}>{children}</div>
          {authors.length > 0 && (
            <div className="mt-12 flex flex-col gap-4">
              {authors.map((a) => (
                <AuthorCard key={a.id} author={a} />
              ))}
            </div>
          )}
        </div>
        {!!toc && (
          <div className="max-lg:row-start-1 lg:col-start-2">
            <Contents headings={toc} />
          </div>
        )}
      </div>
      {!!related?.length && (
        <section
          aria-labelledby={relatedId}
          className="mx-auto w-full max-w-[1040px] border-t border-border-subtle pt-10"
        >
          <h2
            id={relatedId}
            className="m-0 mb-6 font-display text-[22px] font-semibold tracking-[-0.015em] text-foreground"
          >
            {t.related}
          </h2>
          <ul className="m-0 grid list-none gap-x-6 gap-y-10 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((post) => (
              <li key={post.id}>
                <BlogPostCard post={post} headingLevel={3} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}

export { BlogArticle, type BlogHeading }
