// MediaPlayer, AudioRecorder and DictationButton: playing, seeking from the transcript and the
// chapters, speed, captions and keyboard shortcuts; recording with a stand-in microphone, focus
// after each step, a refused microphone, and dictation into PromptInput. Runs on the built Storybook.
import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string, locale: 'en' | 'fr' = 'en') =>
  openStory(page, id, 'dark', locale)

/**
 * axe on the page as it is now (states and menus that only exist after a click). An open menu is
 * checked alone, once it has faded in: the page behind it is hidden from assistive tech on purpose.
 */
async function axe(page: Page, state: string, only?: string) {
  if (only)
    await page.waitForFunction(() =>
      document
        .getAnimations()
        .every((a) => a.playState !== 'running' || a.effect?.getTiming().iterations === Infinity),
    )
  let builder = new AxeBuilder({ page })
  if (only) builder = builder.include(only)
  const { violations } = await builder
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
    .disableRules(['region', 'landmark-one-main', 'page-has-heading-one'])
    .analyze()
  expect(
    violations.map((v) => `${state}: ${v.id} ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
  ).toEqual([])
}

test.describe('Media player (Components/Media/Media player)', () => {
  test('the open menus and a playing transcript pass axe', async ({ page }) => {
    await open(page, 'components-media-media-player--video')
    const player = page.getByRole('region', { name: 'Getting started with your workspace' })
    await player
      .getByRole('list', { name: 'Transcript' })
      .getByRole('button', { name: /Pick a template/ })
      .click()
    await player.getByRole('button', { name: 'Pause' }).click()
    await axe(page, 'transcript')
    await player.getByRole('button', { name: 'Playback speed, 1×' }).click()
    await expect(page.getByRole('menu')).toBeVisible()
    await axe(page, 'speed menu', '[role=menu]')
    await page.keyboard.press('Escape')
    await player.getByRole('button', { name: 'Captions: off' }).click()
    await expect(page.getByRole('menu')).toBeVisible()
    await axe(page, 'captions menu', '[role=menu]')
  })

  test('plays, pauses, and seeks from the transcript and the chapters', async ({ page }) => {
    await open(page, 'components-media-media-player--video')
    const player = page.getByRole('region', { name: 'Getting started with your workspace' })
    const seek = player.getByRole('slider', { name: 'Position' })
    await expect(seek).toHaveAttribute('aria-valuetext', '0:00 of 0:40')
    await player.getByRole('button', { name: 'Play', exact: true }).click()
    await expect(player.getByRole('button', { name: 'Pause' })).toBeVisible()
    await player.getByRole('button', { name: 'Pause' }).click()

    const transcript = player.getByRole('list', { name: 'Transcript' })
    await transcript.getByRole('button', { name: /To create a project/ }).click()
    await expect(seek).toHaveAttribute('aria-valuetext', /^0:1[2-3] of 0:40$/)
    await expect(transcript.getByRole('button', { name: /To create a project/ })).toHaveAttribute(
      'aria-current',
      'true',
    )
    await expect(player).toContainText('Create a project')

    await player.getByRole('tab', { name: 'Chapters' }).click()
    const chapters = player.getByRole('list', { name: 'Chapters' })
    await chapters.getByRole('button', { name: /Invite your team/ }).click()
    await expect(seek).toHaveAttribute('aria-valuetext', /^0:2[6-7] of 0:40$/)
    await expect(chapters.getByRole('button', { name: /Invite your team/ })).toHaveAttribute(
      'aria-current',
      'true',
    )
  })

  test('speed and captions menus say their state', async ({ page }) => {
    await open(page, 'components-media-media-player--video')
    const player = page.getByRole('region', { name: 'Getting started with your workspace' })
    await player.getByRole('button', { name: 'Playback speed, 1×' }).click()
    await page.getByRole('menuitemradio', { name: '1.5×' }).click()
    await expect(player.getByRole('button', { name: 'Playback speed, 1.5×' })).toBeFocused()

    await player.getByRole('button', { name: 'Captions: off' }).click()
    await page.getByRole('menuitemradio', { name: 'Français' }).click()
    await expect(player.getByRole('button', { name: 'Captions: Français' })).toBeVisible()
    await expect
      .poll(() =>
        page.evaluate(() =>
          Array.from(document.querySelector('video')?.textTracks ?? []).map((t) => t.mode),
        ),
      )
      .toEqual(['disabled', 'showing'])
  })

  test('keyboard shortcuts work from the controls', async ({ page }) => {
    await open(page, 'components-media-media-player--video')
    const player = page.getByRole('region', { name: 'Getting started with your workspace' })
    await player.getByRole('button', { name: 'Forward 10 seconds' }).focus()
    await page.keyboard.press('l')
    await expect(player.getByRole('slider', { name: 'Position' })).toHaveAttribute(
      'aria-valuetext',
      '0:10 of 0:40',
    )
    await page.keyboard.press('m')
    await expect(player.getByRole('button', { name: 'Unmute' })).toBeVisible()
    await page.keyboard.press('c')
    await expect(player.getByRole('button', { name: 'Captions: English' })).toBeVisible()
    await page.keyboard.press('k')
    await expect(player.getByRole('button', { name: 'Pause' })).toBeVisible()
  })

  test('an audio player names the current chapter, and a missing file says so', async ({
    page,
  }) => {
    await open(page, 'components-media-media-player--audio')
    const player = page.getByRole('region', { name: 'Coreloom Weekly · Episode 12' })
    await expect(player.getByText('News of the week', { exact: true })).toBeVisible()
    await expect(player.getByRole('button', { name: /^Captions/ })).toHaveCount(0)
    await expect(player.getByRole('button', { name: 'Full screen' })).toHaveCount(0)

    await open(page, 'components-media-media-player--load-error')
    await expect(page.getByRole('alert')).toHaveText('This media couldn’t be loaded.')
  })
})

test.describe('Audio recorder (Components/Media/Audio recorder)', () => {
  // Safari records; the WebKit build Playwright ships for Linux has no MediaRecorder.
  test.skip(({ browserName }) => browserName === 'webkit', 'No MediaRecorder in this WebKit build')

  test('recording, recorded and refused states pass axe', async ({ page }) => {
    await open(page, 'components-media-audio-recorder--default')
    const recorder = page.getByRole('group', { name: 'Voice recording' })
    await recorder.getByRole('button', { name: 'Record' }).click()
    await expect(recorder.getByRole('button', { name: 'Stop' })).toBeFocused()
    await axe(page, 'recording')
    await recorder.getByRole('button', { name: 'Pause recording' }).click()
    await axe(page, 'paused')
    await recorder.getByRole('button', { name: 'Stop' }).click()
    await expect(recorder.getByRole('button', { name: 'Play the recording' })).toBeFocused()
    await axe(page, 'recorded')

    await open(page, 'components-media-audio-recorder--microphone-blocked')
    await page.getByRole('button', { name: 'Record' }).click()
    await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible()
    await axe(page, 'blocked')

    await open(page, 'components-media-audio-recorder--dictation')
    await page.getByRole('button', { name: 'Dictate' }).click()
    await expect(page.getByRole('button', { name: 'Done: turn into text' })).toBeFocused()
    await axe(page, 'dictating')
  })

  test('records, pauses, stops, plays back and deletes, with focus following', async ({ page }) => {
    await open(page, 'components-media-audio-recorder--default')
    const recorder = page.getByRole('group', { name: 'Voice recording' })
    await recorder.getByRole('button', { name: 'Record' }).click()
    const stop = recorder.getByRole('button', { name: 'Stop' })
    await expect(stop).toBeFocused()
    await expect(recorder.getByRole('status')).toHaveText('Recording')
    await expect(recorder).toContainText('/ 1:00')
    await expect(recorder).toContainText('0:01', { timeout: 5000 })

    await recorder.getByRole('button', { name: 'Pause recording' }).click()
    await expect(recorder.getByRole('status')).toHaveText('Paused')
    await recorder.getByRole('button', { name: 'Resume recording' }).click()
    await stop.click()

    await expect(recorder.getByRole('button', { name: 'Play the recording' })).toBeFocused()
    await expect(recorder.getByRole('status')).toHaveText(/^Recording ready, 0:0\d$/)
    await expect(page.getByText(/^Ready to send: audio\/webm/)).toBeVisible()

    await recorder.getByRole('button', { name: 'Delete the recording' }).click()
    await expect(recorder.getByRole('button', { name: 'Record' })).toBeFocused()
    await expect(page.getByText('Nothing recorded yet.')).toBeVisible()
  })

  test('Discard drops the audio', async ({ page }) => {
    await open(page, 'components-media-audio-recorder--default')
    const recorder = page.getByRole('group', { name: 'Voice recording' })
    await recorder.getByRole('button', { name: 'Record' }).click()
    await recorder.getByRole('button', { name: 'Discard the recording' }).click()
    await expect(recorder.getByRole('button', { name: 'Record' })).toBeFocused()
    await expect(page.getByText('Nothing recorded yet.')).toBeVisible()
  })

  test('a refused microphone says why and offers Try again', async ({ page }) => {
    await open(page, 'components-media-audio-recorder--microphone-blocked')
    const recorder = page.getByRole('group', { name: 'Voice recording' })
    await recorder.getByRole('button', { name: 'Record' }).click()
    await expect(recorder.getByRole('status')).toHaveText(/The microphone is blocked/)
    await expect(recorder.getByRole('button', { name: 'Try again' })).toBeFocused()
  })

  test('dictation adds the transcript to the prompt', async ({ page }) => {
    await open(page, 'components-media-audio-recorder--dictation')
    const field = page.getByRole('textbox', { name: /message/i })
    await field.fill('Please')
    await page.getByRole('button', { name: 'Dictate' }).click()
    await expect(page.getByRole('button', { name: 'Done: turn into text' })).toBeFocused()
    await page.getByRole('button', { name: 'Done: turn into text' }).click()
    await expect(page.getByRole('button', { name: 'Turning speech into text…' })).toBeFocused()
    await expect(field).toHaveValue('Please Summarise the meeting notes and list the decisions.')
    await expect(page.getByRole('button', { name: 'Dictate' })).toBeFocused()
  })
})
