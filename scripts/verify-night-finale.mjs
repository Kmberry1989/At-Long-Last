const { chromium } = await import(process.env.PLAYWRIGHT_MODULE_PATH || `${process.env.HOME}/.codex/skills/develop-web-game/scripts/node_modules/playwright/index.mjs`)
import { readFile, writeFile } from 'node:fs/promises'
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:5173'
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Run this verification only against a local dev server.')
const out = '.playwright-mcp/independent-night'
const people = JSON.parse(await readFile(`${out}/people.json`, 'utf8'))
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const errors = [], evidence = {}
const contexts = await Promise.all([390,393].map(width => browser.newContext({ viewport: { width, height: 844 }, hasTouch: true, reducedMotion: 'reduce' })))
const pages = await Promise.all(contexts.map(context => context.newPage()))
const admin = { authorization: 'Bearer owner', 'content-type': 'application/json' }
const root = 'http://127.0.0.1:8080/v1/projects/demo-pacing-local/databases/(default)/documents'
async function record(path) { const response = await fetch(`${root}/${path}`, { headers: admin }); if (!response.ok) throw new Error(await response.text()); return response.json() }
async function patch(path, fields) {
  const response = await fetch(`${root}/${path}?${Object.keys(fields).map(key=>`updateMask.fieldPaths=${key}`).join('&')}`, { method: 'PATCH', headers: admin, body: JSON.stringify({ fields: Object.fromEntries(Object.entries(fields).map(([key,value])=>[key,{stringValue:value}])) }) })
  if (!response.ok) throw new Error(await response.text())
}
try {
  const coupleId = (await record(`playerCouples/${people[0].uid}`)).fields.coupleId.stringValue
  const sessionId = (await record(`couples/${coupleId}`)).fields.activeSessionId.stringValue
  evidence.sessionId = sessionId
  // Seed known duel varieties before either phone answers; all persistence and
  // completion from this point use the authenticated UI and real local rules.
  await patch(`sessions/${sessionId}/steps/duel-1`, { type: 'doodle-duel-memory' })
  await patch(`sessions/${sessionId}/steps/duel-2`, { type: 'wavelength-duel' })
  for (const [index,page] of pages.entries()) {
    page.setDefaultTimeout(20000)
    page.on('pageerror', error => { errors.push(error.message); console.error('PAGE ERROR',error.message) })
    await page.route('https://lh3.googleusercontent.com/a/qa-*', route => route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" fill="#d8bb90"/><ellipse cx="60" cy="112" rx="48" ry="40" fill="#24454b"/><ellipse cx="60" cy="49" rx="26" ry="32" fill="#b87954"/><path d="M34 45c-9-45 63-49 54 2L73 26 36 47Z" fill="#3d2924"/></svg>' }))
    await page.goto(base)
    await page.getByLabel('Email', { exact: true }).fill(people[index].email)
    await page.getByLabel('Password', { exact: true }).fill(people[index].password)
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await page.waitForFunction(() => window.__atLongLastGameState?.ownRolls === 4)
  }
  console.log('resumed both boards')
  for (const [index,page] of pages.entries()) {
    const label = await page.evaluate(async () => (await import('/src/features/session/duelRegistry.jsx')).duelRegistry['doodle-duel-memory'].label)
    await page.locator('.night-action-list button').filter({ hasText: label }).click()
    await page.getByRole('button', { name: 'Ink pen', exact: true }).click()
    const canvas = page.getByLabel('Drawing canvas', { exact: true })
    await canvas.waitFor()
    await canvas.evaluate(node => {
      window.__qaInkWidths = []
      const context = node.getContext('2d'), stroke = context.stroke.bind(context)
      context.stroke = function () { window.__qaInkWidths.push(this.lineWidth); return stroke() }
    })
    const box = await canvas.boundingBox()
    const cdp = await contexts[index].newCDPSession(page)
    const touch = (x,y,force) => ({ x: box.x+x*box.width, y: box.y+y*box.height, id: 1, radiusX: 4, radiusY: 4, force })
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [touch(.18,.35,.15)] })
    for (const [x,y,force] of [[.23,.21,.2],[.34,.2,.35],[.45,.33,.65],[.56,.2,.85],[.69,.21,.95],[.78,.35,.8],[.71,.48,.5],[.45,.75,.25],[.23,.48,.15],[.18,.35,.12]]) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [touch(x,y,force)] })
      await page.waitForTimeout(35)
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    const widths = await page.evaluate(() => window.__qaInkWidths)
    if (widths.length < 3 || Math.max(...widths)-Math.min(...widths) < .5) throw new Error(`Ink did not vary: ${JSON.stringify(widths)}`)
    evidence[`ink-${index}`] = { samples: widths.length, min: Math.min(...widths), max: Math.max(...widths) }
    await page.getByRole('button', { name: 'Fine liner', exact: true }).click()
    await page.getByRole('button', { name: 'Gold ink', exact: true }).click()
    await page.mouse.move(box.x+box.width*.15, box.y+box.height*.85)
    await page.mouse.down()
    await page.mouse.move(box.x+box.width*.8, box.y+box.height*.85, { steps: 15 })
    await page.mouse.up()
    await page.screenshot({ path: `${out}/drawing-${index}.png`, fullPage: true })
    await page.getByRole('button', { name: 'Save Drawing', exact: true }).click()
    await page.waitForFunction(() => window.__atLongLastGameState?.phase === 'turn')
  }
  console.log('both drawings saved')
  for (const [index,page] of pages.entries()) {
    const label = await page.evaluate(async () => (await import('/src/features/session/duelRegistry.jsx')).duelRegistry['wavelength-duel'].label)
    await page.locator('.night-action-list button').filter({ hasText: label }).click()
    for (let prompt = 0; prompt < 5; prompt++) {
      await page.getByRole('radio').nth(index).click()
      await page.getByRole('button', { name: 'Lock My Answer', exact: true }).click()
      await page.getByRole('radio').nth(1-index).click()
      await page.getByRole('button', { name: prompt === 4 ? 'Seal My Guesses' : 'Lock My Guess', exact: true }).click()
    }
    await page.waitForFunction(() => window.__atLongLastGameState?.phase === 'turn')
  }
  const sealed = await record(`sessions/${sessionId}/steps/duel-2`)
  if (![0,1].every(index => /^h=/.test(sealed.fields.state.mapValue.fields.results.mapValue.fields[String(index)].mapValue.fields.excerpt.stringValue))) throw new Error('Wavelength answers were not committed privately')
  console.log('both predictions sealed')
  for (const page of pages) {
    for (;;) {
      const state = await page.evaluate(() => window.__atLongLastGameState)
      const task = state.available.find(task => task.kind === 'duel' && task.id !== 'duel-2')
      if (!task) break
      const label = await page.evaluate(async type => (await import('/src/features/session/duelRegistry.jsx')).duelRegistry[type].label, task.type)
      await page.locator('.night-action-list button').filter({ hasText: label }).click()
      await page.getByRole('button', { name: 'Skip Duel', exact: true }).first().click()
      await page.waitForFunction(id => { const state=window.__atLongLastGameState; return state?.phase==='turn' && !state.available.some(task=>task.id===id) },task.id)
    }
  }
  for (const page of pages) {
    await page.getByRole('button', { name: /Reveal: Wavelength/ }).click()
    await page.getByRole('button', { name: 'Reveal my challenge', exact: true }).click()
    await page.waitForFunction(() => window.__atLongLastGameState?.phase === 'turn')
  }
  await pages[0].getByRole('button', { name: 'Open tonight’s reveals', exact: true }).click()
  for (const [index,page] of pages.entries()) {
    await page.waitForFunction(() => window.__atLongLastGameState?.phase === 'finale')
    const ceremony = page.getByRole('dialog').filter({has: page.locator('#moment-title')})
    await ceremony.waitFor()
    await ceremony.getByRole('button', {name:'Continue', exact:true}).click()
    await page.getByRole('button', { name: 'Open Bound Scrapbook', exact: true }).click()
    await page.getByText('Avery private answer 1', { exact: false }).first().waitFor()
    await page.screenshot({ path: `${out}/finale-scrapbook-${index}.png`, fullPage: true })
    await page.reload()
    await page.getByRole('button', { name: 'Scrapbook', exact: true }).click()
    await page.getByText('Avery private answer 1', { exact: false }).first().waitFor()
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) throw new Error('Mobile overflow after reload')
    await page.screenshot({ path: `${out}/reloaded-scrapbook-${index}.png`, fullPage: true })
  }
  evidence.final = (await record(`sessions/${sessionId}`)).fields.status.stringValue
  evidence.errors = errors
  if (errors.length) throw new Error(JSON.stringify(errors))
  await writeFile(`${out}/finale-evidence.json`, JSON.stringify(evidence,null,2))
  console.log(evidence)
} catch (error) {
  for (const [index,page] of pages.entries()) {
    console.log(`PAGE ${index}`, await page.locator('body').innerText().catch(()=>''))
    await page.screenshot({path:`${out}/failure-${index}.png`,fullPage:true,timeout:10000}).catch(()=>{})
  }
  throw error
} finally { await browser.close() }
