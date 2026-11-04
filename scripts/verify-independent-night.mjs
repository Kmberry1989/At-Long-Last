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
await Promise.all(pages.map(async page => {
  const splash = page.locator('.opening-splash')
  // Under reduced motion the brief splash can finish before goto resolves.
  await splash.waitFor({ state: 'detached' })
}))
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
  await page.getByRole('button', { name: 'Begin our night', exact: true }).waitFor()
}
console.log('paired', people.map(person => person.uid))
await writeFile(`${out}/people.json`, JSON.stringify(people))
await pages[0].screenshot({ path: `${out}/home.png`, fullPage: true })
await pages[0].getByRole('button', { name: 'Begin our night', exact: true }).click()
await pages[1].getByRole('button', { name: 'Continue our night', exact: true }).click()
for (const page of pages) {
  await page.waitForFunction(() => window.__atLongLastGameState?.pacing === 'independent')
  await page.waitForFunction(() => typeof window.render_game_to_text === 'function')
  await page.locator('.board-canvas canvas[role="button"]').waitFor()
}
await pages[0].screenshot({ path: `${out}/roll-control-before.png`, fullPage: true })
if (process.env.QA_CAPTURE_BOARD_PILES === '1') {
  const board = await pages[0].evaluate(() => JSON.parse(window.render_game_to_text()))
  if (board.cardPiles?.deck !== 'mixed Trash moments and Treasure moments') {
    throw new Error(`Board card-pile state is missing or incorrect: ${JSON.stringify(board.cardPiles)}`)
  }
  if (board.cardPiles?.labels !== 'etched into the board fabric') {
    throw new Error(`Card-pile labels should be integrated into the board: ${JSON.stringify(board.cardPiles)}`)
  }
  if (board.cardPiles.draw?.outline !== 'dotted' || board.cardPiles.discard?.outline !== 'dotted') {
    throw new Error(`Draw and discard zones must both have dotted outlines: ${JSON.stringify(board.cardPiles)}`)
  }
  if (board.cardPiles.draw.color === board.cardPiles.discard.color) {
    throw new Error(`Draw and discard outlines must use distinct theme shades: ${JSON.stringify(board.cardPiles)}`)
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
async function rollDice(page, dice = [1, 1], swipe = false) {
  const before = (await gameState(page)).ownRolls
  const boardBefore = JSON.parse(await page.evaluate(() => window.render_game_to_text()))
  const mover = boardBefore.activePlayerIndex
  const startPosition = boardBefore.players[mover].positionIndex
  const targetPosition = (startPosition + dice[0] + dice[1]) % boardBefore.path.segments
  console.log('roll start', before)
  await page.evaluate(values => { window.__atLongLastTestRoll = { dice: values, selectionSeed: .01 } }, dice)
  const board = page.locator('.board-canvas canvas[role="button"]')
  await board.waitFor()
  const bounds = await board.boundingBox()
  const center = await page.evaluate(() => JSON.parse(window.render_game_to_text()).dice.screenCenters[0])
  const start = { x: bounds.x + center.x, y: bounds.y + center.y }
  await page.mouse.move(start.x, start.y)
  await page.mouse.down()
  if (swipe) await page.mouse.move(start.x + 22, start.y - 24, { steps: 4 })
  await page.mouse.up()
  console.log('clicked roll', await page.evaluate(() => window.__atLongLastRollTrace))
  try { await page.waitForFunction(previous => window.__atLongLastGameState?.ownRolls === previous + 1, before, { timeout: 30000 }) } catch (error) { console.log('ROLL FAILED', await page.locator('body').innerText(), errors, await page.evaluate(() => ({ trace: window.__atLongLastRollTrace, read: window.__atLongLastNightRead, fixture: window.__atLongLastTestRoll }))); throw error }
  try {
    await page.waitForFunction(({ mover, targetPosition }) => {
      const state = JSON.parse(window.render_game_to_text())
      return state.pieceMovement?.playerIndex === mover || state.players[mover].positionIndex === targetPosition
    }, { mover, targetPosition }, { timeout: 10000 })
    await page.waitForFunction(({ mover, targetPosition }) => {
      const state = JSON.parse(window.render_game_to_text())
      return state.pieceMovement === null && state.players[mover].positionIndex === targetPosition
    }, { mover, targetPosition }, { timeout: 10000 })
  } catch (error) {
    console.error('PIECE DID NOT LAND ONE SPACE AT A TIME', await page.evaluate(() => window.render_game_to_text?.()))
    throw error
  }
  await page.waitForTimeout(1650 + (dice[0] + dice[1]) * 235)
  const boardDice = await page.evaluate(() => window.render_game_to_text?.())
  if (!boardDice || JSON.stringify(JSON.parse(boardDice).dice.values) !== JSON.stringify(dice)) {
    throw new Error(`Board dice did not settle to ${JSON.stringify(dice)}: ${boardDice || 'board renderer unavailable'}`)
  }
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
  if (await page.locator('.moment-card').count()) {
    await page.getByRole('button', { name: 'Move piece' }).click()
    await page.locator('.moment-card').waitFor({ state: 'detached' })
  }
  let state = await gameState(page)
  if (state.phase === 'turn') {
    const landing = state.available.find(step => step.id.startsWith(`roll-${state.ownRolls}-${state.playerIndex}`))
    if (landing?.kind === 'keepsake') {
      await page.locator('.night-action-list button').filter({ hasText: 'Collect mystery card' }).click()
      state = await gameState(page)
    } else if (landing?.kind === 'activity') {
      const label = await page.evaluate(async type => (await import('/src/features/session/activityRegistry.jsx')).activityRegistry[type].label, landing.type)
      await page.locator('.night-action-list button').filter({ hasText: label }).click()
      state = await gameState(page)
    }
  }
  if (state.phase === 'activity') await sealReflection(page, `${people[index].name} private answer ${state.ownRolls}`, `${people[index].name} prediction`)
  else if (state.phase === 'keepsake') {
    await page.getByRole('button', { name: 'Tap Card to Collect', exact: true }).click()
    console.log('collecting keepsake')
    try { await page.locator('.board-canvas canvas[role="button"]').waitFor() } catch (error) {
      console.log('KEEPSAKE DID NOT CLOSE', await page.locator('body').innerText(), await gameState(page))
      throw error
    }
    console.log('ready after keepsake', await gameState(page))
  }
}
await rollDice(pages[0], [3,1], true)
console.log('first landing', await gameState(pages[0]))
await pages[0].screenshot({ path: `${out}/first-card.png`, fullPage: true })
if (process.env.QA_MOVEMENT_SMOKE === '1') {
  await rollDice(pages[1], [2,2], true)
  // Both players already rolled while the other player's landing was open.
  // Resolve the follow-up cards sequentially so the smoke measures the
  // independent turn flow without making two transactions compete to update
  // the shared session summary at the same instant.
  for (const [index, page] of pages.entries()) await finishLanding(page, index)
  const movementStates = await Promise.all(pages.map(gameState))
  const landedPositions = await Promise.all(pages.map(async page => {
    const state = await gameState(page)
    const board = JSON.parse(await page.evaluate(() => window.render_game_to_text()))
    return board.players[state.playerIndex].positionIndex
  }))
  if (movementStates.some(state => state.ownRolls !== 1) || landedPositions[0] !== 3 || landedPositions[1] !== 2) {
    throw new Error(`Both players should complete their dice-scaled moment moves independently: ${JSON.stringify({ movementStates, landedPositions })}`)
  }
  await Promise.all(pages.map((page, index) => page.screenshot({ path: `${out}/movement-player-${index + 1}.png`, fullPage: true })))
  await pages[0].screenshot({ path: `${out}/board-scaled-spaces-and-piles.png`, fullPage: true })
  await writeFile(`${out}/movement-smoke.json`, JSON.stringify(movementStates, null, 2))
  console.log('two-player movement smoke passed', movementStates.map((state, index) => ({ playerIndex: state.playerIndex, ownRolls: state.ownRolls, landedPosition: landedPositions[index] })))
  await browser.close()
  process.exit(0)
}
await finishLanding(pages[0], 0)
await rollDice(pages[0])
await finishLanding(pages[0], 0)
if ((await gameState(pages[0])).ownRolls !== 2 || (await gameState(pages[1])).ownRolls !== 0) throw new Error('One phone could not advance independently')
await pages[0].screenshot({ path: `${out}/ahead.png`, fullPage: true })
await pages[0].reload()
await pages[0].getByRole('button', { name: 'Continue our night', exact: true }).click()
await pages[0].waitForFunction(() => window.__atLongLastGameState?.ownRolls === 2)
if ((await pages[1].locator('body').innerText()).includes('Avery private answer')) throw new Error('A private answer leaked before the finale')
await pages[1].waitForFunction(() => window.__atLongLastGameState?.ownRolls === 0)
await rollDice(pages[1])
await finishLanding(pages[1], 1)
if ((await gameState(pages[0])).ownRolls !== 2 || (await gameState(pages[1])).ownRolls !== 1) throw new Error('Both phones could not advance independently')
for (const [index, count] of [[0,2], [1,3]]) {
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
const finalStates = await Promise.all(pages.map(gameState))
if (finalStates.some(state => state.ownRolls !== 4 || state.comparisons !== 8)) throw new Error(`Expected four independent rolls and eight collected comparisons per player: ${JSON.stringify(finalStates)}`)
console.log('independent progress saved', finalStates)
await pages[0].screenshot({ path: `${out}/boards-finished.png`, fullPage: true })
await writeFile(`${out}/people.json`, JSON.stringify(people))
await writeFile(`${out}/home.txt`, await pages[0].locator('body').innerText())
await writeFile(`${out}/errors.json`, JSON.stringify(errors))
if (errors.length) throw new Error(`Browser errors: ${JSON.stringify(errors)}`)
console.log('errors', errors)
await browser.close()
