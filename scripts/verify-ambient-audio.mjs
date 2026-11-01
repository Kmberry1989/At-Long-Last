const { chromium } = await import(process.env.PLAYWRIGHT_MODULE_PATH || `${process.env.HOME}/.codex/skills/develop-web-game/scripts/node_modules/playwright/index.mjs`)
import { mkdir, writeFile } from 'node:fs/promises'
const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage()
  await page.goto(process.env.QA_BASE_URL || 'http://127.0.0.1:5173')
  const result = await page.evaluate(async () => {
    const { createAudioEngine } = await import('/src/audio/AudioProvider.jsx')
    const seconds = 100, rate = 22050
    const offline = new OfflineAudioContext(2, seconds * rate, rate)
    const engine = createAudioEngine(offline)
    engine.ensureReady()
    engine.playDiceRattle({ energy: .34 })
    engine.playDiceImpact({ energy: .86, side: 0 })
    engine.playDiceImpact({ energy: .52, side: 1 })
    engine.playDiceImpact({ energy: .28, side: 0 })
    engine.playHeartTick(1)
    engine.playHeartTick(2)
    for (let tick = 0; tick < 32; tick++) {
      engine.setStage(tick < 16 ? 'menu' : 'reflective', tick * 2.4)
      engine.scheduleTick(tick, tick * 2.4)
    }
    const rendered = await offline.startRendering()
    const left = rendered.getChannelData(0), right = rendered.getChannelData(1)
    let peak = 0, energy = 0, maxStep = 0
    const pcm = new Int16Array(left.length)
    for (let i = 0; i < left.length; i++) {
      const sample = (left[i] + right[i]) / 2
      peak = Math.max(peak, Math.abs(sample)); energy += sample * sample
      if (i) maxStep = Math.max(maxStep, Math.abs(sample - (left[i - 1] + right[i - 1]) / 2))
      pcm[i] = Math.max(-32768, Math.min(32767, Math.round(sample * 32767)))
    }
    let binary = ''
    const bytes = new Uint8Array(pcm.buffer)
    for (let start = 0; start < bytes.length; start += 16384) binary += String.fromCharCode(...bytes.subarray(start, start + 16384))
    return { base64: btoa(binary), peak, rms: Math.sqrt(energy / left.length), maxStep, seconds, rate }
  })
  if (result.peak >= .98 || result.rms < .0001) throw new Error('Audio render is clipped or silent')
  const pcm = Buffer.from(result.base64, 'base64')
  const header = Buffer.alloc(44)
  header.write('RIFF', 0); header.writeUInt32LE(36 + pcm.length, 4); header.write('WAVEfmt ', 8)
  header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(1, 22)
  header.writeUInt32LE(result.rate, 24); header.writeUInt32LE(result.rate * 2, 28); header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34)
  header.write('data', 36); header.writeUInt32LE(pcm.length, 40)
  await mkdir('.playwright-mcp/independent-night', { recursive: true })
  await writeFile('.playwright-mcp/independent-night/menu-reflective-score.wav', Buffer.concat([header, pcm]))
  delete result.base64
  await writeFile('.playwright-mcp/independent-night/audio-metrics.json', JSON.stringify(result, null, 2))
  console.log(result)
} finally { await browser.close() }
