// Agent graph and agent teams: selecting agents, moving between them with the keyboard, following
// links from the details panel, the list view, the team filter, zoom, and a run shown live. Runs on
// the built Storybook, in the dark theme.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string, locale: 'en' | 'fr' = 'en') =>
  openStory(page, id, 'dark', locale)
const graph = (page: Page) => page.getByRole('group', { name: 'Agents and how they work together' })
// An agent's button is named "Name, role, model, …".
const agent = (page: Page, name: string) =>
  graph(page).getByRole('button', { name: new RegExp(`^${name}(,|$)`) })

test.describe('Agent graph (Components/AI/Agent graph)', () => {
  test('one tab stop, arrow keys move between agents by row', async ({ page }) => {
    await open(page, 'components-ai-agent-graph--default')
    const concierge = agent(page, 'Concierge')
    await concierge.focus()
    await expect(graph(page).locator('button[tabindex="0"]')).toHaveCount(1)
    await page.keyboard.press('ArrowDown')
    await expect(agent(page, 'Triage')).toBeFocused()
    await page.keyboard.press('ArrowRight')
    await expect(agent(page, 'Researcher')).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await expect(agent(page, 'Writer')).toBeFocused()
    await page.keyboard.press('ArrowLeft')
    await expect(agent(page, 'On-call engineer')).toBeFocused()
    await page.keyboard.press('Home')
    await expect(concierge).toBeFocused()
    await page.keyboard.press('End')
    await expect(agent(page, 'Web search')).toBeFocused()
  })

  test('Enter selects an agent, Escape clears it, and its links are described', async ({
    page,
  }) => {
    await open(page, 'components-ai-agent-graph--default')
    const tech = agent(page, 'Tech support')
    await expect(tech).toHaveAccessibleDescription(
      'Reports to Triage. Takes over from Billing. Hands off to On-call engineer. Uses Help center and Ticketing.',
    )
    await tech.focus()
    await page.keyboard.press('Enter')
    await expect(tech).toHaveAttribute('aria-pressed', 'true')
    await page.keyboard.press('Escape')
    await expect(tech).toHaveAttribute('aria-pressed', 'false')
    await expect(tech).toBeFocused()
  })

  test('the list view says the same thing in sentences', async ({ page }) => {
    await open(page, 'components-ai-agent-graph--default')
    await page.getByRole('radio', { name: 'List' }).click()
    const support = page.getByRole('list', { name: 'Support' })
    await expect(support.getByRole('button', { name: /^Billing/ })).toContainText(
      'Reports to Triage. Hands off to Tech support. Uses Billing API and Help center.',
    )
    await expect(page.getByRole('list', { name: 'Tools and knowledge' })).toContainText(
      'Web search',
    )
    await expect(page.getByRole('button', { name: 'Zoom in' })).toHaveCount(0)
  })

  test('zoom buttons step the scale and Fit returns to the width', async ({ page }) => {
    await open(page, 'components-ai-agent-graph--default')
    const fit = page.getByRole('button', { name: 'Fit to width' })
    await expect(fit).toHaveAttribute('aria-pressed', 'true')
    await page.getByRole('button', { name: 'Zoom out' }).click()
    await expect(fit).toHaveAttribute('aria-pressed', 'false')
    await expect(page.locator('[data-slot="agent-graph"]')).toContainText('80%')
    await fit.click()
    await expect(fit).toHaveAttribute('aria-pressed', 'true')
  })

  test('a live run says who is working and highlights the path it took', async ({ page }) => {
    await open(page, 'components-ai-agent-graph--live')
    await expect(page.locator('[data-slot="agent-graph"] [aria-live="polite"]')).toHaveText(
      'Tech support is working.',
    )
    await expect(agent(page, 'Tech support')).toHaveAccessibleName(/Working/)
    await expect(agent(page, 'Triage')).toHaveAccessibleName(/Waiting/)
    // Concierge → Triage → Billing → Tech support: three links, the handoff included.
    await expect(page.locator('g[data-active]')).toHaveCount(3)
  })

  test('French', async ({ page }) => {
    await open(page, 'components-ai-agent-graph--french', 'fr')
    await expect(
      page
        .getByRole('group', { name: 'Les agents et leur façon de travailler ensemble' })
        .getByRole('button', { name: /^Tech support/ }),
    ).toHaveAccessibleDescription(/Prend le relais de Billing\./)
  })
})

