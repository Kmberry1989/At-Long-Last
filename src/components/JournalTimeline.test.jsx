/* @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { JournalTimeline } from './JournalTimeline.jsx'

describe('JournalTimeline', () => {
  it('renders scrapbook cards for activities, duels, keepsakes, and the finale', () => {
    render(
      <JournalTimeline
        entries={[
          {
            createdAt: '2026-07-17T00:00:00.000Z',
            id: 'activity-1',
            payload: {
              entries: [
                { text: 'Tea and blankets.' },
                { text: 'Quiet company and snacks.' },
              ],
              prompt: "When I'm overwhelmed, what actually helps is...",
            },
            summary: 'A tender note got saved.',
            text: 'Kyle: Tea and blankets.\nElaine: Quiet company and snacks.',
            title: 'Comfort Menu',
            type: 'prompt',
            vibe: 'tender',
          },
          {
            createdAt: '2026-07-17T00:10:00.000Z',
            id: 'duel-1',
            payload: {
              heartBonus: 4,
              results: {
                u1: { highlight: 'landed it clean', time: 0.91, won: true },
                u2: { highlight: 'kept it close', time: 1.03, won: false },
              },
            },
            summary: 'Kyle won the replay and banked 4 shared hearts.',
            text: 'Kyle: landed it clean\nElaine: kept it close',
            title: 'Reaction Heart',
            type: 'duel',
            vibe: 'playful',
          },
          {
            createdAt: '2026-07-17T00:20:00.000Z',
            id: 'keep-1',
            payload: {
              blurb: 'Tiny, sincere, impossible to forget.',
              cost: 7,
              label: 'Pocket Love Note',
            },
            summary: 'You spent 7 hearts on Pocket Love Note.',
            text: 'Tiny, sincere, impossible to forget.',
            title: 'Pocket Love Note',
            type: 'keepsake',
            vibe: 'tender',
          },
          {
            createdAt: '2026-07-17T00:30:00.000Z',
            id: 'finale-1',
            payload: {
              coda: 'Enough little wins stacked up to feel like a proper finale instead of a fade-out.',
              dominantVibe: 'playful',
              duelOutcomeLabel: 'Shared finish',
              headline: 'A night with some weight to it.',
              hearts: 9,
              journalCount: 6,
              keepsakeCount: 2,
              keepsakeLabels: ['Pocket Love Note', 'Sparkler Photo'],
              tierLabel: 'Shelf-worthy run',
            },
            summary: 'A very solid little legend.',
            text: '2 keepsakes, 6 journal beats, 9 hearts left.',
            title: 'Night Closed Out',
            type: 'finale',
            vibe: 'playful',
          },
        ]}
      />,
    )

    expect(screen.getByText('Conversation Slip')).toBeInTheDocument()
    expect(screen.getByText('Shared hearts')).toBeInTheDocument()
    expect(screen.getAllByText('Pocket Love Note')).toHaveLength(2)
    expect(screen.getByText('A night with some weight to it.')).toBeInTheDocument()
    expect(screen.getByText('Shared finish')).toBeInTheDocument()
  })

  it('keeps Vault notes hidden until the matching session finale exists', () => {
    const vaultEntry = {
      createdAt: '2026-07-17T00:00:00.000Z',
      id: 'vault-1',
      payload: {
        entries: [
          { playerIndex: 0, text: 'A secret from Kyle.' },
          { playerIndex: 1, text: 'A secret from Elaine.' },
        ],
        prompt: 'Seal something lovely.',
        revealAt: 'finale',
        sealed: true,
      },
      sessionId: 'session-vault',
      summary: 'Two private notes were sealed.',
      text: 'Kyle: A secret from Kyle.\nElaine: A secret from Elaine.',
      title: 'The Vault',
      type: 'vault',
      vibe: 'tender',
    }

    const { rerender } = render(<JournalTimeline entries={[vaultEntry]} />)

    expect(screen.getByText('Two notes are waiting inside.')).toBeInTheDocument()
    expect(screen.queryByText('A secret from Kyle.')).not.toBeInTheDocument()

    rerender(
      <JournalTimeline
        entries={[
          vaultEntry,
          {
            createdAt: '2026-07-17T01:00:00.000Z',
            id: 'finale-vault',
            payload: {},
            sessionId: 'session-vault',
            summary: 'The night closed.',
            text: 'Finale',
            title: 'Night Closed Out',
            type: 'finale',
            vibe: 'tender',
          },
        ]}
      />,
    )

    expect(screen.getByText('The Vault — Opened')).toBeInTheDocument()
    expect(screen.getByText('A secret from Kyle.')).toBeInTheDocument()
    expect(screen.getByText('A secret from Elaine.')).toBeInTheDocument()
  })

  it('renders slider, rhythm, and letterpress results as distinct scrapbook artifacts', () => {
    render(
      <JournalTimeline
        entries={[
          {
            id: 'vibe-1',
            payload: {
              heartBonus: 5,
              leftLabel: 'Plan every detail',
              markers: [
                { playerIndex: 0, value: 46 },
                { playerIndex: 1, value: 52 },
              ],
              rightLabel: 'Follow the mood',
              syncScore: 94,
            },
            summary: 'The two markers nearly became one.',
            text: 'Kyle: 46/100\nElaine: 52/100',
            title: 'Vibe Check',
            type: 'vibe-sync',
            vibe: 'playful',
          },
          {
            id: 'tempo-1',
            payload: {
              averageAccuracy: 90,
              heartBonus: 5,
            },
            summary: 'Two steady heartbeats.',
            text: 'Kyle: 92% rhythm\nElaine: 88% rhythm',
            title: 'Tempo Tap',
            type: 'tempo',
            vibe: 'playful',
          },
          {
            id: 'word-1',
            payload: {
              combinedWordCount: 3,
              heartBonus: 2,
              letters: ['H', 'E', 'A', 'R', 'T', 'S'],
            },
            summary: 'Three words emerged.',
            text: 'Kyle: heart, star\nElaine: earth, star',
            title: 'Word Weaver',
            type: 'word',
            vibe: 'playful',
          },
        ]}
      />,
    )

    expect(screen.getByText('Marker Reveal')).toBeInTheDocument()
    expect(screen.getByText('94%')).toBeInTheDocument()
    expect(screen.getByText('Rhythm Replay')).toBeInTheDocument()
    expect(screen.getByText('90%')).toBeInTheDocument()
    expect(screen.getByText('Letterpress Page')).toBeInTheDocument()
    expect(screen.getByText('3 words')).toBeInTheDocument()
  })
})
