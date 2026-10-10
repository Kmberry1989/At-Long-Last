import { describe, expect, it } from 'vitest'
import {
  buildActivityJournalEntry,
  buildAnniversaryJournalEntry,
  buildDuelJournalEntry,
  buildFreezeEarnedJournalEntry,
  buildFreezeUsedJournalEntry,
  buildFinaleJournalEntry,
  buildMilestoneJournalEntry,
  buildProgressJournalEntries,
  buildPromiseGrantedJournalEntry,
  buildSkippedActivityJournalEntry,
  buildTrophyJournalEntry,
  buildVibeSetupJournalEntry,
  getScrapbookMomentCount,
} from './journalHelpers.js'
import { encodeWavelengthSubmission, getWavelengthPromptsForSession } from './wavelengthDuelData.js'

describe('journalHelpers', () => {
  it('does not count the hidden finale metadata page as a scrapbook moment', () => {
    expect(getScrapbookMomentCount([
      { id: 'finale', type: 'finale' },
      { id: 'activity', type: 'prompt' },
      { id: 'duel', type: 'duel' },
    ])).toBe(2)
  })

  it('builds a normal prompt journal entry', () => {
    const entry = buildActivityJournalEntry({
      coupleId: 'couple-1',
      result: {
        payload: { entries: [] },
        savesToJournal: true,
        summary: 'Small Mercies complete.',
        text: 'Kyle: Thanks.\nElaine: You noticed.',
        title: 'Small Mercies',
        type: 'prompt',
        vibe: 'tender',
      },
      sessionId: 'session-1',
    })

    expect(entry?.vibe).toBe('tender')
    expect(entry?.text).toContain('Kyle:')
  })

  it('keeps postcard-next-year openAt data', () => {
    const entry = buildActivityJournalEntry({
      coupleId: 'couple-1',
      result: {
        openAt: '2027-07-15T00:00:00.000Z',
        payload: { openAt: '2027-07-15T00:00:00.000Z' },
        savesToJournal: true,
        summary: 'Future postcard saved.',
        text: 'Remember when we did this.',
        title: 'Postcard From Next Year',
        type: 'journal',
        vibe: 'tender',
      },
      sessionId: 'session-1',
    })

    expect(entry?.openAt).toBe('2027-07-15T00:00:00.000Z')
  })

  it('records completed activity responses even when legacy metadata opts out', () => {
    const entry = buildActivityJournalEntry({
      coupleId: 'couple-1',
      result: {
        payload: { entries: [{ playerIndex: 0, text: 'Rain with a warm front.' }] },
        savesToJournal: false,
        summary: 'Weather Report complete.',
        text: 'Kyle: Rain with a warm front.\nElaine: Bright skies after lunch.',
        title: 'Weather Report',
        type: 'prompt',
        vibe: 'playful',
      },
      sessionId: 'session-1',
    })

    expect(entry?.title).toBe('Weather Report')
    expect(entry?.text).toContain('Elaine:')
  })

  it('captures doodle image data in duel journal payloads', () => {
    const entry = buildDuelJournalEntry({
      coupleId: 'couple-1',
      duel: {
        id: 'doodle-duel-memory',
        label: 'Doodle Duel',
        vibe: 'playful',
      },
      duelResults: {
        u1: { dataUrl: 'data:image/png;base64,AAAA', highlight: 'sketched it fast' },
        u2: { highlight: 'went full chaos' },
      },
      heartBonus: 4,
      outcome: { status: 'resolved', winnerIndex: 0 },
      players: [
        { uid: 'u1', displayName: 'Kyle' },
        { uid: 'u2', displayName: 'Elaine' },
      ],
      sessionId: 'session-1',
    })

    expect(entry?.payload.imageDataUrl).toContain('data:image/png')
    expect(entry?.vibe).toBe('playful')
  })

  it('writes a wavelength scorecard into the duel journal entry', () => {
    const session = {
      currentDuel: { attempt: 1, id: 'wavelength-duel' },
      id: 'session-1',
      round: 2,
    }
    const expectedPrompts = getWavelengthPromptsForSession(session)
    const entry = buildDuelJournalEntry({
      coupleId: 'couple-1',
      duel: {
        id: 'wavelength-duel',
        label: 'Wavelength Duel',
        vibe: 'playful',
      },
      duelResults: {
        u1: {
          excerpt: encodeWavelengthSubmission(['a', 'b', 'c', 'd', 'a'], ['b', 'c', 'd', 'a', 'b']),
          highlight: 'locked in 5 answers and 5 guesses',
        },
        u2: {
          excerpt: encodeWavelengthSubmission(['b', 'c', 'd', 'a', 'b'], ['a', 'b', 'c', 'd', 'a']),
          highlight: 'locked in 5 answers and 5 guesses',
        },
      },
      heartBonus: 10,
      outcome: { status: 'shared' },
      players: [
        { uid: 'u1', displayName: 'Kyle' },
        { uid: 'u2', displayName: 'Elaine' },
      ],
      session,
      sessionId: 'session-1',
    })

    expect(entry?.summary).toContain('10/10')
    expect(entry?.summary).toContain('10 shared hearts')
    expect(entry?.text).toContain('10/10 on the same wavelength')
    expect(entry?.text).toContain(expectedPrompts[0].text)
    expect(entry?.text).toContain('Takeout + couch fort')
    expect(entry?.payload.wavelength).toEqual({ matches: 10, total: 10 })
    expect(entry?.type).toBe('duel')
  })

  it('records an ordinary passed activity', () => {
    const entry = buildSkippedActivityJournalEntry({
      activity: {
        label: 'Comfort Menu',
        state: {
          prompt: "When I'm overwhelmed, what actually helps is...",
        },
        type: 'prompt',
        vibe: 'tender',
      },
      coupleId: 'couple-1',
      sessionId: 'session-1',
    })

    expect(entry?.title).toContain('Passed')
    expect(entry?.type).toBe('activity-pass')
    expect(entry?.payload.originalType).toBe('prompt')
    expect(entry?.summary).not.toContain('Pocket Love Note')
    expect(entry?.text).toContain("When I'm overwhelmed")
  })

  it('keeps the Pocket Love Note wording when that perk records a pass', () => {
    const entry = buildSkippedActivityJournalEntry({
      activity: {
        label: 'Comfort Menu',
        state: { prompt: 'What helps?' },
        type: 'prompt',
        vibe: 'tender',
      },
      coupleId: 'couple-1',
      sessionId: 'session-1',
      usedPocketLoveNote: true,
    })

    expect(entry?.title).toContain('Saved Anyway')
    expect(entry?.summary).toContain('Pocket Love Note')
  })

  it('records both setup ballots as the first scrapbook interaction', () => {
    const entry = buildVibeSetupJournalEntry({
      coupleId: 'couple-1',
      moodVotes: { u1: 'cozy', u2: 'playful' },
      players: [
        { uid: 'u1', displayName: 'Kyle' },
        { uid: 'u2', displayName: 'Elaine' },
      ],
      sessionId: 'session-1',
      vibeVotes: {
        u1: { playful: 0.3, spicy: 0.2, tender: 0.5 },
        u2: { playful: 0.4, spicy: 0.1, tender: 0.5 },
      },
      vibeWeights: { playful: 0.35, spicy: 0.15, tender: 0.5 },
    })

    expect(entry?.type).toBe('vibe-setup')
    expect(entry?.vibe).toBe('tender')
    expect(entry?.text).toContain('Kyle: Tender 50%')
    expect(entry?.text).toContain('Elaine: Tender 50%')
    expect(entry?.summary).toContain('Cozy')
    expect(entry?.summary).toContain('Playful')
    expect(entry?.payload.moods).toEqual({ u1: 'cozy', u2: 'playful' })
  })

  it('records a mutually passed duel without awarding hearts', () => {
    const entry = buildDuelJournalEntry({
      coupleId: 'couple-1',
      duel: { id: 'reaction-heart', label: 'Reaction Heart', vibe: 'playful' },
      duelResults: {
        u1: { highlight: 'skipped the duel', skipped: true },
        u2: { highlight: 'skipped the duel', skipped: true },
      },
      heartBonus: 4,
      outcome: { status: 'noContest' },
      players: [
        { uid: 'u1', displayName: 'Kyle' },
        { uid: 'u2', displayName: 'Elaine' },
      ],
      sessionId: 'session-1',
    })

    expect(entry?.payload.heartBonus).toBe(0)
    expect(entry?.summary).toContain('No hearts')
    expect(entry?.text).toContain('Kyle: skipped the duel')
  })

  it('passes richer finale payload data through to the scrapbook entry', () => {
    const entry = buildFinaleJournalEntry({
      coupleId: 'couple-1',
      journalEntries: [
        { id: 'a', type: 'prompt', vibe: 'tender' },
        { id: 'b', type: 'ritual', vibe: 'playful' },
        { id: 'c', type: 'journal', vibe: 'spicy' },
        { id: 'd', type: 'duel', vibe: 'playful' },
        { id: 'e', type: 'keepsake', vibe: 'tender' },
        { id: 'f', type: 'prompt', vibe: 'tender' },
      ],
      session: {
        hearts: 11,
        keepsakes: [{ label: 'Pocket Love Note' }, { label: 'Sparkler Photo' }],
        lastDuelOutcome: {
          winnerIndex: 1,
        },
        players: [
          { uid: 'u1', displayName: 'Kyle' },
          { uid: 'u2', displayName: 'Elaine' },
        ],
        completedSpotlightActs: ['warmup', 'spark'],
        momentum: {
          playful: 2,
          spicy: 0,
          tender: 2,
          consumed: {
            playful: true,
            spicy: false,
            tender: false,
          },
          unlocked: {
            playful: true,
            spicy: false,
            tender: true,
          },
        },
        vibeWeights: {
          tender: 0.6,
          playful: 0.2,
          spicy: 0.2,
        },
      },
      sessionId: 'session-1',
    })

    expect(entry?.payload.headline).toBeTruthy()
    expect(entry?.payload.keepsakeLabels).toEqual(['Pocket Love Note', 'Sparkler Photo'])
    expect(entry?.payload.duelOutcomeLabel).toContain('Elaine')
    expect(entry?.payload.presetLabel).toBe('Quick spark')
    expect(entry?.payload.goalBadges).toContain('10+ hearts')
    expect(entry?.payload.completedSpotlightCount).toBe(2)
    expect(entry?.payload.momentumLabels).toContain('Soft landing armed')
    expect(entry?.text).toContain('spotlights cleared')
  })
})

