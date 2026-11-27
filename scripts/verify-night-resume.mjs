import { readFile, mkdir } from 'node:fs/promises'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE_PATH || `${process.env.HOME}/.codex/skills/develop-web-game/scripts/node_modules/playwright/index.mjs`)

const base = process.env.QA_BASE_URL || 'http://127.0.0.1:5173'
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Run this verification only against a local dev server.')
const people = JSON.parse(await readFile(process.env.QA_PEOPLE_FILE || '/tmp/at-long-last-night-final-debug/people.json', 'utf8'))
const out = process.env.QA_SCREENSHOT_DIR || '/tmp/at-long-last-night-resume'
await mkdir(out, { recursive: true })
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
const page = await context.newPage()
page.setDefaultTimeout(20000)
const errors = []
page.on('pageerror', error => errors.push(error.message))
try {
  await page.goto(base)
  await page.locator('.opening-splash').waitFor({ state: 'detached' })
  await page.getByLabel('Email', { exact: true }).fill(people[0].email)
  await page.getByLabel('Password', { exact: true }).fill(people[0].password)
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await page.getByRole('button', { name: 'Our Story', exact: true }).waitFor()
  const ceremony = page.locator('.moment-celebration')
  await ceremony.waitFor({ timeout: 2500 }).catch(() => {})
  if (await ceremony.count()) await ceremony.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByRole('button', { name: 'Our Story', exact: true }).click()
  await page.getByRole('button', { name: 'Scrapbook', exact: true }).click()
  await page.locator('.scrapbook-entry.entry-finale').waitFor()
  await page.screenshot({ path: `${out}/completed-night-scrapbook.png`, fullPage: true })
  await page.getByRole('button', { name: 'Back to Our Story' }).click()
  await page.getByRole('button', { name: 'Collection', exact: true }).click()
  await page.getByRole('heading', { name: 'Collection', exact: true }).waitFor()
  await page.screenshot({ path: `${out}/collection-after-night.png`, fullPage: true })
  await page.getByRole('button', { name: 'Back to Our Story' }).click()
  await page.getByRole('button', { name: 'Close Our Story' }).click()
  if (process.env.QA_INSPECT_ONLY !== '1') {
    await page.getByRole('button', { name: 'Begin our night', exact: true }).click()
    await page.waitForFunction(() => window.__atLongLastGameState?.phase === 'turn')
    await page.screenshot({ path: `${out}/second-night-ready.png`, fullPage: true })
  }
  if (errors.length) throw new Error(`Page errors: ${JSON.stringify(errors)}`)
  console.log(process.env.QA_INSPECT_ONLY === '1' ? 'archived scrapbook and collection passed' : 'archived scrapbook, collection, and second-night start passed')
} catch (error) {
  await page.screenshot({ path: `${out}/failure.png`, fullPage: true })
  console.error((await page.locator('body').innerText()).slice(-3000))
  throw error
} finally {
  await browser.close()
}
