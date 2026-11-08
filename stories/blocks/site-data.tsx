// Sample content for the testimonials, blog, changelog and shop stories: Coreloom's own site and a
// small shop of linen goods. Pictures are drawn inline (the stories load nothing from the network).
import type { BlogAuthor, BlogPost } from '@/components/blog'
import type { ChangelogEntry } from '@/components/changelog'
import type { CartLine, Product } from '@/components/commerce'
import type { Testimonial } from '@/components/testimonials'

import { portrait } from './showcase-data'

const svg = (body: string, w = 800, h = 600) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${String(w)}" height="${String(h)}" viewBox="0 0 ${String(w)} ${String(h)}">${body}</svg>`,
  )}`

/** An abstract cover: a background and three shapes in the given colours. */
export function cover(bg: string, a: string, b: string) {
  return svg(
    `<rect width="1600" height="900" fill="${bg}"/><circle cx="1180" cy="300" r="220" fill="${a}"/><rect x="220" y="430" width="640" height="300" rx="40" fill="${b}"/><path d="M0 760C400 640 900 900 1600 700V900H0z" fill="${a}" opacity=".45"/>`,
    1600,
    900,
  )
}

/** A product photo: a folded cloth (or a mug) in `color` on a pale backdrop. */
export function productPhoto(
  color: string,
  kind: 'cloth' | 'mug' | 'bag' = 'cloth',
  bg = '#ece7df',
) {
  const shapes = {
    cloth: `<rect x="190" y="300" width="420" height="120" rx="18" fill="${color}"/><rect x="210" y="250" width="380" height="70" rx="16" fill="${color}" opacity=".85"/><rect x="230" y="210" width="340" height="56" rx="14" fill="${color}" opacity=".7"/>`,
    mug: `<rect x="270" y="220" width="220" height="250" rx="26" fill="${color}"/><path d="M490 280c90 0 90 130 0 130" stroke="${color}" stroke-width="30" fill="none"/>`,
    bag: `<path d="M240 300h320l-30 260H270z" fill="${color}"/><path d="M320 300c0-90 160-90 160 0" stroke="${color}" stroke-width="20" fill="none"/>`,
  }
  return svg(
    `<rect width="800" height="800" fill="${bg}"/><ellipse cx="400" cy="600" rx="300" ry="40" fill="#000" opacity=".08"/>${shapes[kind]}`,
    800,
    800,
  )
}

const avatar = (bg: string, skin: string, hair: string, top: string) =>
  portrait(bg, skin, hair, top)

export const testimonials: Testimonial[] = [
  {
    id: 't1',
    quote:
      'We replaced three internal component libraries with Coreloom in a quarter. The accessibility work alone would have taken us a year.',
    author: 'Inès Marchand',
    byline: 'Head of design, Northwind',
    avatar: <img src={avatar('#c9d4dc', '#e8c4a8', '#5a3b2a', '#4f6b7d')} alt="" />,
    rating: 5,
    source: { label: 'G2', href: 'https://www.g2.com' },
    featured: true,
  },
  {
    id: 't2',
    quote: 'The AI chat blocks read our AI SDK messages as they are. We shipped in a week.',
    author: 'Daniel Okafor',
    byline: 'Staff engineer, Lumen',
    avatar: <img src={avatar('#d8cfe6', '#8d5a3b', '#1f1a17', '#2f3b4a')} alt="" />,
    rating: 5,
  },
  {
    id: 't3',
    quote: 'Keyboard support everywhere, even in the Gantt chart. Our power users noticed.',
    author: 'Mei Tanaka',
    byline: 'Product manager, Atlas',
    rating: 4.5,
  },
  {
    id: 't4',
    quote:
      'Dark mode, light mode, four languages and our brand colour from a single command. It just looks like us.',
    author: 'Lucas Ferreira',
    byline: 'Founder, Pequi',
    avatar: <img src={avatar('#e6d9c7', '#c79a76', '#3a2a1e', '#7a5c3e')} alt="" />,
  },
  {
    id: 't5',
    quote: 'Installed code is our code. No black box to fight when we need something different.',
    author: 'Sarah Klein',
    byline: 'Frontend lead, Kontor',
    source: { label: 'Product Hunt' },
  },
  {
    id: 't6',
    quote: 'The guides are short and they match the code. That’s rarer than it should be.',
    author: 'Tomás Ruiz',
    byline: 'Engineer, Brisa',
    rating: 5,
  },
  {
    id: 't7',
    quote:
      'We run axe in CI on our own screens now, the way Coreloom does. It caught twelve issues the first day.',
    author: 'Amélie Roux',
    byline: 'Accessibility lead, Mistral Bank',
    avatar: <img src={avatar('#cfe0d6', '#f0cfb4', '#a0522d', '#33524a')} alt="" />,
  },
  {
    id: 't8',
    quote: 'Our designers and developers finally talk about the same components.',
    author: 'Noah Becker',
    byline: 'CTO, Fjord',
  },
  {
    id: 't9',
    quote: 'The status page took an afternoon.',
    author: 'Priya Natarajan',
    byline: 'SRE, Orbit',
    rating: 5,
  },
  {
    id: 't10',
    quote:
      'I expected another component kit. It is a design system with opinions, and they are good ones: one main action per view, focus you can always see.',
    author: 'Jonas Lindqvist',
    byline: 'Design engineer, Sund',
  },
  {
    id: 't11',
    quote: 'The French strings are actually French.',
    author: 'Camille Durand',
    byline: 'Developer, Lyon',
  },
]

export const authors: Record<string, BlogAuthor> = {
  ines: {
    id: 'ines',
    name: 'Inès Marchand',
    role: 'Design systems lead',
    avatar: avatar('#c9d4dc', '#e8c4a8', '#5a3b2a', '#4f6b7d'),
    bio: 'Inès looks after Coreloom’s tokens, motion and accessibility. Before that she built design systems for two banks.',
    href: '/blog/authors/ines',
    links: [
      { label: 'GitHub', href: 'https://github.com' },
      { label: 'Mastodon', href: 'https://mastodon.social' },
    ],
  },
  daniel: {
    id: 'daniel',
    name: 'Daniel Okafor',
    role: 'Engineer',
    avatar: avatar('#d8cfe6', '#8d5a3b', '#1f1a17', '#2f3b4a'),
    href: '/blog/authors/daniel',
  },
  mei: { id: 'mei', name: 'Mei Tanaka', role: 'Product' },
}

const d = (month: number, day: number) => new Date(2026, month - 1, day)

export const posts: BlogPost[] = [
  {
    id: 'p1',
    title: 'Designing for the keyboard first',
    href: '/blog/keyboard-first',
    excerpt:
      'Every Coreloom component works without a mouse. Here is how we design the keyboard path before the visual one, and what it changed in our Gantt chart.',
    cover: <img src={cover('#1f2a37', '#3fb6c7', '#e9eef2')} alt="" />,
    category: 'Accessibility',
    date: d(10, 12),
    readingTime: 8,
    authors: [authors.ines],
  },
  {
    id: 'p2',
    title: 'Reading AI SDK messages without depending on it',
    href: '/blog/ai-sdk-types',
    excerpt: 'Structural types, a compatibility test and no runtime dependency.',
    cover: <img src={cover('#2b2140', '#a78bfa', '#f1eefb')} alt="" />,
    category: 'Engineering',
    date: d(10, 3),
    readingTime: 6,
    authors: [authors.daniel],
  },
  {
    id: 'p3',
    title: 'One accent colour, every pairing checked',
    href: '/blog/accents',
    excerpt: 'How `pnpm brand` builds a full accent family from one hex value, in both themes.',
    cover: <img src={cover('#3a2618', '#f59e0b', '#fbf1e2')} alt="" />,
    category: 'Design',
    date: d(9, 24),
    readingTime: 5,
    authors: [authors.ines, authors.mei],
  },
  {
    id: 'p4',
    title: 'What we learned translating 3,000 strings',
    href: '/blog/i18n',
    excerpt: 'French spaces before colons, German “du”, and plurals that are functions.',
    cover: <img src={cover('#14302a', '#34d399', '#e6f6ef')} alt="" />,
    category: 'Engineering',
    date: d(9, 10),
    readingTime: 7,
    authors: [authors.mei],
  },
  {
    id: 'p5',
    title: 'Release notes people actually read',
    href: '/blog/release-notes',
    excerpt: 'Added, Changed, Fixed, and an Upgrading section when you must do something.',
    category: 'Product',
    date: d(8, 28),
    readingTime: 4,
    authors: [authors.daniel],
  },
]

const screenshot = svg(
  `<rect width="1200" height="600" fill="#0f141a"/><rect x="40" y="40" width="260" height="520" rx="12" fill="#18212b"/><rect x="330" y="40" width="830" height="120" rx="12" fill="#18212b"/><rect x="330" y="190" width="400" height="370" rx="12" fill="#18212b"/><rect x="760" y="190" width="400" height="370" rx="12" fill="#18212b"/><rect x="370" y="80" width="300" height="20" rx="10" fill="#3fb6c7"/><path d="M800 500l80-90 70 50 90-140 90 60" stroke="#3fb6c7" stroke-width="8" fill="none"/>`,
  1200,
  600,
)

export const changelog: ChangelogEntry[] = [
  {
    id: 'v2-4-0',
    date: d(10, 13),
    version: '2.4.0',
    title: 'Voice agents and a shop',
    summary:
      'Talk to your agents with push-to-talk, and sell a few products without leaving the design system.',
    media: (
      <img src={screenshot} alt="The voice agent: an animated face above a microphone button" />
    ),
    changes: [
      { kind: 'new', text: 'Voice agent block: push-to-talk, states and a live transcript.' },
      { kind: 'new', text: 'Shop block: product page with variants, cart and order summary.' },
      { kind: 'improved', text: 'Testimonials load faster on long walls.' },
      { kind: 'fixed', text: 'The cookie banner returns focus where it was.' },
    ],
  },
  {
    id: 'v2-3-1',
    date: d(10, 2),
    version: '2.3.1',
    title: 'Fixes for the Gantt chart',
    changes: [
      {
        kind: 'fixed',
        text: 'Dragging a bar across a daylight-saving change no longer shifts it by an hour.',
      },
      {
        kind: 'security',
        text: 'Links in model output are checked against the allowed protocols.',
      },
    ],
  },
  {
    id: 'v2-3-0',
    date: d(9, 18),
    version: '2.3.0',
    title: 'Status pages',
    summary: 'A public status page with 90 days of uptime and incident timelines.',
    changes: [
      { kind: 'new', text: 'Status page block.' },
      { kind: 'improved', text: 'Badges have a success and a warning variant.' },
      { kind: 'deprecated', text: '`Badge variant="positive"`: use `success`.' },
    ],
  },
  {
    id: 'v2-2-0',
    date: d(9, 1),
    version: '2.2.0',
    title: 'Spanish and German',
    changes: [{ kind: 'new', text: 'Every string in Spanish and German.' }],
  },
]

export const products: Product[] = [
  {
    id: 'linen-throw',
    name: 'Linen throw',
    href: '/shop/linen-throw',
    description: (
      <p>
        Stonewashed European linen, soft from the first night. 130 × 170 cm, with a hand-knotted
        fringe.
      </p>
    ),
    images: [
      { src: productPhoto('#c8b79c'), alt: 'The linen throw in sand, folded' },
      { src: productPhoto('#6f7f6a'), alt: 'The linen throw in sage, folded' },
      { src: productPhoto('#2f3b4a'), alt: 'The linen throw in ink, folded' },
      { src: productPhoto('#c8b79c', 'cloth', '#d9d2c5'), alt: 'The sand throw on a bed' },
    ],
    price: 89,
    compareAtPrice: 110,
    badge: '−20%',
    rating: { value: 4.6, count: 128 },
    options: [
      {
        id: 'color',
        name: 'Colour',
        values: [
          { value: 'sand', label: 'Sand', color: '#c8b79c' },
          { value: 'sage', label: 'Sage', color: '#6f7f6a' },
          { value: 'ink', label: 'Ink', color: '#2f3b4a' },
        ],
      },
      {
        id: 'size',
        name: 'Size',
        values: [
          { value: 'single', label: 'Single' },
          { value: 'double', label: 'Double' },
          { value: 'king', label: 'King' },
        ],
      },
    ],
    variants: [
      {
        id: 'sand-single',
        options: { color: 'sand', size: 'single' },
        price: 89,
        compareAtPrice: 110,
        stock: 12,
        image: 0,
      },
      {
        id: 'sand-double',
        options: { color: 'sand', size: 'double' },
        price: 119,
        compareAtPrice: 145,
        stock: 3,
        image: 0,
      },
      { id: 'sand-king', options: { color: 'sand', size: 'king' }, price: 139, stock: 0, image: 0 },
      {
        id: 'sage-single',
        options: { color: 'sage', size: 'single' },
        price: 89,
        stock: 8,
        image: 1,
      },
      {
        id: 'sage-double',
        options: { color: 'sage', size: 'double' },
        price: 119,
        stock: 0,
        image: 1,
      },
      { id: 'sage-king', options: { color: 'sage', size: 'king' }, price: 139, stock: 2, image: 1 },
      {
        id: 'ink-single',
        options: { color: 'ink', size: 'single' },
        price: 89,
        stock: 0,
        image: 2,
      },
      {
        id: 'ink-double',
        options: { color: 'ink', size: 'double' },
        price: 119,
        stock: 0,
        image: 2,
      },
      { id: 'ink-king', options: { color: 'ink', size: 'king' }, price: 139, stock: 0, image: 2 },
    ],
  },
  {
    id: 'stoneware-mug',
    name: 'Stoneware mug',
    href: '/shop/stoneware-mug',
    images: [{ src: productPhoto('#8a9aa6', 'mug'), alt: 'A blue-grey stoneware mug' }],
    price: 24,
    rating: { value: 4.8, count: 61 },
    badge: 'New',
  },
  {
    id: 'market-bag',
    name: 'Market bag',
    href: '/shop/market-bag',
    images: [{ src: productPhoto('#b5734f', 'bag'), alt: 'A terracotta canvas market bag' }],
    price: 32,
    stock: 0,
  },
  {
    id: 'tea-towels',
    name: 'Tea towels, set of 3',
    href: '/shop/tea-towels',
    images: [{ src: productPhoto('#d9c6a5'), alt: 'Three folded tea towels' }],
    price: 29.5,
    rating: { value: 4.2, count: 9 },
  },
]

export const cartLines: CartLine[] = [
  {
    id: 'l1',
    name: 'Linen throw',
    variant: 'Sand / Double',
    image: { src: productPhoto('#c8b79c'), alt: '' },
    href: '/shop/linen-throw',
    unitPrice: 119,
    quantity: 1,
    maxQuantity: 3,
  },
  {
    id: 'l2',
    name: 'Stoneware mug',
    variant: 'Blue-grey',
    image: { src: productPhoto('#8a9aa6', 'mug'), alt: '' },
    href: '/shop/stoneware-mug',
    unitPrice: 24,
    quantity: 2,
  },
  {
    id: 'l3',
    name: 'Tea towels, set of 3',
    image: { src: productPhoto('#d9c6a5'), alt: '' },
    unitPrice: 29.5,
    quantity: 1,
  },
]