describe('progression journal entries', () => {
  it('builds a milestone entry for a milestone night', () => {
    const entry = buildMilestoneJournalEntry({
      coupleId: 'couple-1',
      nights: 10,
      sessionId: 'session-1',
    })

    expect(entry.type).toBe('milestone')
    expect(entry.title).toBe('Night 10 Together')
    expect(entry.payload.nights).toBe(10)
  })

  it('builds a trophy entry for a known trophy', () => {
    const entry = buildTrophyJournalEntry({
      coupleId: 'couple-1',
      sessionId: 'session-1',
      trophyId: 'first-night',
    })

    expect(entry.type).toBe('trophy')
    expect(entry.title).toContain('First Night')
    expect(entry.payload.trophyId).toBe('first-night')
  })

  it('returns null for an unknown trophy', () => {
    expect(
      buildTrophyJournalEntry({
        coupleId: 'couple-1',
        sessionId: 'session-1',
        trophyId: 'nope',
      }),
    ).toBeNull()
  })

  it('maps progression events to journal entries', () => {
    const entries = buildProgressJournalEntries({
      coupleId: 'couple-1',
      events: [
        { nights: 25, type: 'milestone' },
        { trophyId: 'streak-7', type: 'trophy' },
        { streakCount: 9, type: 'freeze-used' },
        { type: 'freeze-earned' },
      ],
      sessionId: 'session-1',
    })

    expect(entries.map((entry) => entry.type)).toEqual([
      'milestone',
      'trophy',
      'milestone',
      'milestone',
    ])
    expect(entries[2].title).toContain('Streak Kept Warm')
    expect(entries[2].text).toContain('9-night')
    expect(entries[2].text).toContain('Welcome-back ritual')
    expect(entries[3].title).toContain('Freeze Token Earned')
  })

  it('builds freeze entries with rules-valid shapes', () => {
    const used = buildFreezeUsedJournalEntry({
      coupleId: 'c1',
      sessionId: 's1',
      streakCount: 4,
    })
    const earned = buildFreezeEarnedJournalEntry({ coupleId: 'c1', sessionId: 's1' })

    for (const entry of [used, earned]) {
      expect(entry.type).toBe('milestone')
      expect(Object.keys(entry.payload).length).toBeLessThanOrEqual(6)
      expect(
        ['coupleId', 'payload', 'sessionId', 'summary', 'text', 'title', 'type', 'vibe'].every(
          (key) => key in entry,
        ),
      ).toBe(true)
    }
    expect(used.text).toContain('no guilt')
  })
})

describe('finale extras', () => {
  it('builds a rules-valid anniversary milestone entry', () => {
    const entry = buildAnniversaryJournalEntry({
      bonusHearts: 8,
      coupleId: 'c1',
      sessionId: 's1',
    })

    expect(entry.type).toBe('milestone')
    expect(entry.payload).toEqual({ bonusHearts: 8 })
    expect(entry.text).toContain('8 bonus hearts')
    expect(Object.keys(entry).sort()).toEqual(
      ['coupleId', 'payload', 'sessionId', 'summary', 'text', 'title', 'type', 'vibe'].sort(),
    )
  })

  it('builds a rules-valid promise-granted journal entry', () => {
    const entry = buildPromiseGrantedJournalEntry({
      coupleId: 'c1',
      detail: 'Every song, every skip, all day.',
      label: 'Control the playlist',
      sessionId: 's1',
    })

    expect(entry.type).toBe('journal')
    expect(entry.payload).toEqual({
      detail: 'Every song, every skip, all day.',
      label: 'Control the playlist',
    })
    expect(entry.text).toContain('promise wallet')
  })
})
