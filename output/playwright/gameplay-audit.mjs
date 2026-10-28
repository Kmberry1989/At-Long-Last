import { chromium } from '/Users/kyleberry/.codex/skills/develop-web-game/scripts/node_modules/playwright/index.mjs'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const out = new URL('./', import.meta.url)
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 })
page.setDefaultTimeout(1500)
const consoleMessages = []
page.on('console', (message) => consoleMessages.push(`${message.type()}: ${message.text()}`))
page.on('pageerror', (error) => consoleMessages.push(`pageerror: ${error.message}`))

let shot = 0
async function capture(name) {
  shot += 1
  const filename = `${String(shot).padStart(2, '0')}-${name}.png`
  await page.screenshot({ path: fileURLToPath(new URL(filename, out)), fullPage: true, timeout: 10000 })
  return filename
}

async function visibleText() {
  return (await page.evaluate(() => document.body.innerText)).replace(/\n{3,}/g, '\n\n')
}

async function clickIf(name) {
  const clicked = await page.evaluate((label) => {
    const button = [...document.querySelectorAll('button')].find((element) => (
      element.textContent.trim() === label &&
      !element.disabled &&
      element.getClientRects().length > 0
    ))
    button?.click()
    return Boolean(button)
  }, name)
  if (clicked) {
    await page.waitForTimeout(180)
    return true
  }
  return false
}

await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' })
await capture('local-preview-entry')
await page.getByPlaceholder('Your display name').evaluate((element) => {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
  setter.call(element, 'Kyle')
  element.dispatchEvent(new Event('input', { bubbles: true }))
})
await page.evaluate(() => [...document.querySelectorAll('button')].find((element) => element.textContent.includes('Open Preview'))?.click())
await page.waitForTimeout(350)
await capture('vibe-setup')
const vibeHandle = page.getByRole('button', { name: 'Move the vibe mix' })
await page.evaluate(() => document.querySelector('[aria-label="Move the vibe mix"]')?.focus())
await page.keyboard.press('ArrowRight')
const keyboardVibeValue = await page.evaluate(() => document.querySelector('[aria-label="Move the vibe mix"]')?.getAttribute('aria-valuetext'))
await page.evaluate(() => [...document.querySelectorAll('button')].find((element) => element.textContent.includes('Lock My Vote'))?.click())
await page.waitForTimeout(250)
await capture('board-first-turn')

