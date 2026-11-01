// Agent plans and tool forms: the plan an agent streams as a `data-plan` part (AgentPlan, and Chat
// drawing it by itself), and tools that ask the person with a form before they go on (ToolForm,
// `formTool`, `onToolOutput`). Runs on the built Storybook, in the dark theme.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string, locale: 'en' | 'fr' = 'en') =>
  openStory(page, id, 'dark', locale)

test.describe('Agent plan (Components/AI/Agent plan, Blocks/AI/Chat)', () => {
  test('lists the steps, marks the one in progress and says how far it is', async ({ page }) => {
    await open(page, 'components-ai-agent-plan--default')
    const steps = page.getByRole('list', { name: 'Fix the failing deploys' })
    await expect(steps.getByRole('listitem')).toHaveCount(5)
    const current = steps.locator('[aria-current="step"]')
    await expect(current).toHaveCount(1)
    await expect(current).toContainText('Rename `slug` to `handle` in settings.tsx (In progress)')
    await expect(steps.getByRole('listitem').first()).toContainText('(Done)')
    await expect(
      page.getByRole('progressbar', { name: 'Fix the failing deploys' }),
    ).toHaveAttribute('aria-valuetext', '2 of 5 done')
  })

  test('folds and unfolds from its header', async ({ page }) => {
    await open(page, 'components-ai-agent-plan--default')
    const header = page.getByRole('button', { name: /Fix the failing deploys/ })
    await expect(header).toHaveAttribute('aria-expanded', 'true')
    await header.focus()
    await page.keyboard.press('Enter')
    await expect(header).toHaveAttribute('aria-expanded', 'false')
    await expect(page.getByRole('list')).toHaveCount(0)
  })

  test('a failed step shows why, and a stopped agent leaves no step spinning', async ({ page }) => {
    await open(page, 'components-ai-agent-plan--failed')
    await expect(page.locator('[data-status="failed"]')).toContainText(
      'Deployment protection requires an approval from an owner.',
    )
    await open(page, 'components-ai-agent-plan--stopped')
    await expect(page.locator('[aria-current="step"]')).toContainText('(Stopped)')
    await expect(page.locator('[data-slot="spinner"]')).toHaveCount(0)
  })

  test('with announce, the step in progress is read out', async ({ page }) => {
    await open(page, 'components-ai-agent-plan--live')
    await page.getByRole('button', { name: 'Start' }).click()
    const status = page.getByRole('status')
    await expect(status).toContainText('Now: Read the last three build logs')
    await expect(status).toHaveText('Plan complete', { timeout: 10_000 })
  })

  test('in the chat, a data-plan part moves as the agent works', async ({ page }) => {
    await open(page, 'blocks-ai-chat--agent-plan-live')
    await page.getByRole('button', { name: 'Fix the failing deploys of coreloom-api.' }).click()
    const log = page.getByRole('log', { name: 'Conversation' })
    const plan = log.getByRole('list', { name: 'Fix the failing deploys' })
    await expect(plan.locator('[aria-current="step"]')).toContainText('Read the last three')
    await expect(log).toContainText('5 of 5 done', { timeout: 10_000 })
    await expect(log).toContainText('the fix is in #482')
    // One plan, rewritten in place: the same id never draws twice.
    await expect(log.locator('[data-slot="agent-plan"]')).toHaveCount(1)
  })

  test('follows the locale', async ({ page }) => {
    await open(page, 'components-ai-agent-plan--french', 'fr')
    await expect(page.getByRole('progressbar')).toHaveAttribute(
      'aria-valuetext',
      '2 sur 5 terminées',
    )
    await expect(page.locator('[aria-current="step"]')).toContainText('(En cours)')
  })
})

