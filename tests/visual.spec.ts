// A screenshot of every story, in both themes, compared with tests/__screenshots__; blocks (whole
// screens) are also taken at phone width, where their layouts change most.
// Baselines come from CI's Playwright container: run the "Visual baselines" workflow (or, inside
// that container, pnpm test:update) after an intended visual change, and review the PNG diff.
//
// A story without a baseline (new, or renamed) would fail its own comparison, and a new block adds
// several at once: hundreds of identical failures hide what to do. So a story's comparison runs
// only when its baseline exists, and one test, "visual · every story has a baseline", fails with
// the list of missing screenshots and the fix. Existing baselines are compared exactly as before.
import fs from 'node:fs'
import path from 'node:path'

import { expect, test } from '@playwright/test'

import { openStory, stories, THEMES } from './stories'

const baselines = path.resolve('tests/__screenshots__')
/** A common phone (iPhone 15 / Pixel 8 class) in CSS pixels. */
const PHONE = { width: 390, height: 844 }

const shots = stories().flatMap((story) => {
  const sizes = story.title.startsWith('Blocks/')
    ? (['desktop', 'phone'] as const)
    : (['desktop'] as const)
  return THEMES.flatMap((theme) =>
    sizes.map((size) => ({
      story,
      theme,
      size,
      file: `${story.id}--${theme}${size === 'phone' ? '--phone' : ''}.png`,
    })),
  )
})

/** Writing screenshots (pnpm test:update) rather than comparing them. */
function updating() {
  return ['all', 'changed'].includes(test.info().config.updateSnapshots)
}

test('visual · every story has a baseline', () => {
  test.skip(updating(), 'Writing baselines.')
  const missing = shots.filter((shot) => !fs.existsSync(path.join(baselines, shot.file)))
  expect(
    missing.map((shot) => shot.file),
    `${missing.length} stories have no baseline screenshot. Run the "Visual baselines" workflow on ` +
      'this branch (Actions → Visual baselines → Run workflow): it commits them and runs the tests ' +
      'again. Stories with a baseline were compared as usual.',
  ).toEqual([])
})

for (const { story, theme, size, file } of shots) {
  test(`visual · ${story.title} · ${story.name} · ${theme}${size === 'phone' ? ' · phone' : ''}`, async ({
    page,
  }) => {
    test.skip(
      !updating() && !fs.existsSync(path.join(baselines, file)),
      'No baseline yet: see "visual · every story has a baseline".',
    )
    if (size === 'phone') await page.setViewportSize(PHONE)
    await openStory(page, story.id, theme)
    await expect(page).toHaveScreenshot(file, { fullPage: true })
  })
}