let capturedActivity = false
let capturedKeepsake = false
let capturedDuel = false
let capturedExpansionActivity = false
const expansionActivityIds = new Set([
  'rose-thorn-seed', 'ordinary-treasure', 'invisible-backpack', 'gentle-signal',
  'five-minute-tradition', 'museum-of-us', 'wrong-answers-only', 'couple-mascot',
  'tiny-shark-tank', 'plot-twist', 'soundtrack-shuffle', 'emoji-forecast',
  'closer-than-words', 'date-trailer', 'favorite-detail', 'green-light-tonight',
  'chemistry-recipe', 'doorstep-scene',
])
const seenActivityIds = new Set()
let iterations = 0
while (!(await page.getByText('Finale', { exact: true }).count()) && iterations < 80) {
  iterations += 1
  const stateLine = (await page.evaluate(() => document.body.innerText)).split('\n').filter(Boolean).slice(0, 16).join(' | ')
  console.log(`iteration ${iterations}: ${stateLine}`)
  if (await clickIf('Roll Dice')) continue

  const textarea = page.locator('textarea:visible')
  if (await textarea.count()) {
    const currentActivityId = await page.evaluate(() => {
      if (typeof window.render_game_to_text !== 'function') return null
      return JSON.parse(window.render_game_to_text()).activity?.id || null
    })
    if (currentActivityId) seenActivityIds.add(currentActivityId)
    if (!capturedExpansionActivity && expansionActivityIds.has(currentActivityId)) {
      await capture(`expansion-${currentActivityId}`)
      capturedExpansionActivity = true
    }
    if (!capturedActivity && await page.getByRole('button', { name: 'Send It', exact: true }).count()) {
      await capture('activity-prompt')
      capturedActivity = true
    }
    await page.evaluate((value) => {
      const element = [...document.querySelectorAll('textarea')].find((candidate) => candidate.getClientRects().length > 0)
      if (!element || element.disabled) return
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set
      setter.call(element, value)
      element.dispatchEvent(new Event('input', { bubbles: true }))
    }, iterations % 2 ? 'I loved the quiet laugh we shared today.' : 'I want more tiny adventures with you.')
    if (await clickIf('Send It')) continue
    if (await clickIf('Lock Answer')) continue
  }

  if (await page.getByText('Keepsake Stop', { exact: true }).count()) {
    if (!capturedKeepsake) {
      await capture('keepsake-choice')
      capturedKeepsake = true
    }
    if (await clickIf('Buy It')) continue
    if (await clickIf('Save Hearts')) continue
  }

  if (await clickIf('Spin It')) continue
  if (await clickIf('Spin Duel Wheel')) continue
  if (await page.getByRole('button', { name: 'Host Is Spinning', exact: true }).count()) {
    await capture('blocked-duel-wheel')
    console.log('blocked: local preview cannot perform the host-only duel spin')
    break
  }

  if (await page.locator('.duel-card:visible').count()) {
    if (!capturedDuel) {
      await capture('duel')
      capturedDuel = true
    }
    if (await clickIf('Blow Kiss')) { await clickIf('Catch It'); continue }
    if (await clickIf('Start Hunt')) {
      const target = page.locator('.moving-target:visible')
      if (await target.count()) await target.click()
      continue
    }
    if (await clickIf('Ready')) {
      await page.waitForFunction(() => document.querySelector('.flip-signal')?.textContent !== 'WAIT', null, { timeout: 3000 }).catch(() => {})
      const signal = await page.locator('.flip-signal').textContent().catch(() => '')
      if (signal === 'HEART') await clickIf('Heart')
      else if (signal === 'SPARK') await clickIf('Spark')
      else await clickIf('Skip Duel')
      continue
    }
    const canHold = await page.evaluate(() => [...document.querySelectorAll('button')].some((element) => (
      element.textContent.trim() === 'Hold' && !element.disabled && element.getClientRects().length > 0
    )))
    if (canHold) {
      await page.evaluate(() => {
        const element = [...document.querySelectorAll('button')].find((candidate) => candidate.textContent.trim() === 'Hold')
        element?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
      })
      await page.waitForTimeout(1800)
      await page.evaluate(() => {
        const element = [...document.querySelectorAll('button')].find((candidate) => candidate.textContent.trim() === 'Hold')
        element?.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
      })
      await page.waitForTimeout(200)
      continue
    }
    if (await clickIf('Lock It')) continue
    if (await clickIf('Reveal It')) continue
    if (await clickIf('Skip Duel')) continue
  }

  if (await clickIf('Skip This')) continue
  await page.waitForTimeout(250)
}

const reachedFinale = Boolean(await page.getByText('Finale', { exact: true }).count())
await capture(reachedFinale ? 'finale' : 'stalled-state')
const finaleText = await visibleText()
let scrapbookText = ''
let replayText = ''
if (reachedFinale) {
  await page.evaluate(() => [...document.querySelectorAll('button')].find((element) => element.textContent.includes('Open Scrapbook'))?.click())
  await page.waitForTimeout(350)
  await capture('scrapbook')
  scrapbookText = await visibleText()
  await clickIf('Close')
  await page.waitForTimeout(600)
  const replayClicked = await clickIf('Play Another Night')
  await page.waitForFunction(() => document.body.innerText.includes('SET THE TONE'), null, { timeout: 3000 }).catch(() => {})
  console.log(`replay clicked: ${replayClicked}`)
  replayText = await visibleText()
  await capture('replay-vibe-setup')
}

await page.keyboard.press('Tab')
const focusedAfterTab = await page.evaluate(() => ({
  tag: document.activeElement?.tagName,
  text: document.activeElement?.textContent?.trim(),
  ariaLabel: document.activeElement?.getAttribute('aria-label'),
}))

fs.writeFileSync(new URL('audit-results.json', out), JSON.stringify({
  consoleMessages,
  finaleText,
  focusedAfterTab,
  iterations,
  keyboardVibeValue,
  reachedFinale,
  replayText,
  seenActivityIds: [...seenActivityIds],
  scrapbookText,
}, null, 2))

await browser.close()