test.describe('Tool form (Components/AI/Tool form, Blocks/AI/Chat)', () => {
  test('Send with required fields empty: errors, and focus on the first one', async ({ page }) => {
    await open(page, 'components-ai-tool-form--default')
    const form = page.getByRole('form', { name: 'When should we talk about the rollback?' })
    await form.getByRole('button', { name: 'Send' }).click()
    await expect(form.getByText('Fill in this field.')).toHaveCount(2)
    const day = form.getByRole('button', { name: /Day/ })
    await expect(day).toBeFocused()
    await expect(day).toHaveAttribute('aria-invalid', 'true')
    await expect(form.getByLabel('People from your team')).not.toHaveAttribute('aria-invalid')
  })

  test('checks a number against its limits', async ({ page }) => {
    await open(page, 'components-ai-tool-form--default')
    const form = page.getByRole('form')
    await form.getByLabel('People from your team').fill('20')
    await form.getByRole('button', { name: 'Send' }).click()
    await expect(form).toContainText('Enter 8 or less.')
  })

  test('a form written by the model: answer it, and the call shows what was sent', async ({
    page,
  }) => {
    await open(page, 'components-ai-tool-form--written-by-the-model')
    const call = page.getByRole('group', { name: 'Question from the agent' })
    const form = call.getByRole('form', { name: 'Who should get the release notes?' })
    await expect(form).toContainText('I’ll send them once the deploy is green.')
    await form.getByLabel('Reply-to address').fill('ana@')
    await form.getByRole('combobox', { name: 'Audience' }).click()
    await page.getByRole('option', { name: 'Customers' }).click()
    await form.getByRole('button', { name: 'Send' }).click()
    await expect(form).toContainText('Enter an email address.')
    await form.getByLabel('Reply-to address').fill('ana@example.com')
    await form.getByRole('button', { name: 'Send' }).click()
    await expect(call).toContainText('Sent')
    await expect(call).toContainText('Customers')
    await expect(call).toContainText('ana@example.com')
    await expect(call.getByRole('textbox')).toHaveCount(0)
    // The button that had focus is gone: focus lands on the call, not on the page.
    await expect(call).toBeFocused()
  })

  test('Cancel answers with an error and shows the form as cancelled', async ({ page }) => {
    await open(page, 'components-ai-tool-form--in-tool-call')
    const call = page.getByRole('group', { name: 'Schedule a call' })
    await call.getByRole('button', { name: 'Cancel' }).click()
    await expect(call).toContainText('Cancelled')
    await expect(call.getByRole('button')).toHaveCount(0)
  })

  test('in the card, the header says it waits for you, and the call is not busy', async ({
    page,
  }) => {
    await open(page, 'components-ai-tool-form--in-card')
    const card = page.locator('[data-slot="tool-call"]')
    const header = card.getByRole('button', { name: /Schedule a call/ })
    await expect(header).toContainText('Waiting for you')
    await expect(header).toHaveAttribute('aria-expanded', 'true')
    await expect(card).not.toHaveAttribute('aria-busy')
  })

  test('in the chat, the answer goes back through onToolOutput and the agent carries on', async ({
    page,
  }) => {
    await open(page, 'blocks-ai-chat--tool-form')
    const log = page.getByRole('log', { name: 'Conversation' })
    const call = log.getByRole('group', { name: 'Schedule a call' })
    await call.getByRole('button', { name: /Day/ }).click()
    await page.getByRole('button', { name: 'Friday 16 October 2026' }).click()
    await call.getByRole('combobox', { name: 'Time' }).click()
    await page.getByRole('option', { name: '2:00 PM' }).click()
    await call.getByRole('button', { name: 'Schedule' }).click()
    await expect(call).toContainText('Sent')
    await expect(call).toContainText('Oct 16, 2026')
    await expect(log).toContainText('the invite is on its way')
  })

  test('the form follows the locale', async ({ page }) => {
    await open(page, 'blocks-ai-chat--tool-form-french', 'fr')
    const call = page.getByRole('group', { name: 'Planifier un appel' })
    await call.getByRole('button', { name: 'Planifier' }).click()
    await expect(call.getByText('Remplissez ce champ.')).toHaveCount(2)
    await expect(call).toContainText('(facultatif)')
  })
})
