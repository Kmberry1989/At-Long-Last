import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { buildInitialSession } from './sessionLogic.js'

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')

// Session documents created by the app must satisfy firestore.rules'
// hasValidSessionSchema, or session creation is denied in production.
// This test keeps the two in lockstep without needing the emulator.
describe('session schema alignment with firestore.rules', () => {
  it('buildInitialSession writes exactly the keys the rules require', async () => {
    const rules = await readFile(resolve(REPO_ROOT, 'firestore.rules'), 'utf8')
    const match = rules.match(
      /function hasValidSessionSchema\(data\) \{[\s\S]*?hasOnly\(\[([\s\S]*?)\]\)/,
    )
    expect(match).not.toBeNull()

    const allowed = new Set([...match[1].matchAll(/'(\w+)'/g)].map((entry) => entry[1]))
    // Timestamps/status are added by sessionService around buildInitialSession.
    const serviceAdded = new Set([
      'createdAt',
      'endedAt',
      'lastActionAt',
      'startedAt',
      'status',
      'updatedAt',
    ])

    const session = buildInitialSession({
      id: 'couple-1',
      players: [{ uid: 'a' }, { uid: 'b' }],
      sessionPreset: 'quick',
    })

    const extra = Object.keys(session).filter((key) => !allowed.has(key))
    expect(extra).toEqual([])

    const missing = [...allowed].filter(
      (key) => !(key in session) && !serviceAdded.has(key),
    )
    expect(missing).toEqual([])
  })
})
