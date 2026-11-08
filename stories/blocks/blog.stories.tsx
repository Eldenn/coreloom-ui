import type { Meta, StoryObj } from '@storybook/react-vite'

import { AuthorCard, AuthorProfile, BlogList, BlogPostCard } from '@/components/blog'
import { BlogArticle } from '@/components/blog-article'

import { authors, cover, posts } from './site-data'

const meta = {
  title: 'Blocks/Blog',
  component: BlogList,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "A blog's pages. `BlogList` shows the latest post large, the others as cards, a category filter and \"More posts\"; `BlogArticle` is one post with its table of contents, authors and related posts; `AuthorProfile` is an author's page. The consumer provides the posts and authors (from a CMS, Markdown files) and renders each article's body; links go through the app's router (`CoreloomLinkProvider`).",
      },
    },
  },
  args: { posts },
} satisfies Meta<typeof BlogList>
export default meta
type Story = StoryObj<typeof meta>

/** The index: the latest post featured, the others as cards, filtered by category. */
export const Index: Story = {}

/** Two cards per page: "More posts" reveals the next ones and moves focus to the first. */
export const Paged: Story = { args: { pageSize: 2 } }

export const Empty: Story = { args: { posts: [] } }

/** One post, with its headings in a table of contents beside the text. */
export const Article: Story = {
  render: () => (
    <BlogArticle
      title="Designing for the keyboard first"
      description="Every Coreloom component works without a mouse. Here is how we design the keyboard path before the visual one."
      category="Accessibility"
      date={new Date(2026, 9, 12)}
      updatedAt={new Date(2026, 9, 13)}
      readingTime={8}
      authors={[authors.ines]}
      shareUrl="https://coreloom.dev/blog/keyboard-first"
      cover={<img src={cover('#1f2a37', '#3fb6c7', '#e9eef2')} alt="" />}
      headings={[
        { id: 'why', title: 'Why the keyboard comes first' },
        { id: 'gantt', title: 'The Gantt chart' },
        { id: 'gantt-resize', title: 'Resizing a bar', level: 3 },
        { id: 'checks', title: 'What we check in CI' },
      ]}
      related={posts.slice(1, 4)}
    >
      <p>
        A mouse user can be careless with focus; a keyboard user can’t. So we draw the keyboard path
        first: where focus starts, where it goes after each action, and what is announced.
      </p>
      <h2 id="why">Why the keyboard comes first</h2>
      <p>
        If something works with <strong>Tab</strong>, arrows and <code>Enter</code>, it nearly
        always works with a switch device, a screen reader and voice control too.
      </p>
      <blockquote>
        Focus is never lost to the body. When something disappears, we move focus on purpose.
      </blockquote>
      <h2 id="gantt">The Gantt chart</h2>
      <p>Each bar is a button. Arrows move it a day; Shift and the arrows move its end.</p>
      <h3 id="gantt-resize">Resizing a bar</h3>
      <ul>
        <li>Shift + Right adds a day to the end.</li>
        <li>Shift + Left removes one.</li>
      </ul>
      <h2 id="checks">What we check in CI</h2>
      <p>
        axe on every story, in both themes and four languages, plus interaction tests for the
        keyboard paths. Read <a href="#why">why</a> again if you skipped it.
      </p>
    </BlogArticle>
  ),
}

/** An author's page: who they are and their posts. */
export const Author: Story = {
  render: () => (
    <AuthorProfile
      author={authors.ines}
      posts={posts.filter((p) => p.authors.includes(authors.ines))}
    />
  ),
}

/** The card under an article, and a single post card. */
export const Cards: Story = {
  render: () => (
    <div className="grid max-w-3xl gap-8">
      <AuthorCard author={authors.ines} />
      <div className="max-w-sm">
        <BlogPostCard post={posts[1]} />
      </div>
    </div>
  ),
}

export const French: Story = { globals: { locale: 'fr' } }

export const Phone: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } }
