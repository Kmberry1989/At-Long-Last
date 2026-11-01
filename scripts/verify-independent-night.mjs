const { chromium } = await import(process.env.PLAYWRIGHT_MODULE_PATH || `${process.env.HOME}/.codex/skills/develop-web-game/scripts/node_modules/playwright/index.mjs`)
import { mkdir, writeFile } from 'node:fs/promises'
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:5173'
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Run this verification only against a local dev server.')
const out = '.playwright-mcp/independent-night'
await mkdir(out, { recursive: true })
const browser = await chromium.launch({ channel: 'chrome', headless: true })
browser.on('disconnected', () => console.log('browser closed'))
const contexts = await Promise.all([390, 393].map(width => browser.newContext({ viewport: { width, height: 844 }, reducedMotion: 'reduce' })))
const pages = await Promise.all(contexts.map(context => context.newPage()))
const errors = []
for (const page of pages) page.setDefaultTimeout(15000)
for (const page of pages) page.on('pageerror', error => { errors.push(error.message); console.error('PAGE ERROR', error.message) })
for (const context of contexts) await context.route('https://lh3.googleusercontent.com/a/qa-*', route => route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" fill="#d8bb90"/><ellipse cx="60" cy="112" rx="48" ry="40" fill="#24454b"/><ellipse cx="60" cy="49" rx="26" ry="32" fill="#b87954"/><path d="M34 45c-9-45 63-49 54 2L73 26 36 47Z" fill="#3d2924"/></svg>' }))
await Promise.all(pages.map(page => page.goto(base)))
await pages[0].getByRole('button', {name: 'Sign in', exact: true}).waitFor()
const stamp = Date.now()
const people = ['Avery', 'Rowan'].map((name, index) => ({ name, email: `pacing-${stamp}-${index}@example.test`, password: 'Local-Pacing-Only-123' }))
for (const person of people) {
  const response = await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: person.email, password: person.password, returnSecureToken: true }) })
  const user = await response.json()
  if (!user.localId) throw new Error(JSON.stringify(user))
  person.uid = user.localId
  const updated = await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:update?key=demo-key', { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer owner' }, body: JSON.stringify({ localId: user.localId, displayName: person.name, emailVerified: true, photoUrl: `https://lh3.googleusercontent.com/a/qa-${person.name}` }) })
  if (!updated.ok) throw new Error(await updated.text())
}
for (let index = 0; index < pages.length; index++) {
  const page = pages[index], person = people[index]
  await page.getByLabel('Email', { exact: true }).fill(person.email)
  await page.getByLabel('Password', { exact: true }).fill(person.password)
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await page.getByRole('heading', { name: 'Choose your person' }).waitFor()
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
  await page.getByRole('button', { name: 'New night', exact: true }).waitFor()
}
console.log('paired', people.map(person => person.uid))
await writeFile(`${out}/people.json`, JSON.stringify(people))
await pages[0].screenshot({ path: `${out}/home.png`, fullPage: true })
// Press and release must be distinct from selected state.
await pages[0].emulateMedia({ reducedMotion: 'no-preference' })
const quick = pages[0].getByRole('button', { name: 'Quick', exact: true })
await quick.scrollIntoViewIfNeeded()
const box = await quick.boundingBox()
await pages[0].mouse.move(box.x + box.width / 2, box.y + box.height / 2)
await pages[0].mouse.down()
await pages[0].waitForTimeout(100)
const pressed = await quick.evaluate(node => getComputedStyle(node).scale)
if (Number(pressed) >= 1) throw new Error(`No visible press feedback: ${pressed}`)
await pages[0].screenshot({ path: `${out}/length-pressed.png`, fullPage: true })
await pages[0].mouse.up()
await pages[0].waitForTimeout(350)
const released = await quick.evaluate(node => getComputedStyle(node).scale)
if (released !== 'none' && Number(released) !== 1) throw new Error(`Press did not release: ${released}`)
await pages[0].emulateMedia({ reducedMotion: 'reduce' })
const link = await fetch(`http://127.0.0.1:8080/v1/projects/demo-pacing-local/databases/(default)/documents/playerCouples/${people[0].uid}`, { headers: { authorization: 'Bearer owner' } }).then(response => response.json())
const coupleId = link.fields.coupleId.stringValue
// Fixture funding is confined to this throwaway emulator couple.
const bank = await fetch(`http://127.0.0.1:8080/v1/projects/demo-pacing-local/databases/(default)/documents/coupleProgress/${coupleId}?updateMask.fieldPaths=lifetimeHearts`, { method: 'PATCH', headers: { authorization: 'Bearer owner', 'content-type': 'application/json' }, body: JSON.stringify({ fields: { lifetimeHearts: { integerValue: '100' } } }) })
if (!bank.ok) throw new Error(await bank.text())
await pages[0].getByRole('button', { name: 'Collection', exact: true }).click()
await pages[0].getByRole('button', { name: 'Rose Gilt, 48 shared hearts', exact: true }).click()
await pages[0].getByRole('button', { name: 'Rose Gilt, selected', exact: true }).waitFor()
await pages[0].screenshot({ path: `${out}/frames.png`, fullPage: true })
await pages[0].getByRole('button', { name: 'Collection', exact: true }).click()
await pages[0].getByRole('button', { name: 'New night', exact: true }).click()
await pages[1].getByRole('button', { name: 'Continue', exact: true }).click()
for (const page of pages) await page.waitForFunction(() => window.__atLongLastGameState?.pacing === 'independent')
async function gameState(page) {
  const state = await page.waitForFunction(() => window.__atLongLastGameState || false)
  return state.jsonValue()
}
async function rollDice(page) {
  const before = (await gameState(page)).ownRolls
  console.log('roll start', before)
  await page.evaluate(() => { window.__atLongLastTestRoll = { dice: [1,1], selectionSeed: .01 } })
  await page.getByRole('button', { name: 'Roll 2 Dice (2–12)', exact: true }).click()
  console.log('clicked roll', await page.evaluate(() => window.__atLongLastRollTrace))
  try { await page.waitForFunction(previous => window.__atLongLastGameState?.ownRolls === previous + 1, before, { timeout: 30000 }) } catch (error) { console.log('ROLL FAILED', await page.locator('body').innerText(), errors, await page.evaluate(() => ({ trace: window.__atLongLastRollTrace, read: window.__atLongLastNightRead, fixture: window.__atLongLastTestRoll }))); throw error }
  await page.waitForTimeout(1700)
}
async function sealReflection(page, text, guess) {
  const type = (await gameState(page)).activity.id
  const answer = page.getByLabel('Your Answer', { exact: true })
  console.log('fill answer'); await answer.fill(text); console.log('answer filled')
  await page.getByRole('button', { name: /Guess for/ }).click(); console.log('flipped')
  await page.locator('#activity-guess-input').fill(guess); console.log('guess filled')
  await page.getByRole('button', { name: /Seal My Turn|Seal & Reveal/ }).click(); console.log('sealed')
  await page.waitForFunction(type => { const state = window.__atLongLastGameState; return state && !state.activity && !state.available.some(task => task.kind === 'activity' && task.type === type) }, type)
}
async function finishLanding(page, index) {
  const state = await gameState(page)
  if (state.phase === 'activity') await sealReflection(page, `${people[index].name} private answer ${state.ownRolls}`, `${people[index].name} prediction`)
  else if (state.phase === 'keepsake') {
    await page.getByRole('button', { name: 'Tap Card to Collect', exact: true }).click()
    await page.waitForTimeout(700)
  }
}
await rollDice(pages[0])
console.log('first landing', await gameState(pages[0]))
await pages[0].screenshot({ path: `${out}/first-card.png`, fullPage: true })
await finishLanding(pages[0], 0)
await rollDice(pages[0])
await finishLanding(pages[0], 0)
if ((await gameState(pages[0])).ownRolls !== 2 || (await gameState(pages[1])).ownRolls !== 0) throw new Error('One phone could not advance independently')
await pages[0].screenshot({ path: `${out}/ahead.png`, fullPage: true })
await pages[0].reload()
await pages[0].getByRole('button', { name: 'Continue', exact: true }).click()
await pages[0].waitForFunction(() => window.__atLongLastGameState?.ownRolls === 2)
await pages[1].getByRole('button', { name: /Comfort Menu/ }).click()
if ((await pages[1].locator('body').innerText()).includes('Avery private answer')) throw new Error('A private answer leaked before the finale')
await sealReflection(pages[1], 'Rowan private answer 0', 'Rowan prediction')
await pages[1].reload()
await pages[1].getByRole('button', { name: 'Continue', exact: true }).click()
await pages[1].waitForFunction(() => window.__atLongLastGameState?.pacing === 'independent')
for (const [index, count] of [[0,2], [1,4]]) {
  for (let turn=0; turn<count; turn++) {
    await rollDice(pages[index])
    await finishLanding(pages[index], index)
  }
}
// Answer the other phone's remaining asynchronous cards.
for (const [index,page] of pages.entries()) {
  for (;;) {
    const task=(await gameState(page)).available.find(item=>item.kind==='activity')
    if (!task) break
    await page.locator('.night-action-list button').filter({hasText: (await page.evaluate(async type => (await import('/src/features/session/activityRegistry.jsx')).activityRegistry[type].label, task.type))}).click()
    await sealReflection(page, `${people[index].name} private catch-up`, `${people[index].name} prediction`)
  }
}
console.log('boards finished', await gameState(pages[0]))
await pages[0].screenshot({ path: `${out}/boards-finished.png`, fullPage: true })
await writeFile(`${out}/people.json`, JSON.stringify(people))
await writeFile(`${out}/home.txt`, await pages[0].locator('body').innerText())
await writeFile(`${out}/errors.json`, JSON.stringify(errors))
console.log('errors', errors)
await browser.close()
