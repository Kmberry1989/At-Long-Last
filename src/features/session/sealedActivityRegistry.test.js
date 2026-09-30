import { describe, expect, it } from 'vitest'
import { activityRegistry } from './activityRegistry.jsx'
import {
  createSalt,
  deriveSealedKey,
  sealChoice,
} from './sealedCrypto.js'

const players = [
  { displayName: 'Kyle' },
  { displayName: 'Elaine' },
]

function roundTrip(state) {
  // Simulates a reconnect: state rehydrated from a fresh Firestore snapshot.
  return JSON.parse(JSON.stringify(state))
}

describe('sealed activities', () => {
  it('registers mind-meld and mutual-yes', () => {
    expect(activityRegistry['same-wavelength']).toBeDefined()
    expect(activityRegistry['mutual-yes']).toBeDefined()
    expect(activityRegistry['same-wavelength'].type).toBe('prediction')
    expect(activityRegistry['mutual-yes'].type).toBe('mutual-yes')
  })

  it('seals mind-meld answers until both players submit', () => {
    const entry = activityRegistry['same-wavelength']
    let state = entry.createInitialState(players, { activePlayerIndex: 0 })

    expect(state.prompt).toBeTruthy()
    expect(state.turnIndex).toBe(0)

    let step = entry.advance(state, {
      input: { text: 'The beach house' },
      playerIndex: 0,
    })
    expect(step.completed).toBe(false)
    expect(step.state.answers).toEqual({ 0: 'The beach house' })
    expect(step.state.turnIndex).toBe(1)

    // Wrong player cannot submit out of turn.
    const rejected = entry.advance(step.state, {
      input: { text: 'Sneaky' },
      playerIndex: 0,
    })
    expect(rejected.state.answers).toEqual({ 0: 'The beach house' })

    step = entry.advance(step.state, {
      input: { text: 'The beach house!' },
      playerIndex: 1,
    })
    expect(step.completed).toBe(false)
    expect(Object.keys(step.state.answers)).toHaveLength(2)
    // The second sealer calls the verdict.
    expect(step.state.turnIndex).toBe(1)

    // The verdict opens the reveal but does NOT complete the activity.
    step = entry.advance(step.state, {
      input: { matched: true },
      playerIndex: 1,
    })
    expect(step.completed).toBe(false)
    expect(step.state.matched).toBe(true)
    expect(step.state.revealAcks).toEqual([1])

    // One continue is not enough — the reveal waits for both players.
    step = entry.advance(step.state, {
      input: { revealAck: true },
      playerIndex: 1,
    })
    expect(step.completed).toBe(false)

    step = entry.advance(step.state, {
      input: { revealAck: true },
      playerIndex: 0,
    })
    expect(step.completed).toBe(true)

    const result = entry.resolve(step.state, players)
    expect(result.heartBonus).toBe(6)
    expect(result.payload.sealedMatch).toBe(true)
    expect(result.text).toContain('The beach house')
  })

  it('resumes the mind-meld reveal after a reconnect', () => {
    const entry = activityRegistry['same-wavelength']
    let state = entry.createInitialState(players, { activePlayerIndex: 0 })

    state = entry.advance(state, { input: { text: 'Pizza' }, playerIndex: 0 }).state
    state = entry.advance(state, { input: { text: 'Sushi' }, playerIndex: 1 }).state
    state = entry.advance(state, { input: { matched: false }, playerIndex: 1 }).state

    // Player 0's phone died at the reveal; they come back to the same state.
    // Player 1 (who called the verdict) already acked, so player 0's
    // continue completes the activity.
    const resumed = roundTrip(state)
    const done = entry.advance(resumed, {
      input: { revealAck: true },
      playerIndex: 0,
    })
    expect(done.completed).toBe(true)
    expect(done.state.revealAcks).toEqual([1, 0])

    const result = entry.resolve(done.state, players)
    expect(result.heartBonus).toBe(3)
    expect(result.payload.sealedMatch).toBe(false)
  })

  it('runs mutual-yes on sealed ciphertext, never plaintext', async () => {
    const entry = activityRegistry['mutual-yes']
    let state = entry.createInitialState(players, { activePlayerIndex: 0 })

    const salt0 = createSalt()
    const salt1 = createSalt()

    // Phase 1: salt exchange (public randomness).
    let step = entry.advance(state, { input: { salt: salt0 }, playerIndex: 0 })
    expect(step.completed).toBe(false)
    step = entry.advance(step.state, { input: { salt: salt1 }, playerIndex: 1 })
    expect(step.completed).toBe(false)
    expect(step.state.salts).toEqual({ 0: salt0, 1: salt1 })

    // Duplicate salts are ignored.
    const dup = entry.advance(step.state, {
      input: { salt: createSalt() },
      playerIndex: 0,
    })
    expect(dup.state.salts['0']).toBe(salt0)

    // Phase 2: encrypted choices.
    const key = await deriveSealedKey(salt0, salt1)
    const sealed0 = await sealChoice(key, 'yes')
    const sealed1 = await sealChoice(key, 'yes')

    step = entry.advance(step.state, {
      input: { sealedChoice: sealed0 },
      playerIndex: 0,
    })
    expect(step.completed).toBe(false)
    expect(step.state.outcome).toBeNull()

    // The second sealed choice carries the locally-computed outcome.
    step = entry.advance(step.state, {
      input: { sealedChoice: sealed1, outcome: { mutualYes: true, warm: false } },
      playerIndex: 1,
    })
    expect(step.completed).toBe(false)
    expect(step.state.outcome).toEqual({ mutualYes: true, warm: false })

    // Plaintext choices must not be recoverable from the stored state.
    const serialized = JSON.stringify(step.state)
    expect(serialized).not.toContain('"yes"')
    expect(step.state.choices).toBeUndefined()

    // Reveal phase: one ack is not enough.
    step = entry.advance(step.state, {
      input: { revealAck: true },
      playerIndex: 1,
    })
    expect(step.completed).toBe(false)

    step = entry.advance(step.state, {
      input: { revealAck: true },
      playerIndex: 0,
    })
    expect(step.completed).toBe(true)

    const result = entry.resolve(step.state, players)
    expect(result.heartBonus).toBe(6)
    expect(result.payload.mutualYes).toBe(true)
    expect(result.payload.choices).toBeUndefined()
    expect(result.summary).toContain('mutual yes')
  })

  it('keeps a non-mutual mutual-yes gentle and private', async () => {
    const entry = activityRegistry['mutual-yes']
    let state = entry.createInitialState(players, { activePlayerIndex: 0 })

    const salt0 = createSalt()
    const salt1 = createSalt()
    state = entry.advance(state, { input: { salt: salt0 }, playerIndex: 0 }).state
    state = entry.advance(state, { input: { salt: salt1 }, playerIndex: 1 }).state

    const key = await deriveSealedKey(salt0, salt1)
    state = entry.advance(state, {
      input: { sealedChoice: await sealChoice(key, 'yes') },
      playerIndex: 0,
    }).state

    const step = entry.advance(state, {
      input: {
        sealedChoice: await sealChoice(key, 'later'),
        outcome: { mutualYes: false, warm: false },
      },
      playerIndex: 1,
    })
    expect(step.completed).toBe(false)

    const serialized = JSON.stringify(step.state)
    expect(serialized).not.toContain('"yes"')
    expect(serialized).not.toContain('"later"')

    const acked = entry.advance(
      entry.advance(step.state, { input: { revealAck: true }, playerIndex: 0 }).state,
      { input: { revealAck: true }, playerIndex: 1 },
    )
    expect(acked.completed).toBe(true)

    const result = entry.resolve(acked.state, players)
    expect(result.heartBonus).toBe(2)
    expect(result.payload.mutualYes).toBe(false)
    expect(result.payload.choices).toBeUndefined()
    expect(result.text).not.toContain('yes')
    expect(result.summary).toContain('No pressure')
  })

  it('backfills the outcome when both sealed choices arrive without one', async () => {
    const entry = activityRegistry['mutual-yes']
    let state = entry.createInitialState(players, { activePlayerIndex: 0 })

    const salt0 = createSalt()
    const salt1 = createSalt()
    state = entry.advance(state, { input: { salt: salt0 }, playerIndex: 0 }).state
    state = entry.advance(state, { input: { salt: salt1 }, playerIndex: 1 }).state

    const key = await deriveSealedKey(salt0, salt1)
    state = entry.advance(state, {
      input: { sealedChoice: await sealChoice(key, 'yes') },
      playerIndex: 0,
    }).state
    // Simultaneous submission: neither client saw the partner's ciphertext.
    state = entry.advance(state, {
      input: { sealedChoice: await sealChoice(key, 'maybe') },
      playerIndex: 1,
    }).state
    expect(state.outcome).toBeNull()

    const step = entry.advance(state, {
      input: { outcome: { mutualYes: false, warm: true } },
      playerIndex: 0,
    })
    expect(step.completed).toBe(false)
    expect(step.state.outcome).toEqual({ mutualYes: false, warm: true })

    const result = entry.resolve(step.state, players)
    expect(result.heartBonus).toBe(4)
  })

  it('rejects malformed sealed inputs', async () => {
    const entry = activityRegistry['mutual-yes']
    let state = entry.createInitialState(players, { activePlayerIndex: 0 })

    // Bad salt.
    let step = entry.advance(state, { input: { salt: 'nope' }, playerIndex: 0 })
    expect(step.state.salts).toEqual({})

    // Sealed choice before salts.
    const key = await deriveSealedKey(createSalt(), createSalt())
    step = entry.advance(state, {
      input: { sealedChoice: await sealChoice(key, 'yes') },
      playerIndex: 0,
    })
    expect(step.state.sealed).toEqual({})

    // Malformed sealed choice.
    state = entry.advance(state, { input: { salt: createSalt() }, playerIndex: 0 }).state
    state = entry.advance(state, { input: { salt: createSalt() }, playerIndex: 1 }).state
    step = entry.advance(state, {
      input: { sealedChoice: { iv: 'x' } },
      playerIndex: 0,
    })
    expect(step.state.sealed).toEqual({})

    // Ack before any outcome.
    step = entry.advance(state, { input: { revealAck: true }, playerIndex: 0 })
    expect(step.completed).toBe(false)
  })

  it('counts sealed matches and mutual yeses on the session', async () => {
    const { resolveActivityCompletion } = await import('./sessionLogic.js')
    const base = {
      hearts: 6,
      keepsakePerks: [],
      momentum: {},
      players,
      sealedMatches: 0,
      mutualYesMatches: 0,
      spotlight: { act: 'warmup' },
      completedSpotlightActs: [],
      usedKeepsakePerks: [],
      round: 1,
      totalRounds: 4,
      turnsTakenThisRound: 0,
      activePlayerIndex: 0,
      startingPlayerIndex: 0,
    }

    const afterMeld = resolveActivityCompletion(base, {
      heartBonus: 6,
      label: 'Same Wavelength',
      payload: { sealedMatch: true },
      vibe: 'playful',
    })
    expect(afterMeld.sealedMatches).toBe(1)
    expect(afterMeld.mutualYesMatches).toBe(0)

    const afterYes = resolveActivityCompletion(afterMeld, {
      heartBonus: 6,
      label: 'Mutual Yes',
      payload: { mutualYes: true },
      vibe: 'spicy',
    })
    expect(afterYes.sealedMatches).toBe(1)
    expect(afterYes.mutualYesMatches).toBe(1)
  })
})