test.describe('Agent teams (Blocks/AI/Agent teams)', () => {
  test('selecting an agent fills the panel; its links select the related agent', async ({
    page,
  }) => {
    await open(page, 'blocks-ai-agent-teams--no-selection')
    const panel = page.getByRole('complementary', { name: 'Agent details' })
    await expect(panel).toContainText('Select an agent to see who it works with.')
    await agent(page, 'Billing').click()
    await expect(panel.getByRole('heading', { name: 'Billing' })).toBeVisible()
    await expect(panel.getByRole('link', { name: 'Open agent' })).toHaveAttribute(
      'href',
      '#agents/billing',
    )
    await panel
      .getByRole('list', { name: 'Hands off to' })
      .getByRole('button', { name: 'Tech support' })
      .click()
    await expect(panel.getByRole('heading', { name: 'Tech support' })).toBeVisible()
    await expect(agent(page, 'Tech support')).toHaveAttribute('aria-pressed', 'true')
  })

  test('the team filter keeps the team and its tools; a link outside it shows every team', async ({
    page,
  }) => {
    await open(page, 'blocks-ai-agent-teams--default')
    await page.getByRole('combobox', { name: 'Team' }).click()
    await page.getByRole('option', { name: 'Research' }).click()
    await expect(agent(page, 'Writer')).toBeVisible()
    await expect(agent(page, 'Web search')).toBeVisible()
    await expect(agent(page, 'Billing')).toHaveCount(0)
    await expect(agent(page, 'Concierge')).toHaveCount(0)
    await agent(page, 'Researcher').click()
    const panel = page.getByRole('complementary', { name: 'Agent details' })
    await panel
      .getByRole('list', { name: 'Reports to' })
      .getByRole('button', { name: 'Concierge' })
      .click()
    await expect(page.getByRole('combobox', { name: 'Team' })).toHaveText('All teams')
    await expect(agent(page, 'Concierge')).toHaveAttribute('aria-pressed', 'true')
  })

  test('a live run read from trace spans', async ({ page }) => {
    await open(page, 'blocks-ai-agent-teams--live-run')
    await expect(agent(page, 'Tech support')).toHaveAccessibleName(/Working/)
    await expect(agent(page, 'Billing')).toHaveAccessibleName(/Done/)
    await expect(agent(page, 'Concierge')).toHaveAccessibleName(/Waiting/)
    await expect(
      page.getByRole('complementary', { name: 'Agent details' }).getByText('Working'),
    ).toBeVisible()
  })

  test('the panel gives the word on each link', async ({ page }) => {
    await open(page, 'blocks-ai-agent-teams--default')
    await agent(page, 'Billing').click()
    const panel = page.getByRole('complementary', { name: 'Agent details' })
    await expect(
      panel.getByRole('list', { name: 'Hands off to' }).getByRole('button'),
    ).toHaveAccessibleName('Tech support, Bugs')
  })

  test('on a narrow screen the agents start as a list; a selected agent scrolls into view', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await open(page, 'blocks-ai-agent-teams--default')
    await expect(page.getByRole('radio', { name: 'List' })).toBeChecked()
    await page.getByRole('radio', { name: 'Graph' }).click()
    const panel = page.getByRole('complementary', { name: 'Agent details' })
    await panel
      .getByRole('list', { name: 'Reports to' })
      .getByRole('button', { name: 'Concierge' })
      .click()
    await expect(agent(page, 'Concierge')).toBeInViewport()
    await panel
      .getByRole('list', { name: 'Delegates to' })
      .getByRole('button', { name: 'Researcher' })
      .click()
    // It scrolls smoothly: wait for the card to sit inside the box.
    await expect
      .poll(async () => {
        const box = await graph(page).boundingBox()
        const card = await agent(page, 'Researcher').boundingBox()
        return !!box && !!card && card.x >= box.x && card.x + card.width <= box.x + box.width
      })
      .toBe(true)
  })

  test('Edit graph opens the builder on the team, and back shows it again', async ({ page }) => {
    await open(page, 'blocks-ai-agent-teams--edit-in-builder')
    await page.getByRole('button', { name: 'Edit graph' }).click()
    await expect(page.getByRole('button', { name: 'Back to the teams' })).toBeVisible()
    await expect(page.locator('[data-id="concierge-route"]')).toBeVisible()
    await page.getByRole('button', { name: 'Back to the teams' }).click()
    // Billing is still selected.
    const panel = page.getByRole('complementary', { name: 'Agent details' })
    await expect(panel.getByRole('list', { name: 'Reports to' })).toContainText('Triage')
    await expect(panel.getByRole('list', { name: 'Hands off to' })).toContainText('Bugs')
  })

  test('a graph from the agent builder, shown as a team', async ({ page }) => {
    await open(page, 'blocks-ai-agent-teams--from-agent-builder')
    const panel = page.getByRole('complementary', { name: 'Agent details' })
    await expect(panel.getByRole('list', { name: 'Delegates to' })).toContainText('Researcher')
    await expect(panel.getByRole('list', { name: 'Hands off to' })).toContainText('finish')
  })

  test('without agents, an empty state says what to do', async ({ page }) => {
    await open(page, 'blocks-ai-agent-teams--empty')
    await expect(page.locator('#storybook-root')).toContainText('No agents yet.')
  })
})
