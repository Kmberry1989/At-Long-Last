import { describe, expect, it } from 'vitest'
import {
  buildActivityJournalEntry,
  buildDuelJournalEntry,
} from './journalHelpers.js'

describe('journalHelpers', () => {
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
})
