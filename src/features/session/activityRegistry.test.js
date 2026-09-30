import { describe, expect, it } from 'vitest'
import { activityRegistry, activityIds } from './activityRegistry.jsx'

const players = [
  { displayName: 'Kyle' },
  { displayName: 'Elaine' },
]

describe('activityRegistry', () => {
  it('contains the original pack plus connection games and sealed activities with unique ids', () => {
    expect(activityIds).toHaveLength(58)
    expect(new Set(activityIds).size).toBe(58)
  })

  it('completes a normal two-turn activity and produces journal-ready text', () => {
    const entry = activityRegistry['comfort-menu']
    let state = entry.createInitialState()

    let step = entry.advance(state, {
      input: { text: 'Tea and quiet.' },
      playerIndex: 0,
    })
    expect(step.completed).toBe(false)

    step = entry.advance(step.state, {
      input: { text: 'Blanket and forehead rubs.' },
      playerIndex: 1,
    })
    expect(step.completed).toBe(true)

    const result = entry.resolve(step.state, players)
    expect(result.heartBonus).toBe(3)
    expect(result.payload.entries).toHaveLength(2)
    expect(result.text).toContain('Kyle:')
    expect(result.vibe).toBe('tender')
  })

  it('adds an openAt timestamp for postcard-next-year', () => {
    const entry = activityRegistry['postcard-next-year']
    let state = entry.createInitialState()

    state = entry.advance(state, {
      input: { text: 'Remember when we finally slowed down?' },
      playerIndex: 0,
    }).state

    const step = entry.advance(state, {
      input: { text: 'And started laughing again on purpose.' },
      playerIndex: 1,
    })

    const result = entry.resolve(step.state, players)
    expect(result.openAt).toBeTypeOf('string')
    expect(result.payload.openAt).toBe(result.openAt)
  })

  it('normalizes every original two-player response into a scrapbook result', () => {
    const entry = activityRegistry['weather-report']
    let state = entry.createInitialState()

    state = entry.advance(state, {
      input: { text: 'Cloudy, but clearing.' },
      playerIndex: 0,
    }).state
    const completed = entry.advance(state, {
      input: { text: 'Sunny with a chance of snacks.' },
      playerIndex: 1,
    })
    const result = entry.resolve(completed.state, players)

    expect(result.savesToJournal).toBe(true)
    expect(result.text).toContain('Cloudy, but clearing.')
    expect(result.text).toContain('Sunny with a chance of snacks.')
  })

  it('keeps all spicy activities skippable', () => {
    const spicyEntries = Object.values(activityRegistry).filter((entry) => entry.vibe === 'spicy')
    expect(spicyEntries).toHaveLength(16)
    expect(spicyEntries.every((entry) => entry.skippable)).toBe(true)
  })

  it('resolves a matching Mind Meld with the larger heart reward', () => {
    const entry = activityRegistry['mind-meld']
    let state = entry.createInitialState(players, {
      activePlayerIndex: 0,
      random: () => 0,
    })

    let step = entry.advance(state, {
      input: { answerId: 'road-trip' },
      playerIndex: 0,
    })
    expect(step.completed).toBe(false)
    expect(step.state.turnIndex).toBe(1)

    step = entry.advance(step.state, {
      input: { answerId: 'road-trip' },
      playerIndex: 1,
    })

    expect(step.completed).toBe(true)
    const result = entry.resolve(step.state, players)
    expect(result.heartBonus).toBe(4)
    expect(result.payload.matched).toBe(true)
    expect(result.text).toContain('Kyle: Unexpected road trip')
  })

  it('keeps Prediction Box asymmetric until the subject answers', () => {
    const entry = activityRegistry['prediction-box']
    let state = entry.createInitialState(players, {
      activePlayerIndex: 1,
      random: () => 0,
    })

    const earlySubject = entry.advance(state, {
      input: { answerId: 'reservation' },
      playerIndex: 0,
    })
    expect(earlySubject.state).toBe(state)

    state = entry.advance(state, {
      input: { answerId: 'drive' },
      playerIndex: 1,
    }).state
    expect(state.phase).toBe('answer')
    expect(state.turnIndex).toBe(0)

    const completed = entry.advance(state, {
      input: { answerId: 'drive' },
      playerIndex: 0,
    })
    const result = entry.resolve(completed.state, players)
    expect(completed.completed).toBe(true)
    expect(result.heartBonus).toBe(5)
    expect(result.payload.prediction.playerIndex).toBe(1)
    expect(result.payload.actual.playerIndex).toBe(0)
  })

  it('seals two Vault notes for finale-gated scrapbook reveal', () => {
    const entry = activityRegistry['the-vault']
    let state = entry.createInitialState(players, {
      activePlayerIndex: 0,
      random: () => 0,
    })

    state = entry.advance(state, {
      input: { text: 'You make ordinary days feel chosen.' },
      playerIndex: 0,
    }).state
    const completed = entry.advance(state, {
      input: { text: 'I hope we keep making room for slow mornings.' },
      playerIndex: 1,
    })
    const result = entry.resolve(completed.state, players)

    expect(completed.completed).toBe(true)
    expect(result.payload.sealed).toBe(true)
    expect(result.payload.revealAt).toBe('finale')
    expect(result.payload.entries).toHaveLength(2)
    expect(result.heartBonus).toBe(3)
  })

  it('reveals Vibe Check markers only after both values are placed', () => {
    const entry = activityRegistry['vibe-check']
    let state = entry.createInitialState(players, {
      activePlayerIndex: 0,
      random: () => 0,
    })

    let step = entry.advance(state, {
      input: { value: 46 },
      playerIndex: 0,
    })
    expect(step.completed).toBe(false)
    expect(step.state.values).toEqual({ 0: 46 })

    step = entry.advance(step.state, {
      input: { value: 52 },
      playerIndex: 1,
    })
    const result = entry.resolve(step.state, players)
    expect(step.completed).toBe(true)
    expect(result.payload.distance).toBe(6)
    expect(result.payload.syncScore).toBe(94)
    expect(result.heartBonus).toBe(5)
  })

  it('scores two validated Tempo Tap results as a shared rhythm', () => {
    const entry = activityRegistry['tempo-tap']
    let state = entry.createInitialState(players, {
      activePlayerIndex: 1,
      random: () => 0,
    })
    const firstInput = {
      accuracy: 92,
      averageErrorMs: 64,
      averageIntervalMs: 812,
      bestStreak: 4,
    }
    const secondInput = {
      accuracy: 88,
      averageErrorMs: 96,
      averageIntervalMs: 784,
      bestStreak: 3,
    }

    state = entry.advance(state, { input: firstInput, playerIndex: 1 }).state
    const completed = entry.advance(state, {
      input: secondInput,
      playerIndex: 0,
    })
    const result = entry.resolve(completed.state, players)

    expect(completed.completed).toBe(true)
    expect(result.payload.averageAccuracy).toBe(90)
    expect(result.heartBonus).toBe(5)
  })

  it('validates Word Weaver submissions against the shared tray', () => {
    const entry = activityRegistry['word-weaver']
    let state = entry.createInitialState(players, {
      activePlayerIndex: 0,
      random: () => 0,
    })

    const rejected = entry.advance(state, {
      input: { words: ['banana'] },
      playerIndex: 0,
    })
    expect(rejected.state).toBe(state)

    state = entry.advance(state, {
      input: { words: ['heart', 'star'] },
      playerIndex: 0,
    }).state
    const completed = entry.advance(state, {
      input: { words: ['earth', 'star'] },
      playerIndex: 1,
    })
    const result = entry.resolve(completed.state, players)

    expect(completed.completed).toBe(true)
    expect(result.payload.combinedWordCount).toBe(3)
    expect(result.payload.sharedWords).toEqual(['star'])
    expect(result.payload.uniqueFinds[0].words).toEqual(['heart'])
  })

  it('requires alternating horizontal and vertical moves in Dual-Axis Maze', () => {
    const entry = activityRegistry['dual-axis-maze']
    let state = entry.createInitialState(players, {
      activePlayerIndex: 0,
      random: () => 0,
    })
    const route = [
      { delta: 1, playerIndex: 0 },
      { delta: -1, playerIndex: 1 },
      { delta: 1, playerIndex: 0 },
      { delta: -1, playerIndex: 1 },
      { delta: 1, playerIndex: 0 },
      { delta: -1, playerIndex: 1 },
      { delta: 1, playerIndex: 0 },
      { delta: -1, playerIndex: 1 },
    ]

    let step
    route.forEach((move) => {
      step = entry.advance(state, {
        input: { delta: move.delta },
        playerIndex: move.playerIndex,
      })
      state = step.state
    })

    const result = entry.resolve(state, players)
    expect(step.completed).toBe(true)
    expect(state.position).toEqual({ x: 4, y: 0 })
    expect(state.moves).toBe(8)
    expect(state.bumps).toBe(0)
    expect(result.heartBonus).toBe(5)
  })

  it('joins two validated Blind Canvas halves in left-to-right order', () => {
    const entry = activityRegistry['blind-canvas']
    let state = entry.createInitialState(players, {
      activePlayerIndex: 1,
      random: () => 0,
    })
    const imageDataUrl = 'data:image/webp;base64,AAAA'

    state = entry.advance(state, {
      input: { imageDataUrl, strokeCount: 3 },
      playerIndex: 1,
    }).state
    const completed = entry.advance(state, {
      input: { imageDataUrl, strokeCount: 2 },
      playerIndex: 0,
    })
    const result = entry.resolve(completed.state, players)

    expect(completed.completed).toBe(true)
    expect(result.payload.halves.map((half) => half.side)).toEqual(['left', 'right'])
    expect(result.payload.halves[0].playerIndex).toBe(1)
    expect(result.heartBonus).toBe(4)
  })

  it('scores Harmonic Lock by closeness to the shared resonance', () => {
    const entry = activityRegistry['harmonic-lock']
    let state = entry.createInitialState(players, {
      activePlayerIndex: 0,
      random: () => 0,
    })

    state = entry.advance(state, {
      input: { value: 36 },
      playerIndex: 0,
    }).state
    const completed = entry.advance(state, {
      input: { value: 38 },
      playerIndex: 1,
    })
    const result = entry.resolve(completed.state, players)

    expect(completed.completed).toBe(true)
    expect(result.payload.averageResonance).toBe(97)
    expect(result.payload.distance).toBe(2)
    expect(result.heartBonus).toBe(5)
  })

  it('raises, challenges, and resolves Bluff Bidding on the honor system', () => {
    const entry = activityRegistry['bluff-bidding']
    let state = entry.createInitialState(players, {
      activePlayerIndex: 0,
      random: () => 0,
    })

    let step = entry.advance(state, {
      input: { action: 'raise' },
      playerIndex: 1,
    })
    expect(step.completed).toBe(false)
    expect(step.state.currentBid).toBe(3)
    expect(step.state.bidderIndex).toBe(1)
    expect(step.state.turnIndex).toBe(0)

    step = entry.advance(step.state, {
      input: { action: 'challenge' },
      playerIndex: 0,
    })
    expect(step.state.phase).toBe('proof')
    expect(step.state.turnIndex).toBe(1)

    step = entry.advance(step.state, {
      input: { answers: ['Titanic', 'The Notebook', 'Moonstruck'] },
      playerIndex: 1,
    })
    const result = entry.resolve(step.state, players)

    expect(step.completed).toBe(true)
    expect(result.payload.succeeded).toBe(true)
    expect(result.payload.bid).toBe(3)
    expect(result.heartBonus).toBe(4)
  })

  it('collects a shared photo with two sealed Flashback captions', () => {
    const entry = activityRegistry['photo-flashback']
    const imageDataUrl = 'data:image/webp;base64,AAAA'
    let state = entry.createInitialState(players, {
      activePlayerIndex: 0,
      random: () => 0,
    })

    let step = entry.advance(state, {
      input: {
        caption: 'The rain started one minute later.',
        imageDataUrl,
      },
      playerIndex: 0,
    })
    expect(step.completed).toBe(false)
    expect(step.state.phase).toBe('caption')
    expect(step.state.turnIndex).toBe(1)

    step = entry.advance(step.state, {
      input: { caption: 'Still my favorite accidental detour.' },
      playerIndex: 1,
    })
    const result = entry.resolve(step.state, players)

    expect(step.completed).toBe(true)
    expect(result.payload.imageDataUrl).toBe(imageDataUrl)
    expect(result.payload.captions).toHaveLength(2)
    expect(result.heartBonus).toBe(4)
  })
})
