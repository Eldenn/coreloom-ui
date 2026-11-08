import type { Meta, StoryObj } from '@storybook/react-vite'

import { type MediaChapter, MediaPlayer, parseVtt } from '@/components/ui/media-player'

import episode from '../assets/media/episode.webm'
import artwork from '../assets/media/episode-artwork.jpg'
import lessonEnText from '../assets/media/lesson.en.vtt?raw'
import lessonEn from '../assets/media/lesson.en.vtt?url'
import lessonFrText from '../assets/media/lesson.fr.vtt?raw'
import lessonFr from '../assets/media/lesson.fr.vtt?url'
import lesson from '../assets/media/lesson.webm'
import poster from '../assets/media/lesson-poster.jpg'

const chapters: MediaChapter[] = [
  { start: 0, title: 'Your workspace' },
  { start: 12, title: 'Create a project' },
  { start: 26, title: 'Invite your team' },
]

const chaptersFr: MediaChapter[] = [
  { start: 0, title: 'Votre espace' },
  { start: 12, title: 'Créer un projet' },
  { start: 26, title: 'Inviter votre équipe' },
]

const tracks = [
  { src: lessonEn, srcLang: 'en', label: 'English' },
  { src: lessonFr, srcLang: 'fr', label: 'Français' },
]

// One captions file serves both the captions and the transcript.
const transcript = parseVtt(lessonEnText)

const meta = {
  title: 'Components/Media/Media player',
  component: MediaPlayer,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Plays a video or an audio file with the same controls everywhere: play, back and forward, a seek bar with chapter marks, speed, captions, volume and full screen. Chapters and a transcript sit below: the current line is highlighted and a click plays from there. The consumer provides the files (`src`, `poster`, WebVTT `tracks`), `chapters` and `transcript`; `parseVtt` turns a captions file into transcript lines.',
      },
    },
  },
  args: {
    title: 'Getting started with your workspace',
    src: lesson,
    poster,
    tracks,
    chapters,
    transcript,
  },
  argTypes: {
    kind: { control: 'inline-radio', options: ['video', 'audio'] },
    skipSeconds: { control: { type: 'number', min: 5, max: 30 } },
  },
  decorators: [(Story) => <div className="max-w-3xl">{Story()}</div>],
} satisfies Meta<typeof MediaPlayer>
export default meta
type Story = StoryObj<typeof meta>

/** A lesson with chapters, captions in two languages and the transcript. */
export const Video: Story = {}

/** Just the video and its controls. */
export const VideoOnly: Story = {
  args: { chapters: [], transcript: [], tracks: [] },
}

/** A podcast: artwork, the title and the current chapter, then the transcript. */
export const Audio: Story = {
  args: {
    kind: 'audio',
    title: 'Coreloom Weekly · Episode 12',
    src: [{ src: episode, type: 'audio/webm' }],
    poster: artwork,
    tracks: [],
    chapters: [
      { start: 0, title: 'News of the week' },
      { start: 15, title: 'Interview: designing for screen readers' },
      { start: 32, title: 'Listener questions' },
    ],
    transcript: [
      { start: 0, end: 7, speaker: 'Sam', text: 'Hello and welcome to episode twelve.' },
      { start: 7, end: 15, speaker: 'Ana', text: 'This week: three releases and one guest.' },
      {
        start: 15,
        end: 24,
        speaker: 'Sam',
        text: 'Our guest builds design systems that work with a keyboard first.',
      },
      {
        start: 24,
        end: 32,
        speaker: 'Noor',
        text: 'Thanks for having me. Let’s start with focus.',
      },
      {
        start: 32,
        end: 45,
        speaker: 'Ana',
        text: 'Your questions now. The first one is about live regions.',
      },
    ],
  },
}

/** French captions on from the start, French chapters and transcript. */
export const French: Story = {
  globals: { locale: 'fr' },
  args: {
    title: 'Bien démarrer avec votre espace',
    chapters: chaptersFr,
    transcript: parseVtt(lessonFrText),
    tracks: [
      { src: lessonEn, srcLang: 'en', label: 'English' },
      { src: lessonFr, srcLang: 'fr', label: 'Français', default: true },
    ],
  },
}

/** The file can't be loaded: the controls stay, with the reason under them. */
export const LoadError: Story = {
  args: { src: 'missing-file.webm', chapters: [], transcript: [], tracks: [] },
}
