const { chromium } = await import(process.env.PLAYWRIGHT_MODULE_PATH || `${process.env.HOME}/.codex/skills/develop-web-game/scripts/node_modules/playwright/index.mjs`)
import { mkdir, writeFile } from 'node:fs/promises'
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:5173'
const authEmulator = process.env.QA_AUTH_EMULATOR_URL || 'http://127.0.0.1:9099'
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Run this verification only against a local dev server.')
const out = '.playwright-mcp/independent-night'
const captureOut = process.env.QA_SCREENSHOT_DIR || 'artifacts/night-loop'
const viewportWidths = process.env.QA_VIEWPORTS?.split(',').map(Number).filter(Number.isFinite) || [390, 393]
await mkdir(out, { recursive: true })
await mkdir(captureOut, { recursive: true })
const safeName = value => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 72)
const capture = async (page, name) => page.screenshot({ path: `${captureOut}/${safeName(name)}.jpg`, type: 'jpeg', quality: 58, fullPage: true, timeout: 30000, animations: 'disabled' })
const browser = await chromium.launch({ channel: 'chrome', headless: true })
browser.on('disconnected', () => console.log('browser closed'))
const contexts = await Promise.all(viewportWidths.map(width => browser.newContext({ viewport: { width, height: Number(process.env.QA_VIEWPORT_HEIGHT) || 844 }, reducedMotion: 'reduce' })))
const pages = await Promise.all(contexts.map(context => context.newPage()))
for (const context of contexts) await context.addInitScript(() => {
  class SyntheticMediaRecorder {
    static isTypeSupported = type => type.startsWith('audio/webm') || type.startsWith('video/webm')
    state = 'inactive'
    mimeType
    constructor(_stream, options = {}) { this.mimeType = options.mimeType || 'audio/webm;codecs=opus' }
    start() { this.state = 'recording' }
    stop() {
      this.state = 'inactive'
      this.ondataavailable?.({ data: new Blob([new Uint8Array(1024)], { type: this.mimeType }) })
      this.onstop?.()
    }
  }
  Object.defineProperty(window, 'MediaRecorder', { configurable: true, value: SyntheticMediaRecorder })
  Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: async () => new MediaStream() } })
})
const errors = []
for (const page of pages) page.setDefaultTimeout(15000)
for (const page of pages) {
  page.on('pageerror', error => { errors.push(error.message); console.error('PAGE ERROR', error.message) })
  page.on('console', message => { if (message.text().includes('[night-selection') || message.text().includes('[night-command-result]') || message.text().includes('[night-step-snapshot-stale]')) console.log('BROWSER', pages.indexOf(page), message.text()) })
}
for (const context of contexts) await context.route('https://lh3.googleusercontent.com/a/qa-*', route => route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" fill="#d8bb90"/><ellipse cx="60" cy="112" rx="48" ry="40" fill="#24454b"/><ellipse cx="60" cy="49" rx="26" ry="32" fill="#b87954"/><path d="M34 45c-9-45 63-49 54 2L73 26 36 47Z" fill="#3d2924"/></svg>' }))
await Promise.all(pages.map(page => page.goto(base)))
await Promise.all(pages.map(async page => {
  const splash = page.locator('.opening-splash')
  // Under reduced motion the brief splash can finish before goto resolves.
  await splash.waitFor({ state: 'detached' })
}))
await pages[0].getByRole('button', {name: 'Sign in', exact: true}).waitFor()
const stamp = Date.now()
const people = ['Avery', 'Rowan'].map((name, index) => ({ name, email: `pacing-${stamp}-${index}@example.test`, password: 'Local-Pacing-Only-123' }))
for (const person of people) {
  const response = await fetch(`${authEmulator}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: person.email, password: person.password, returnSecureToken: true }) })
  const user = await response.json()
  if (!user.localId) throw new Error(JSON.stringify(user))
  person.uid = user.localId
  const updated = await fetch(`${authEmulator}/identitytoolkit.googleapis.com/v1/accounts:update?key=demo-key`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer owner' }, body: JSON.stringify({ localId: user.localId, displayName: person.name, emailVerified: true, photoUrl: `https://lh3.googleusercontent.com/a/qa-${person.name}` }) })
  if (!updated.ok) throw new Error(await updated.text())
}
for (let index = 0; index < pages.length; index++) {
  const page = pages[index], person = people[index]
  await page.getByLabel('Email', { exact: true }).fill(person.email)
  await page.getByLabel('Password', { exact: true }).fill(person.password)
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  try {
    await page.getByRole('heading', { name: 'Choose your person' }).waitFor()
  } catch (error) {
    console.error('SIGN-IN FLOW FAILED', index, await page.locator('body').innerText(), errors)
    await page.screenshot({ path: `${out}/sign-in-failure-${index}.png`, fullPage: true })
    throw error
  }
}
await pages[0].getByLabel('Your person’s email').fill(people[1].email)
await pages[0].getByRole('button', { name: 'Invite your person', exact: true }).click()
await pages[0].getByRole('heading', { name: 'Waiting for your person' }).waitFor()
await pages[0].screenshot({ path: `${out}/invitation.png`, fullPage: true })
await pages[1].getByRole('button', { name: 'Accept invitation' }).click()
for (const page of pages) {
  const ceremony = page.getByRole('dialog').filter({has: page.locator('#moment-title')})
  await ceremony.waitFor()
  await ceremony.getByRole('button').last().click()
}
for (const page of pages) {
  await page.getByRole('button', { name: 'Commit', exact: true }).click()
  await page.getByRole('checkbox', { name: /understand this is permanent/i }).check()
  await page.getByRole('button', { name: 'Commit forever', exact: true }).click()
}
for (const page of pages) {
  const ceremony = page.getByRole('dialog').filter({ has: page.locator('#moment-title') })
  await ceremony.waitFor()
  await ceremony.getByRole('button').last().click()
}
for (const page of pages) await page.getByRole('button', { name: 'Choose a theme together', exact: true }).waitFor()
const chooseSharedTheme = async (page, themeName) => {
  await page.getByRole('button', { name: 'Choose a theme together', exact: true }).click()
  await page.getByRole('heading', { name: 'Collection', exact: true }).waitFor()
  try { await page.locator('.theme-grid').waitFor() } catch (error) {
    await page.screenshot({ path: `${out}/theme-picker-failure.png`, fullPage: true })
    console.error('THEME PICKER MISSING', await page.locator('.our-story-screen').innerText())
    throw error
  }
  await capture(page, 'theme-vote-picker')
  const themeCard = page.locator('.theme-grid .theme-card').filter({ hasText: themeName }).first()
  if (!await themeCard.count()) throw new Error(`Theme ${themeName} missing from Collection: ${await page.locator('.our-story-screen').innerText()}`)
  await themeCard.click()
  await capture(page, 'theme-vote-picker-after-selection')
  await page.getByRole('button', { name: 'Back to Our Story', exact: true }).click()
  await page.getByRole('button', { name: 'Close Our Story', exact: true }).click()
}
await chooseSharedTheme(pages[0], 'Garden')
await pages[0].getByRole('button', { name: 'Choose a theme together', exact: true }).waitFor()
await capture(pages[0], 'theme-vote-waiting-for-partner')
await chooseSharedTheme(pages[1], 'Garden')
for (const page of pages) await page.getByRole('button', { name: 'Begin our night', exact: true }).waitFor()
await capture(pages[0], 'theme-vote-agreed')
if (process.env.QA_THEME_ONLY === '1') {
  await browser.close()
  process.exit(0)
}
console.log('paired', people.map(person => person.uid))
await writeFile(`${out}/people.json`, JSON.stringify(people))
await pages[0].screenshot({ path: `${out}/home.png`, fullPage: true })
await capture(pages[0], 'paired-lobby')
if (process.env.QA_ARCADE_SMOKE === '1') {
  await pages[0].getByRole('button', { name: 'Open Our Arcade' }).click()
  const arcade = pages[0].getByRole('dialog', { name: 'Our Arcade' })
  await arcade.waitFor()
  const returnToArcade = async page => {
    await page.getByRole('button', { name: 'All games', exact: true }).click({ force: true })
    await page.getByRole('dialog', { name: 'Our Arcade' }).waitFor()
  }
  await capture(pages[0], 'arcade-menu')
  for (const [label, screenshot] of [
    ['My One and Only!', 'my-one-and-only'],
    ['Say Without Saying', 'say-without-saying'],
    ['Catch My Heart', 'catch-my-heart'],
    ['Radar Love', 'radar-love'],
    ['Our Little Pieces', 'our-little-pieces'],
  ]) {
    await arcade.getByRole('button', { name: label, exact: true }).click()
    await pages[0].locator('.arcade-game').waitFor()
    await pages[0].getByRole('dialog').waitFor({ state: 'visible' })
    await pages[0].locator('.couple-arcade-modal[aria-busy="false"]').waitFor()
    if (await pages[0].getByRole('alert').count()) throw new Error(`${label} failed to open: ${await pages[0].getByRole('alert').innerText()}`)
    await capture(pages[0], `arcade-${screenshot}`)
    await returnToArcade(pages[0])
  }

  // Exercise a valid interaction in each shared arcade game, then verify
  // the second browser can act on the same saved charade and Battleship state.
  await arcade.getByRole('button', { name: 'My One and Only!', exact: true }).click()
  await pages[0].locator('.uno-hand').waitFor()
  await pages[0].locator('.couple-arcade-modal[aria-busy="false"]').waitFor()
  const playableUno = pages[0].locator('.uno-card:not(:disabled)').first()
  if (await playableUno.count()) await playableUno.click()
  else {
    await pages[0].getByRole('button', { name: 'Draw a card' }).click()
    const keep = pages[0].getByRole('button', { name: 'Keep it', exact: true })
    if (await keep.count()) await keep.click()
  }
  const wildChoice = pages[0].getByRole('group', { name: 'Choose a color' })
  if (await wildChoice.count()) await wildChoice.getByRole('button').first().click()
  await pages[0].waitForFunction(() => !document.querySelector('.arcade-error'))
  await pages[0].locator('.couple-arcade-modal[aria-busy="false"]').waitFor()
  await capture(pages[0], 'arcade-my-one-and-only-played')
  await pages[1].getByRole('button', { name: 'Open Our Arcade' }).click()
  const unoArcade = pages[1].getByRole('dialog', { name: 'Our Arcade' })
  await unoArcade.getByRole('button', { name: 'My One and Only!', exact: true }).click()
  await pages[1].locator('.uno-hand').waitFor()
  await pages[1].locator('.couple-arcade-modal[aria-busy="false"]').waitFor()
  const unoStatusBeforeReload = await pages[1].locator('.arcade-turn').innerText()
  const unoHandSizeBeforeReload = await pages[1].locator('.uno-hand .uno-card').count()
  await pages[1].reload()
  await pages[1].getByRole('button', { name: 'Open Our Arcade' }).waitFor()
  await pages[1].getByRole('button', { name: 'Open Our Arcade' }).click()
  await pages[1].getByRole('dialog', { name: 'Our Arcade' }).getByRole('button', { name: 'My One and Only!', exact: true }).click()
  await pages[1].locator('.uno-hand').waitFor()
  await pages[1].locator('.couple-arcade-modal[aria-busy="false"]').waitFor()
  if (await pages[1].locator('.arcade-turn').innerText() !== unoStatusBeforeReload
    || await pages[1].locator('.uno-hand .uno-card').count() !== unoHandSizeBeforeReload) {
    throw new Error('My One and Only did not restore the same turn and hand after reload.')
  }
  await capture(pages[1], 'arcade-my-one-and-only-restored-after-reload')
  await returnToArcade(pages[1])
  await returnToArcade(pages[0])

  await arcade.getByRole('button', { name: 'Catch My Heart', exact: true }).click()
  await pages[0].locator('.fish-ranks button:not(:disabled)').first().waitFor()
  await pages[0].locator('.couple-arcade-modal[aria-busy="false"]').waitFor()
  await pages[0].locator('.fish-ranks button:not(:disabled)').first().click()
  try { await pages[0].locator('.arcade-result').waitFor({ timeout: 10000 }) } catch (error) {
    await capture(pages[0], 'arcade-catch-my-heart-failure')
    console.error('CATCH MY HEART ASK FAILED', await pages[0].locator('.arcade-game').innerText(), await pages[0].locator('[role="alert"]').allInnerTexts())
    throw error
  }
  await pages[0].locator('.couple-arcade-modal[aria-busy="false"]').waitFor()
  await capture(pages[0], 'arcade-catch-my-heart-played')
  await pages[1].getByRole('button', { name: 'Catch My Heart', exact: true }).click()
  await pages[1].locator('.fish-ranks button').first().waitFor()
  await pages[1].locator('.couple-arcade-modal[aria-busy="false"]').waitFor()
  const fishStatusBeforeReload = await pages[1].locator('.arcade-turn').innerText()
  const fishResultBeforeReload = await pages[1].locator('.arcade-result').innerText()
  await pages[1].reload()
  await pages[1].getByRole('button', { name: 'Open Our Arcade' }).waitFor()
  await pages[1].getByRole('button', { name: 'Open Our Arcade' }).click()
  await pages[1].getByRole('dialog', { name: 'Our Arcade' }).getByRole('button', { name: 'Catch My Heart', exact: true }).click()
  await pages[1].locator('.fish-ranks button').first().waitFor()
  await pages[1].locator('.couple-arcade-modal[aria-busy="false"]').waitFor()
  if (await pages[1].locator('.arcade-turn').innerText() !== fishStatusBeforeReload
    || await pages[1].locator('.arcade-result').innerText() !== fishResultBeforeReload) {
    throw new Error('Catch My Heart did not restore the same turn and last ask after reload.')
  }
  await capture(pages[1], 'arcade-catch-my-heart-restored-after-reload')
  await returnToArcade(pages[1])
  await returnToArcade(pages[0])

  await arcade.getByRole('button', { name: 'Say Without Saying', exact: true }).click()
  await pages[0].locator('.charade-prompt').waitFor()
  await pages[0].locator('.couple-arcade-modal[aria-busy="false"]').waitFor()
  const firstPrompt = await pages[0].locator('.charade-prompt').innerText()
  await pages[0].getByRole('button', { name: 'Open camera', exact: true }).click()
  await pages[0].getByRole('button', { name: 'Record clip', exact: true }).waitFor()
  await pages[0].getByRole('button', { name: 'Record clip', exact: true }).click()
  await pages[0].getByRole('button', { name: 'Stop & preview', exact: true }).click()
  await pages[0].getByRole('button', { name: 'Send clip', exact: true }).click()
  await pages[0].locator('.couple-arcade-modal[aria-busy="false"]').waitFor()
  await pages[0].getByText('Your person is getting ready to act.').waitFor()
  // Reconnect the guessing player after the actor has saved the clip. The
  // Firestore-backed phase and clip must be restored before the guess UI opens.
  await pages[1].reload()
  await pages[1].getByRole('button', { name: 'Open Our Arcade' }).waitFor()
  await pages[1].getByRole('button', { name: 'Open Our Arcade' }).click()
  const charadeArcade = pages[1].getByRole('dialog', { name: 'Our Arcade' })
  await charadeArcade.getByRole('button', { name: 'Say Without Saying', exact: true }).click()
  await pages[1].locator('.charade-choices button').first().waitFor()
  await pages[1].locator('.couple-arcade-modal[aria-busy="false"]').waitFor()
  const restoredClip = pages[1].locator('.charade-camera[controls]')
  await restoredClip.waitFor()
  const restoredClipUrl = await restoredClip.getAttribute('src')
  if (!restoredClipUrl?.startsWith('data:video/')) throw new Error('The saved charade clip did not restore after reload.')
  await capture(pages[1], 'arcade-say-without-saying-restored-clip')
  await pages[1].screenshot({ path: `${captureOut}/arcade-say-without-saying-restored-clip-viewport.jpg`, type: 'jpeg', quality: 58, fullPage: false, timeout: 30000, animations: 'disabled' })
  await pages[1].getByRole('button', { name: firstPrompt, exact: true }).click()
  await pages[1].locator('.charade-prompt').waitFor()
  const secondPrompt = await pages[1].locator('.charade-prompt').innerText()
  await pages[1].getByRole('button', { name: 'Open camera', exact: true }).click()
  await pages[1].getByRole('button', { name: 'Record clip', exact: true }).click()
  await pages[1].getByRole('button', { name: 'Stop & preview', exact: true }).click()
  await pages[1].getByRole('button', { name: 'Send clip', exact: true }).click()
  await pages[1].locator('.couple-arcade-modal[aria-busy="false"]').waitFor()
  await pages[0].locator('.charade-choices button').first().waitFor()
  await pages[0].locator('.couple-arcade-modal[aria-busy="false"]').waitFor()
  await pages[0].getByRole('button', { name: secondPrompt, exact: true }).click()
  await pages[0].locator('.couple-arcade-modal[aria-busy="false"]').waitFor()
  await pages[0].locator('.arcade-turn').filter({ hasText: /won|tie/ }).waitFor()
  await capture(pages[0], 'arcade-say-without-saying-played')
  await returnToArcade(pages[0])

  await arcade.getByRole('button', { name: 'Radar Love', exact: true }).click()
  await pages[0].getByRole('button', { name: 'Randomize fleet', exact: true }).waitFor()
  await pages[0].locator('.couple-arcade-modal[aria-busy="false"]').waitFor()
  await pages[0].getByRole('button', { name: 'Randomize fleet', exact: true }).click()
  await pages[0].locator('.couple-arcade-modal[aria-busy="false"]').waitFor()
  await pages[0].getByRole('button', { name: 'Ready', exact: true }).click()
  await pages[0].locator('.couple-arcade-modal[aria-busy="false"]').waitFor()
  await returnToArcade(pages[1])
  const radarArcade = pages[1].getByRole('dialog', { name: 'Our Arcade' })
  await radarArcade.getByRole('button', { name: 'Radar Love', exact: true }).click()
  await pages[1].getByRole('button', { name: 'Randomize fleet', exact: true }).waitFor()
  await pages[1].locator('.couple-arcade-modal[aria-busy="false"]').waitFor()
  await pages[1].getByRole('button', { name: 'Randomize fleet', exact: true }).click()
  await pages[1].locator('.couple-arcade-modal[aria-busy="false"]').waitFor()
  await pages[1].getByRole('button', { name: 'Ready', exact: true }).click()
  await pages[1].locator('.couple-arcade-modal[aria-busy="false"]').waitFor()
  await pages[0].locator('.radar-grid button:not(:disabled)').first().waitFor()
  await pages[0].locator('.radar-grid button:not(:disabled)').first().click()
  await pages[0].waitForFunction(() => document.querySelectorAll('.radar-hit, .radar-miss').length === 1)
  await pages[0].locator('.couple-arcade-modal[aria-busy="false"]').waitFor()
  await capture(pages[0], 'arcade-radar-love-played')
  const radarStatusBeforeReload = await pages[1].locator('.arcade-turn').innerText()
  const radarMarksBeforeReload = await pages[1].locator('.radar-hit, .radar-miss').count()
  await pages[1].reload()
  await pages[1].getByRole('button', { name: 'Open Our Arcade' }).waitFor()
  await pages[1].getByRole('button', { name: 'Open Our Arcade' }).click()
  await pages[1].getByRole('dialog', { name: 'Our Arcade' }).getByRole('button', { name: 'Radar Love', exact: true }).click()
  await pages[1].locator('.radar-grid').waitFor()
  await pages[1].locator('.couple-arcade-modal[aria-busy="false"]').waitFor()
  if (await pages[1].locator('.arcade-turn').innerText() !== radarStatusBeforeReload
    || await pages[1].locator('.radar-hit, .radar-miss').count() !== radarMarksBeforeReload) {
    throw new Error('Radar Love did not restore the same turn and shot after reload.')
  }
  await capture(pages[1], 'arcade-radar-love-restored-after-reload')
  await returnToArcade(pages[1])
  await returnToArcade(pages[0])

  await arcade.getByRole('button', { name: 'Our Little Pieces', exact: true }).click()
  await pages[0].locator('.jigsaw-board').waitFor()
  await pages[0].locator('.couple-arcade-modal[aria-busy="false"]').waitFor()
  const firstJigsawPiece = pages[0].locator('.jigsaw-piece').first()
  const beforeJigsawMove = await firstJigsawPiece.getAttribute('aria-label')
  await firstJigsawPiece.click()
  const rotateJigsawPiece = pages[0].getByRole('button', { name: 'Rotate ↷', exact: true })
  await rotateJigsawPiece.waitFor({ state: 'visible' })
  await pages[0].waitForFunction(() => {
    const rotate = [...document.querySelectorAll('.jigsaw-game .arcade-actions button')].find(button => button.textContent.includes('Rotate ↷'))
    return rotate && !rotate.disabled
  })
  await rotateJigsawPiece.click()
  await pages[0].locator('.couple-arcade-modal[aria-busy="false"]').waitFor()
  const afterJigsawMove = await firstJigsawPiece.getAttribute('aria-label')
  if (beforeJigsawMove === afterJigsawMove) throw new Error('Jigsaw rotate action did not change the selected piece.')
  await pages[0].locator('.couple-arcade-modal[aria-busy="false"]').waitFor()
  await capture(pages[0], 'arcade-our-little-pieces-played')
  console.log('arcade interactions passed: UNO, Go Fish, two charade turns, Radar Love shot, jigsaw rotate')

  await returnToArcade(pages[0])
  await arcade.getByRole('button', { name: 'Four Ever', exact: true }).click()
  const fourEver = pages[0].getByRole('dialog', { name: 'Four Ever' })
  await fourEver.waitFor()
  const firstColumn = pages[0].getByRole('button', { name: 'Drop piece in column 4' })
  await firstColumn.waitFor({ state: 'visible' })
  let activeFourEverPage = pages[0]
  if (!(await firstColumn.isEnabled())) {
    if (await pages[1].getByRole('button', { name: 'All games', exact: true }).count()) await returnToArcade(pages[1])
    else if (!(await pages[1].getByRole('dialog', { name: 'Our Arcade' }).count())) await pages[1].getByRole('button', { name: 'Open Our Arcade' }).click()
    const partnerArcade = pages[1].getByRole('dialog', { name: 'Our Arcade' })
    await partnerArcade.waitFor()
    await partnerArcade.getByRole('button', { name: 'Four Ever', exact: true }).click()
    activeFourEverPage = pages[1]
  }
  await activeFourEverPage.getByRole('button', { name: 'Drop piece in column 4' }).click()
  if (activeFourEverPage === pages[0]) {
    if (await pages[1].getByRole('button', { name: 'All games', exact: true }).count()) await returnToArcade(pages[1])
    else if (!(await pages[1].getByRole('dialog', { name: 'Our Arcade' }).count())) await pages[1].getByRole('button', { name: 'Open Our Arcade' }).click()
    const partnerArcade = pages[1].getByRole('dialog', { name: 'Our Arcade' })
    await partnerArcade.waitFor()
    await partnerArcade.getByRole('button', { name: 'Four Ever', exact: true }).click()
  }
  try {
    await Promise.all(pages.map(page => page.locator('.connect-four-cell.has-token').waitFor({ timeout: 5000 })))
  } catch (error) {
    for (const [index, page] of pages.entries()) {
      console.error('FOUR EVER MOVE DID NOT SYNC', index, await page.locator('body').innerText())
      await page.screenshot({ path: `${out}/four-ever-move-failure-${index}.png`, fullPage: true })
    }
    throw error
  }
  await capture(pages[0], 'four-ever-first-move')
  await capture(pages[1], 'four-ever-partner-sync')
  const secondMover = await pages[1].getByRole('button', { name: 'Drop piece in column 5' }).isEnabled() ? pages[1] : pages[0]
  await secondMover.getByRole('button', { name: 'Drop piece in column 5' }).click()
  try { await Promise.all(pages.map(page => page.waitForFunction(() => document.querySelectorAll('.connect-four-cell.has-token').length === 2))) }
  catch (error) {
    for (const [index, page] of pages.entries()) {
      console.error('FOUR EVER SECOND MOVE DID NOT SYNC', index, await page.locator('body').innerText())
      await page.screenshot({ path: `${out}/four-ever-second-move-failure-${index}.png`, fullPage: true })
    }
    throw error
  }
  await capture(pages[0], 'four-ever-second-move')
  if (errors.length) throw new Error(`Arcade browser errors: ${JSON.stringify(errors)}`)
  console.log('arcade smoke passed: five shared games opened, Four Ever moves synchronized')
  await browser.close()
  process.exit(0)
}
await pages[0].getByRole('button', { name: 'Begin our night', exact: true }).click()
try {
  await pages[1].getByRole('button', { name: 'Continue our night', exact: true }).waitFor({ timeout: 5000 })
  await pages[1].getByRole('button', { name: 'Continue our night', exact: true }).click()
} catch {
  // The second phone can still show Begin during the active-session snapshot
  // handoff. beginPairingNight reuses the already-active couple session.
  await pages[1].getByRole('button', { name: 'Begin our night', exact: true }).click()
}
for (const page of pages) {
  try { await page.getByRole('button', { name: 'Record a note', exact: true }).waitFor() } catch (error) {
    console.error('OPENING VOICE NOTE FLOW FAILED', pages.indexOf(page), await page.locator('body').innerText(), errors)
    await page.screenshot({ path: `${out}/voice-note-failure-${pages.indexOf(page)}.png`, fullPage: true })
    throw error
  }
  await capture(page, `kiss-note-player-${pages.indexOf(page) + 1}`)
  await page.evaluate(() => {
    const panel = document.querySelector('.kiss-bookend')
    const heart = document.querySelector('.kiss-bookend-art svg')
    if (panel) panel.style.animation = 'kiss-screen-pucker 4.2s cubic-bezier(.42,0,.22,1) infinite'
    if (heart) heart.style.animation = 'kiss-heart-pucker 3.2s cubic-bezier(.42,0,.22,1) infinite'
    for (const element of [panel, heart]) {
      const animation = element?.getAnimations()[0]
      if (animation) { animation.currentTime = 2900; animation.pause() }
    }
  })
  await capture(page, `kiss-pucker-player-${pages.indexOf(page) + 1}`)
  await page.getByRole('button', { name: 'Record a note', exact: true }).click()
  try { await page.getByRole('button', { name: 'Stop', exact: true }).waitFor() } catch (error) {
    console.error('RECORDING DID NOT START', pages.indexOf(page), await page.locator('body').innerText(), errors)
    await page.screenshot({ path: `${out}/voice-note-start-failure-${pages.indexOf(page)}.png`, fullPage: true })
    throw error
  }
  await page.screenshot({ path: `${captureOut}/kiss-recording-player-${pages.indexOf(page) + 1}-viewport.jpg`, type: 'jpeg', quality: 58, fullPage: false, timeout: 30000, animations: 'disabled' })
  await page.waitForTimeout(500)
  const stopButton = page.getByRole('button', { name: 'Stop', exact: true })
  if (await stopButton.isVisible().catch(() => false)) await stopButton.click()
  await page.getByRole('button', { name: 'Send kiss', exact: true }).waitFor()
  await capture(page, `kiss-preview-player-${pages.indexOf(page) + 1}`)
  await page.getByRole('button', { name: 'Send kiss', exact: true }).click()
  await page.getByRole('heading', { name: 'Kiss sent', exact: true }).waitFor()
  await capture(page, `kiss-sent-player-${pages.indexOf(page) + 1}`)
  await page.getByRole('button', { name: 'Begin our night', exact: true }).click()
}
for (const page of pages) {
  await page.waitForFunction(() => window.__atLongLastGameState?.pacing === 'alternating')
  await page.waitForFunction(() => typeof window.render_game_to_text === 'function')
  await page.locator('.first-turn-toss').waitFor()
  await capture(page, `first-turn-toss-player-${pages.indexOf(page) + 1}`)
  await page.getByRole('button', { name: 'Flip the coin to decide who rolls first' }).click()
  await page.locator('.first-turn-result').waitFor()
  await capture(page, `first-turn-result-player-${pages.indexOf(page) + 1}`)
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.locator('.board-canvas').waitFor()
}
if (process.env.QA_TURN_GATE_ONLY === '1') {
  const states = await Promise.all(pages.map(gameState))
  if (states.filter(state => state.canRoll).length !== 1 || states.some(state => state.pacing !== 'alternating')) {
    throw new Error(`The opening turn must belong to exactly one player: ${JSON.stringify(states)}`)
  }
  for (const [index, page] of pages.entries()) await capture(page, `alternating-board-ready-player-${index + 1}`)
  await writeFile(`${captureOut}/alternating-turn-order.json`, JSON.stringify(states, null, 2))
  await browser.close()
  process.exit(0)
}
if (process.env.QA_PHONE_MOVEMENT_ONLY === '1') {
  const states = await Promise.all(pages.map(gameState))
  const activeIndex = states.findIndex(state => state.canRoll)
  if (activeIndex < 0 || states.some(state => state.pacing !== 'alternating')) {
    throw new Error(`No active alternating turn is available for the phone camera check: ${JSON.stringify(states)}`)
  }
  await rollDice(pages[activeIndex], [2, 3], true)
  await browser.close()
  process.exit(0)
}
await capture(pages[0], 'board-ready')
await pages[0].screenshot({ path: `${out}/roll-control-before.png`, fullPage: true })
if (process.env.QA_CAPTURE_BOARD_PILES === '1') {
  const board = await pages[0].evaluate(() => JSON.parse(window.render_game_to_text()))
  if (board.cardPiles?.deck !== 'separate Trash and Treasure piles') {
    throw new Error(`Board card-pile state is missing or incorrect: ${JSON.stringify(board.cardPiles)}`)
  }
  if (board.cardPiles?.labels !== 'etched into the board fabric') {
    throw new Error(`Card-pile labels should be integrated into the board: ${JSON.stringify(board.cardPiles)}`)
  }
  if ([board.cardPiles.trash, board.cardPiles.treasure, board.cardPiles.discard].some(pile => pile?.outline !== 'dotted')) {
    throw new Error(`Trash, Treasure, and discard zones must each have a dotted outline: ${JSON.stringify(board.cardPiles)}`)
  }
  if (new Set([board.cardPiles.trash.color, board.cardPiles.treasure.color, board.cardPiles.discard.color]).size !== 3) {
    throw new Error(`Trash, Treasure, and discard outlines must use distinct theme shades: ${JSON.stringify(board.cardPiles)}`)
  }
  if (!board.cardPiles.coin?.separateFromPiles) {
    throw new Error(`The coin must rest separately from the draw piles: ${JSON.stringify(board.cardPiles)}`)
  }
  await pages[0].screenshot({ path: `${out}/card-pile-layout.png`, fullPage: true })
  console.log('board card-pile screenshot captured', board.cardPiles)
  await browser.close()
  process.exit(0)
}
async function gameState(page) {
  const state = await page.waitForFunction(() => window.__atLongLastGameState || false)
  return state.jsonValue()
}
async function rollDice(page, dice = [1, 1], swipe = false, retry = 0) {
  await page.bringToFront()
  for (let settle = 0; settle < 8; settle++) {
    await clearOpenPrompt(page, pages.indexOf(page))
    await page.waitForTimeout(160)
    if ((await gameState(page)).phase === 'turn' && !(await page.locator('.duel-arena-overlay').count())) break
  }
  const before = (await gameState(page)).ownRolls
  const boardBefore = JSON.parse(await page.evaluate(() => window.render_game_to_text()))
  const mover = boardBefore.activePlayerIndex
  const startPosition = boardBefore.players[mover].positionIndex
  const targetPosition = (startPosition + dice[0] + dice[1]) % boardBefore.path.segments
  console.log('roll start', before)
  await page.evaluate(values => { window.__atLongLastTestRoll = { dice: values, selectionSeed: .01 } }, dice)
  const board = page.locator('.board-canvas canvas')
  await board.waitFor()
  const bounds = await board.boundingBox()
  const center = await page.evaluate(() => JSON.parse(window.render_game_to_text()).dice.screenCenters[0])
  let start = { x: bounds.x + center.x, y: bounds.y + center.y }
  const hits = await page.evaluate(({ start, bounds }) => {
    const inside = point => point.x >= bounds.x && point.x <= bounds.x + bounds.width && point.y >= bounds.y && point.y <= bounds.y + bounds.height && point.x >= 0 && point.x <= innerWidth && point.y >= 0 && point.y <= innerHeight
    const candidates = inside(start) ? [start] : []
    for (const y of [.2, .3, .4, .5, .6, .7, .8]) for (const x of [.2, .3, .4, .5, .6, .7, .8]) candidates.push({ x: bounds.x + bounds.width * x, y: bounds.y + bounds.height * y })
    return candidates.filter(inside).map(point => ({ ...point, hit: window.__atLongLastHitDice?.(point.x, point.y) || false }))
  }, { start, bounds })
  if (!hits.some(point => point.hit)) throw new Error(`No tested point hit either die: ${JSON.stringify({ start, bounds, hits, board: JSON.parse(await page.evaluate(() => window.render_game_to_text())).dice })}`)
  if (!hits[0].hit) start = hits.find(point => point.hit)
  const inputTarget = await page.evaluate(point => {
    const element = document.elementFromPoint(point.x, point.y)
    return { tag: element?.tagName, className: String(element?.className || ''), isBoardCanvas: element?.matches('.board-canvas canvas') || false }
  }, start)
  if (!inputTarget.isBoardCanvas) throw new Error(`Touching the dice would hit another UI surface: ${JSON.stringify({ inputTarget, start })}`)
  await page.mouse.move(start.x, start.y)
  await page.mouse.down()
  if (swipe) await page.mouse.move(start.x + 22, start.y - 24, { steps: 4 })
  await page.mouse.up()
  await page.waitForTimeout(220)
  await capture(page, `dice-tumble-player-${pages.indexOf(page) + 1}-${before + 1}`)
  console.log('roll gesture sent', await page.evaluate(() => ({ canRoll: window.__atLongLastGameState?.canRoll, ownRolls: window.__atLongLastGameState?.ownRolls })))
  try { await page.waitForFunction(previous => window.__atLongLastGameState?.ownRolls === previous + 1, before, { timeout: 30000 }) } catch (error) {
    const blocked = await gameState(page)
    if (blocked.phase === 'duel' && retry < 12) {
      console.log('closing open comparison before retrying the roll', pages.indexOf(page), blocked.round)
      await clearOpenPrompt(page, pages.indexOf(page))
      return rollDice(page, dice, swipe, retry + 1)
    }
    console.log('ROLL FAILED', blocked, await page.locator('body').innerText(), errors, await page.evaluate(() => ({ board: window.render_game_to_text?.(), read: window.__atLongLastNightRead, steps: window.__atLongLastNightSteps, fixture: window.__atLongLastTestRoll })))
    throw error
  }
  console.log('saved roll stage', pages.indexOf(page), JSON.stringify(await gameState(page)))
  try { await page.locator('.roll-ack-tray button').waitFor() } catch (error) {
    console.error('DICE RESULT ACK MISSING', await gameState(page), await page.evaluate(() => window.__atLongLastRollTrace), await page.evaluate(() => window.__atLongLastNightSteps), await page.locator('body').innerText(), await page.evaluate(() => window.render_game_to_text?.()))
    await capture(page, `dice-ack-failure-player-${pages.indexOf(page) + 1}`)
    throw error
  }
  await capture(page, `dice-result-player-${pages.indexOf(page) + 1}-${before + 1}`)
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  try {
    await page.waitForFunction(({ mover, targetPosition }) => {
      const state = JSON.parse(window.render_game_to_text())
      return state.pieceMovement?.playerIndex === mover || state.players[mover].positionIndex === targetPosition
    }, { mover, targetPosition }, { timeout: 10000 })
    await capture(page, `phone-piece-follow-live-player-${pages.indexOf(page) + 1}`)
    await page.waitForFunction(({ mover, targetPosition }) => {
      const state = JSON.parse(window.render_game_to_text())
      return state.pieceMovement === null && state.players[mover].positionIndex === targetPosition
    }, { mover, targetPosition }, { timeout: 10000 })
  } catch (error) {
    console.error('PIECE DID NOT LAND ONE SPACE AT A TIME', await page.evaluate(() => window.render_game_to_text?.()))
    throw error
  }
  await page.waitForTimeout(360)
  await capture(page, `piece-hopping-player-${pages.indexOf(page) + 1}-${before + 1}`)
  await page.waitForTimeout(1650 + (dice[0] + dice[1]) * 235)
  await page.waitForFunction(() => document.querySelector('.coin-touch-hint, .landing-ack-tray'))
  await capture(page, `landing-player-${pages.indexOf(page) + 1}-${before + 1}`)
  const boardDice = await page.evaluate(() => window.render_game_to_text?.())
  if (!boardDice || JSON.stringify(JSON.parse(boardDice).dice.values) !== JSON.stringify(dice)) {
    throw new Error(`Board dice did not settle to ${JSON.stringify(dice)}: ${boardDice || 'board renderer unavailable'}`)
  }
}
async function sealReflection(page, text, guess) {
  const type = (await gameState(page)).activity.id
  await capture(page, `activity-${type}-player-${pages.indexOf(page) + 1}`)
  if (type === 'the-vault') {
    await page.locator('.vault-entry').fill(text)
    await page.getByRole('button', { name: 'Seal It In The Vault', exact: true }).click()
    await page.waitForFunction(type => {
      const state = window.__atLongLastGameState
      return state && !state.activity && !state.available.some(task => task.kind === 'activity' && task.type === type)
    }, type)
    return
  }
  if (type === 'photo-flashback') {
    if ((await gameState(page)).activity.stage === 'photo') {
      await page.locator('.photo-picker input[type="file"]').setInputFiles({
        name: 'shared-flashback.png',
        mimeType: 'image/png',
        buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j0ioAAAAASUVORK5CYII=', 'base64'),
      })
      await page.locator('.photo-picker.selected img').waitFor()
    }
    await page.getByLabel('Photo caption', { exact: true }).fill(text)
    await page.getByRole('button', { name: 'Seal My Caption', exact: true }).click()
    await page.waitForFunction(type => {
      const state = window.__atLongLastGameState
      return state && !state.activity && !state.available.some(task => task.kind === 'activity' && task.type === type)
    }, type)
    return
  }
  const answer = page.getByLabel('Your Answer', { exact: true })
  console.log('fill answer'); await answer.fill(text); console.log('answer filled')
  await page.getByRole('button', { name: 'NEXT', exact: true }).click(); console.log('flipped')
  await capture(page, `activity-${type}-guess-player-${pages.indexOf(page) + 1}`)
  await page.locator('#activity-guess-input').fill(guess); console.log('guess filled')
  await page.getByRole('button', { name: /Seal My Turn|Seal & Reveal/ }).click(); console.log('sealed')
  await page.waitForFunction(type => { const state = window.__atLongLastGameState; return state && !state.activity && !state.available.some(task => task.kind === 'activity' && task.type === type) }, type)
}
async function returnDiceToCup(page, index) {
  const canvas = page.locator('.board-canvas canvas')
  let bounds = await canvas.boundingBox()
  for (let attempt = 0; !bounds && attempt < 8; attempt += 1) {
    await page.waitForTimeout(100)
    bounds = await canvas.boundingBox()
  }
  const board = JSON.parse(await page.evaluate(() => window.render_game_to_text()))
  const hits = await page.evaluate(({ bounds }) => {
    if (!bounds || typeof window.__atLongLastHitDice !== 'function') return []
    const candidates = []
    for (let y = bounds.y; y < bounds.y + bounds.height; y += 8) for (let x = bounds.x; x < bounds.x + bounds.width; x += 8) {
      if (x >= 0 && x <= innerWidth && y >= 0 && y <= innerHeight && window.__atLongLastHitDice(x, y)) candidates.push({ x, y })
    }
    return candidates
  }, { bounds })
  if (!hits.length) throw new Error(`Could not locate the dice to return them to the cup for player ${index + 1}: ${JSON.stringify({ bounds, state: await gameState(page), board: await page.evaluate(() => JSON.parse(window.render_game_to_text())) })}`)
  const center = board.dice.screenCenters[0]
  const target = { x: bounds.x + center.x, y: bounds.y + center.y }
  const hit = hits.sort((a, b) => Math.hypot(a.x - target.x, a.y - target.y) - Math.hypot(b.x - target.x, b.y - target.y))[0]
  await page.mouse.click(hit.x, hit.y)
  const stepId = `roll-${(await gameState(page)).ownRolls}-${index}`
  try {
    await page.waitForFunction(id => window.__atLongLastNightSteps?.find(step => step.id === id)?.diceReturned === true, stepId)
  } catch (error) {
    console.error('DICE RETURN DID NOT SAVE', JSON.stringify({ stepId, hit, state: await gameState(page), steps: await page.evaluate(() => window.__atLongLastNightSteps), dice: board.dice, body: (await page.locator('body').innerText()).slice(-800) }))
    throw error
  }
}

async function finishTurn(page, index, { leaveDiceOut = false } = {}) {
  const state = await gameState(page)
  if (state.readyToFinish) return
  const stepId = `roll-${state.ownRolls}-${index}`
  if (!leaveDiceOut) await returnDiceToCup(page, index)
  const endTurn = page.getByRole('button', { name: 'End turn', exact: true })
  await page.waitForFunction(() => {
    const button = document.querySelector('.turn-pass-switch')
    return button && !button.disabled
  })
  await endTurn.click()
  if (leaveDiceOut) {
    await page.locator('.cup-penalty-overlay').waitFor()
    await page.locator('.moment-card-draw.is-revealed').waitFor()
    await capture(page, `dice-left-out-trash-penalty-player-${index + 1}`)
    await page.getByRole('button', { name: 'Continue', exact: true }).last().click()
  }
  try {
    await page.waitForFunction(({ stepId }) => {
      const step = window.__atLongLastNightSteps?.find(item => item.id === stepId)
      const board = JSON.parse(window.render_game_to_text())
      return step?.turnEnded === true && board.pieceMovement == null
    }, { stepId }, { timeout: 12000 })
  } catch (error) {
    console.error('TURN DID NOT END', JSON.stringify({ stepId, state: await gameState(page), steps: await page.evaluate(() => window.__atLongLastNightSteps), board: await page.evaluate(() => JSON.parse(window.render_game_to_text())), body: (await page.locator('body').innerText()).slice(-1200) }))
    throw error
  }
  if (leaveDiceOut) await capture(page, `dice-flush-resolved-player-${index + 1}`)
  await page.waitForFunction(playerIndex => {
    const state = window.__atLongLastGameState
    return state?.activeTurnPlayer !== playerIndex || state?.readyToReveal
  }, index, { timeout: 15000 })
}

async function finishLanding(page, index, options = {}) {
  await page.bringToFront()
  if (await page.locator('.landing-ack-tray').count()) {
    await capture(page, `landing-ack-player-${index + 1}`)
    await page.getByRole('button', { name: 'Continue', exact: true }).last().click()
    await page.locator('.landing-ack-tray').waitFor({ state: 'detached' })
  } else if (await page.locator('.coin-touch-hint').count()) {
    const canvas = page.locator('.board-canvas canvas')
    const bounds = await canvas.boundingBox()
    const hits = await page.evaluate(({ bounds }) => {
      const points = []
      if (!bounds || typeof window.__atLongLastHitCoin !== 'function') return { points, helper: typeof window.__atLongLastHitCoin, bounds }
      for (let y = bounds.y; y < bounds.y + bounds.height; y += 8) for (let x = bounds.x; x < bounds.x + bounds.width; x += 8) {
        const point = { x, y }
        if (window.__atLongLastHitCoin?.(point.x, point.y)) points.push(point)
      }
      return { points, helper: typeof window.__atLongLastHitCoin, bounds }
    }, { bounds })
    if (!hits.points.length) throw new Error(`Could not locate the interactive coin after landing: ${JSON.stringify({helper:hits.helper,bounds:hits.bounds,board:await gameState(page)})}`)
    const start = hits.points.reduce((center, point) => ({ x: center.x + point.x / hits.points.length, y: center.y + point.y / hits.points.length }), { x: 0, y: 0 })
    await page.mouse.move(start.x, start.y)
    await page.waitForTimeout(160)
    await page.mouse.down()
    await page.mouse.move(start.x + 46, start.y - 52, { steps: 12 })
    await page.mouse.up()
    await page.waitForTimeout(260)
    await capture(page, `coin-flip-player-${index + 1}`)
    await page.locator('.moment-card-draw').waitFor()
    await capture(page, `card-back-player-${index + 1}`)
    await page.locator('.moment-card-draw.is-revealed').waitFor()
    await capture(page, `card-revealed-player-${index + 1}`)
    await page.getByRole('button', { name: 'Continue', exact: true }).last().click()
    await page.locator('.moment-card-draw').waitFor({ state: 'detached' })
    await capture(page, `card-effect-resolved-player-${index + 1}`)
  } else if (await page.locator('.moment-card-draw').count()) {
    await page.locator('.moment-card-draw.is-revealed').waitFor()
    await capture(page, `card-revealed-player-${index + 1}`)
    await page.getByRole('button', { name: 'Continue', exact: true }).last().click()
    await page.locator('.moment-card-draw').waitFor({ state: 'detached' })
  }
  try {
    await page.waitForFunction(() => {
      const state = window.__atLongLastGameState
      const board = JSON.parse(window.render_game_to_text())
      return state && !state.rolling && !state.rollStage && board.pieceMovement === null
    }, { timeout: 30000 })
  } catch (error) {
    console.error('LANDING DID NOT SETTLE', JSON.stringify({ state: await gameState(page), trace: await page.evaluate(() => window.__atLongLastRollTrace), steps: await page.evaluate(() => window.__atLongLastNightSteps), board: await page.evaluate(() => JSON.parse(window.render_game_to_text())) }))
    throw error
  }
  let state = await gameState(page)
  if (state.phase === 'turn') {
    const landing = state.available.find(step => step.id.startsWith(`roll-${state.ownRolls}-${state.playerIndex}`))
    if (landing?.kind === 'keepsake') {
      const collectAction = page.locator('.night-action-list button').filter({ hasText: 'Collect mystery card' })
      await collectAction.waitFor({ state: 'visible' })
      try { await page.waitForFunction(() => {
        const action = [...document.querySelectorAll('.night-action-list button')].find(button => button.textContent.includes('Collect mystery card'))
        return action && !action.disabled
      }) } catch (error) {
        console.error('KEEPSAKE ACTION NEVER ENABLED', await gameState(page), await page.locator('.night-action-list').evaluate(element => element.outerHTML), await page.evaluate(() => ({ board: window.render_game_to_text?.(), steps: window.__atLongLastNightSteps })))
        throw error
      }
      await collectAction.click()
      try {
        await page.waitForFunction(stepId => window.__atLongLastGameState?.phase === 'keepsake' && window.__atLongLastGameState?.selectedId === stepId, landing.id)
      } catch (error) {
        await capture(page, `keepsake-selection-failure-player-${index + 1}`)
        console.error('KEEPSAKE SELECTION DID NOT STICK', JSON.stringify(await gameState(page)), await page.evaluate(() => window.__atLongLastNightSteps), await page.locator('body').innerText())
        throw error
      }
      state = await gameState(page)
    } else if (landing?.kind === 'activity') {
      await page.locator(`[data-night-step="${landing.id}"]`).click()
      state = await gameState(page)
    }
  }
  if (state.phase === 'activity') await sealReflection(page, `${people[index].name} private answer ${state.ownRolls}`, `${people[index].name} prediction`)
  else if (state.phase === 'keepsake') {
    await page.locator('.mystery-card-stage').waitFor({ timeout: 5000 }).catch(async () => {
      console.error('KEEPSAKE UI DID NOT OPEN', JSON.stringify(await gameState(page)), await page.locator('body').innerText())
    })
    if (await page.locator('.mystery-card-stage').count()) {
      try { await page.locator('.mystery-collect-btn:not(:disabled)').waitFor({ timeout: 15000 }) } catch (error) {
        await capture(page, `keepsake-stuck-player-${index + 1}`)
        console.error('KEEPSAKE REVEAL DID NOT ENABLE COLLECT', await page.locator('body').innerText(), await page.evaluate(() => ({ hidden: document.hidden, card: document.querySelector('.keepsake-card')?.className, stage: document.querySelector('.mystery-card-stage')?.className, button: document.querySelector('.mystery-collect-btn')?.outerHTML, animations: document.querySelector('.keepsake-card')?.getAnimations().map(animation => ({ playState: animation.playState, currentTime: animation.currentTime })) })))
        throw error
      }
      await page.locator('.mystery-collect-btn').click()
    }
    await page.locator('.mystery-card-stage').waitFor({ state: 'detached' })
  }
  await finishTurn(page, index, options)
}
async function finishDuel(page, type) {
  await capture(page, `mini-game-${type}-player-${pages.indexOf(page) + 1}`)
  if (await page.getByRole('button', { name: 'Reveal', exact: true }).count()) {
    await page.getByRole('button', { name: 'Reveal', exact: true }).click()
  } else if (type === 'kiss-courier') {
    await page.getByRole('button', { name: 'Blow Kiss', exact: true }).click()
    await page.getByRole('button', { name: 'Catch It', exact: true }).click()
  } else if (type === 'doodle-duel-memory' || type === 'portrait-panic-directed') {
    const guide = page.locator('[aria-label="Choose three drawing cues"]')
    if (await guide.count()) {
      const cues = guide.locator('button')
      for (let index = 0; index < 3; index++) await cues.nth(index).click()
      await page.getByRole('button', { name: 'Send cues', exact: true }).click()
      return
    }
    const canvas = page.getByLabel('Drawing canvas', { exact: true })
    const bounds = await canvas.boundingBox()
    if (!bounds) throw new Error(`Drawing canvas missing for ${type}`)
    await page.mouse.move(bounds.x + bounds.width * .35, bounds.y + bounds.height * .5)
    await page.mouse.down()
    await page.mouse.move(bounds.x + bounds.width * .65, bounds.y + bounds.height * .35, { steps: 5 })
    await page.mouse.move(bounds.x + bounds.width * .55, bounds.y + bounds.height * .7, { steps: 4 })
    await page.mouse.up()
    // The active-player portrait pulse can subtly transform the full duel card,
    // which keeps Playwright's stability heuristic waiting even though the
    // button is visible and tappable. Force this one touch after the drawing.
    await page.getByRole('button', { name: 'Done', exact: true }).click({ force: true })
  } else if (type === 'letterpress-one-word') {
    await page.locator('#letterpress-words').fill('love grows each day')
    await page.getByRole('button', { name: 'Lock words', exact: true }).click()
  } else if (type === 'our-next-line') {
    const words = ['we', 'keep', 'finding', 'little', 'reasons', 'to', 'choose', 'us']
    for (const word of words) {
      await page.locator('#next-line-word').fill(word)
      await page.getByRole('button', { name: 'Add word', exact: true }).click()
    }
    await page.getByRole('button', { name: 'Seal line', exact: true }).click()
  } else if (type === 'love-in-the-blanks') {
    for (let index = 0; index < 12 && await page.locator('.mad-lib-choice').count(); index++) {
      await page.locator('.mad-lib-choice').first().click()
    }
  } else if (type === 'constellation-home') {
    const values = page.locator('[aria-label="Sentimental values"] button')
    for (let index = 0; index < 5; index++) await values.nth(index).click()
    await page.getByRole('button', { name: 'Reveal tonight', exact: true }).click()
  } else if (type === 'gratitude-duel') {
    await page.locator('#gratitude-response').fill('I appreciate your kindness every day.')
    await page.getByRole('button', { name: 'Save', exact: true }).click()
  } else if (type === 'sync-breath') {
    await page.locator('.calm-practice-option').filter({ hasText: 'Ground' }).click()
    await page.getByText('Name 3 things you see', { exact: true }).waitFor()
    await page.getByRole('button', { name: 'Next', exact: true }).click()
    await page.getByText('Notice 2 things you feel', { exact: true }).waitFor()
    await page.getByRole('button', { name: 'Next', exact: true }).click()
    await page.getByText('Listen for 1 sound', { exact: true }).waitFor()
    await page.getByRole('button', { name: 'Complete pause', exact: true }).click()
  } else if (type === 'wavelength-duel') {
    for (let index = 0; index < 10; index++) {
      const choices = page.locator('.connection-choice-grid [role="radio"]')
      if (await choices.count()) await choices.first().click()
      else await page.locator('.wavelength-scale-stage input').click()
      const lock = page.getByRole('button', { name: /Lock My Answer|Lock My Guess|Seal My Guesses/ })
      await lock.click()
    }
  } else if (type === 'reaction-heart') {
    await page.getByRole('button', { name: 'Ready', exact: true }).click()
    await page.getByRole('button', { name: 'Heart', exact: true }).waitFor()
    await page.waitForTimeout(1300)
    await page.getByRole('button', { name: 'Heart', exact: true }).click()
  } else {
    throw new Error(`No full-night playtest driver for duel ${type}`)
  }
}
async function clearOpenPrompt(page, index) {
  for (let attempt = 0; attempt < 16; attempt++) {
    const duelModal = page.locator('.duel-arena-overlay')
    if (await duelModal.count()) {
      const label = await duelModal.locator('.duel-card h3').first().innerText()
      const type = await page.evaluate(async name => Object.entries((await import('/src/features/session/duelRegistry.jsx')).duelRegistry).find(([, duel]) => duel.label === name)?.[0], label)
      if (!type) throw new Error(`Could not map open comparison title: ${label}`)
      console.log('resolving open comparison', index, type)
      await finishDuel(page, type)
      await page.waitForFunction(() => !document.querySelector('.duel-arena-overlay'))
      continue
    }
    const state = await gameState(page)
    if (state.phase === 'activity') {
      await sealReflection(page, `${people[index].name} private answer`, `${people[index].name} prediction`)
    } else if (state.phase === 'keepsake') {
      await page.getByRole('button', { name: 'Tap Card to Collect', exact: true }).click()
      await page.locator('.mystery-card-stage').waitFor({ state: 'detached' })
    } else if (state.phase === 'duel') {
      const label = await page.locator('.duel-card h3').first().innerText()
      const type = await page.evaluate(async name => Object.entries((await import('/src/features/session/duelRegistry.jsx')).duelRegistry).find(([, duel]) => duel.label === name)?.[0], label)
      if (!type) throw new Error(`Could not map open comparison title: ${label}`)
      console.log('resolving selected comparison', index, type, 'visible=', await page.locator('.duel-arena-overlay').isVisible())
      await finishDuel(page, type)
      await page.waitForFunction(() => window.__atLongLastGameState?.phase === 'turn')
      await page.locator('.duel-arena-overlay').waitFor({ state: 'detached' })
      console.log('selected comparison closed', index, type)
    } else if (state.phase === 'turn') {
      const pendingActivity = state.available.find(task => task.kind === 'activity')
      if (pendingActivity) {
        console.log('answering partner activity before rolling', index, pendingActivity.id, pendingActivity.type)
        await page.locator(`[data-night-step="${pendingActivity.id}"]`).click()
        await page.waitForFunction(() => window.__atLongLastGameState?.phase === 'activity')
        await sealReflection(page, `${people[index].name} private answer`, `${people[index].name} prediction`)
        continue
      }
      if (await page.locator('.duel-arena-overlay').count()) {
        // Firestore state and the locally selected overlay can settle on
        // adjacent frames. Wait for the selection to clear before touching the
        // board so a late render cannot sit above the dice gesture.
        await page.waitForTimeout(180)
        continue
      }
    } else return
  }
  if ((await gameState(page)).phase !== 'turn') throw new Error(`Could not close open prompt: ${JSON.stringify(await gameState(page))}`)
}
const firstPlayerIndex = (await gameState(pages[0])).canRoll ? 0 : 1
const secondPlayerIndex = 1 - firstPlayerIndex
await rollDice(pages[firstPlayerIndex], [3,1], true)
console.log('first landing', await gameState(pages[firstPlayerIndex]))
await pages[firstPlayerIndex].screenshot({ path: `${out}/first-card.png`, fullPage: true })
if (process.env.QA_MOVEMENT_SMOKE === '1') {
  await finishLanding(pages[firstPlayerIndex], firstPlayerIndex, { leaveDiceOut: true })
  await rollDice(pages[secondPlayerIndex], [2,2], true)
  await finishLanding(pages[secondPlayerIndex], secondPlayerIndex)
  const movementStates = await Promise.all(pages.map(gameState))
  const landedPositions = await Promise.all(pages.map(async page => {
    const state = await gameState(page)
    const board = JSON.parse(await page.evaluate(() => window.render_game_to_text()))
    return board.players[state.playerIndex].positionIndex
  }))
  if (movementStates.some(state => state.ownRolls !== 1 || state.activeTurnPlayer !== firstPlayerIndex || state.readyToReveal || state.available.length)) {
    throw new Error(`Both players should independently finish their card effects and return to a roll-ready state: ${JSON.stringify({ movementStates, landedPositions })}`)
  }
  await Promise.all(pages.map((page, index) => page.screenshot({ path: `${out}/movement-player-${index + 1}.png`, fullPage: true })))
  await pages[0].screenshot({ path: `${out}/board-scaled-spaces-and-piles.png`, fullPage: true })
  await writeFile(`${out}/movement-smoke.json`, JSON.stringify(movementStates, null, 2))
  console.log('two-player movement smoke passed', movementStates.map((state, index) => ({ playerIndex: state.playerIndex, ownRolls: state.ownRolls, landedPosition: landedPositions[index] })))
  await browser.close()
  process.exit(0)
}
await finishLanding(pages[firstPlayerIndex], firstPlayerIndex, { leaveDiceOut: true })
await pages[secondPlayerIndex].waitForFunction(() => window.__atLongLastGameState?.canRoll === true)
await rollDice(pages[secondPlayerIndex], [2,2], true)
await finishLanding(pages[secondPlayerIndex], secondPlayerIndex)
if ((await gameState(pages[firstPlayerIndex])).ownRolls !== 1 || (await gameState(pages[secondPlayerIndex])).ownRolls !== 1) throw new Error('The opening turns did not alternate between players')
await pages[firstPlayerIndex].screenshot({ path: `${out}/both-first-turns-complete.png`, fullPage: true })
await pages[firstPlayerIndex].reload()
await pages[firstPlayerIndex].waitForFunction(() => window.__atLongLastGameState?.ownRolls === 1)
if (await pages[firstPlayerIndex].getByRole('heading', { name: 'Kiss sent', exact: true }).count()) {
  await capture(pages[firstPlayerIndex], 'kiss-resumed-after-reload')
  await pages[firstPlayerIndex].getByRole('button', { name: 'Begin our night', exact: true }).click()
}
if ((await pages[secondPlayerIndex].locator('body').innerText()).includes(`${people[firstPlayerIndex].name} private answer`)) throw new Error('A private answer leaked before the finale')
await pages[secondPlayerIndex].waitForFunction(() => window.__atLongLastGameState?.ownRolls === 1)
for (let round = 2; round <= 8; round++) {
  for (const index of [firstPlayerIndex, secondPlayerIndex]) {
    const page = pages[index]
    await clearOpenPrompt(page, index)
    try {
      await page.waitForFunction(() => window.__atLongLastGameState?.canRoll === true, undefined, { timeout: 30000 })
    } catch (error) {
      console.error('NEXT ROLL BLOCKED', JSON.stringify({ round, index, states: await Promise.all(pages.map(gameState)), steps: await Promise.all(pages.map(page => page.evaluate(() => window.__atLongLastNightSteps))), text: await Promise.all(pages.map(page => page.locator('body').innerText())) }))
      await page.screenshot({ path: `${out}/next-roll-blocked-${round}-player-${index + 1}.png`, fullPage: true })
      throw error
    }
    await rollDice(page)
    await finishLanding(page, index)
    console.log('turn finished', round, index, await gameState(page))
  }
}
// Finish every player's activity and comparison, in their own browser context.
for (;;) {
  let acted = false
  for (const index of [firstPlayerIndex, secondPlayerIndex]) {
    const page = pages[index]
    await clearOpenPrompt(page, index)
    const task = (await gameState(page)).available.find(item => item.kind === 'activity' || item.kind === 'duel')
    if (!task) continue
    acted = true
    if (task.kind === 'activity') {
      await page.locator(`[data-night-step="${task.id}"]`).click()
      await sealReflection(page, `${people[index].name} private catch-up`, `${people[index].name} prediction`)
    } else {
      await page.locator(`[data-night-step="${task.id}"]`).click()
      await finishDuel(page, task.type)
      await page.waitForFunction(() => window.__atLongLastGameState?.phase === 'turn')
    }
  }
  if (!acted) break
}
const finalStates = await Promise.all(pages.map(gameState))
if (finalStates.some(state => state.ownRolls !== 8 || state.comparisons < 8 || state.comparisons !== finalStates[0].comparisons || !state.readyToReveal)) {
  const nightSteps = await Promise.all(pages.map(page => page.evaluate(() => window.__atLongLastNightSteps || [])))
  throw new Error(`Expected eight rolls each and a ready reveal with matching comparisons: ${JSON.stringify({ finalStates, nightSteps })}`)
}
if (finalStates.some(state => !state.readyToFinish)) throw new Error(`All reveal interactions should be complete before the coda: ${JSON.stringify(finalStates)}`)
console.log('independent progress saved', finalStates)
for (const page of pages) {
  await page.getByRole('button', { name: 'Catch their kiss', exact: true }).click()
  await page.getByRole('button', { name: 'Catch', exact: true }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).waitFor()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
}
await pages[firstPlayerIndex].getByRole('button', { name: 'Open tonight’s reveals', exact: true }).click()
for (const [index, page] of pages.entries()) {
  try { await page.locator('.finale-headline').waitFor({ timeout: 20000 }) } catch (error) {
    console.error('FINALE DID NOT OPEN', index, await gameState(page), await page.locator('body').innerText(), errors)
    await page.screenshot({ path: `${out}/finale-failure-${index}.png`, fullPage: true })
    throw error
  }
}
await pages[0].screenshot({ path: `${out}/boards-finished.png`, fullPage: true })
await writeFile(`${out}/people.json`, JSON.stringify(people))
await writeFile(`${out}/home.txt`, await pages[0].locator('body').innerText())
await writeFile(`${out}/errors.json`, JSON.stringify(errors))
if (errors.length) throw new Error(`Browser errors: ${JSON.stringify(errors)}`)
console.log('errors', errors)
await browser.close()
