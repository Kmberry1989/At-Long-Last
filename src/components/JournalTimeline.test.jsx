/* @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { JournalTimeline } from './JournalTimeline.jsx'

describe('JournalTimeline', () => {
  afterEach(cleanup)

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

  it('renders setup ballots and passed duels as visible response records', () => {
    const { container } = render(
      <JournalTimeline
        entries={[
          {
            id: 'vibe-setup-1',
            payload: {
              vibeVotes: {
                u1: { playful: 0.3, spicy: 0.2, tender: 0.5 },
                u2: { playful: 0.4, spicy: 0.1, tender: 0.5 },
              },
            },
            summary: 'You both set the tone for this night.',
            text: 'Kyle: Tender 50% · Playful 30% · Spicy 20%\nElaine: Tender 50% · Playful 40% · Spicy 10%',
            title: 'Tonight’s Vibe',
            type: 'vibe-setup',
            vibe: 'tender',
          },
          {
            id: 'duel-pass-1',
            payload: {
              heartBonus: 0,
              outcomeStatus: 'noContest',
              results: {
                u1: { highlight: 'skipped the duel', skipped: true },
                u2: { highlight: 'skipped the duel', skipped: true },
              },
            },
            summary: 'You both passed Reaction Heart. No hearts were added, but the choice was saved.',
            text: 'Kyle: skipped the duel\nElaine: skipped the duel',
            title: 'Reaction Heart',
            type: 'duel',
            vibe: 'playful',
          },
        ]}
      />,
    )

    expect(screen.getByText('Vibe Ballot')).toBeInTheDocument()
    expect(screen.getByText('Tender 50% · Playful 30% · Spicy 20%')).toBeInTheDocument()
    expect(screen.getByText('You both passed Reaction Heart. No hearts were added, but the choice was saved.')).toBeInTheDocument()
    expect(screen.getByText('Shared hearts')).toBeInTheDocument()
    expect(container.querySelector('.scrapbook-duel-banner strong')).toHaveTextContent('+0')
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

  it('renders maze, merged-canvas, and harmonic cooperative artifacts', () => {
    const imageDataUrl = 'data:image/webp;base64,AAAA'
    render(
      <JournalTimeline
        entries={[
          {
            id: 'maze-1',
            payload: {
              bumps: 0,
              heartBonus: 5,
              moves: 8,
            },
            summary: 'The pearl reached the goal in 8 shared moves.',
            text: '8 moves, 0 bumps',
            title: 'Dual-Axis Maze',
            type: 'maze',
            vibe: 'playful',
          },
          {
            id: 'canvas-1',
            payload: {
              halves: [
                { imageDataUrl, playerIndex: 0, side: 'left' },
                { imageDataUrl, playerIndex: 1, side: 'right' },
              ],
              prompt: 'A cozy cabin in the woods',
            },
            summary: 'Two hidden halves met at one seam.',
            text: 'Kyle: left half, 3 strokes\nElaine: right half, 2 strokes',
            title: 'Blind Canvas',
            type: 'canvas',
            vibe: 'playful',
          },
          {
            id: 'harmonic-1',
            payload: {
              averageResonance: 97,
              heartBonus: 5,
            },
            summary: 'Both dials found the hidden lock.',
            text: 'Kyle: 36, 100% resonance\nElaine: 38, 94% resonance',
            title: 'Harmonic Lock',
            type: 'harmonic',
            vibe: 'tender',
          },
        ]}
      />,
    )

    expect(screen.getByText('Shared Route')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('Merged Canvas')).toBeInTheDocument()
    expect(screen.getAllByRole('img')).toHaveLength(2)
    expect(screen.getByText('Resonance Lock')).toBeInTheDocument()
    expect(screen.getByText('97%')).toBeInTheDocument()
  })

  it('renders a bidding receipt and two-caption Photo Flashback', () => {
    const imageDataUrl = 'data:image/webp;base64,AAAA'
    render(
      <JournalTimeline
        entries={[
          {
            id: 'bluff-1',
            payload: {
              answers: ['Titanic', 'Moonstruck', 'The Notebook'],
              bid: 3,
              succeeded: true,
              topic: 'Famous romance movies',
            },
            summary: 'Elaine proved the 3-answer boast.',
            text: 'Titanic, Moonstruck, The Notebook',
            title: 'Bluff Bidding',
            type: 'bluff',
            vibe: 'playful',
          },
          {
            id: 'photo-1',
            payload: {
              captions: [
                { label: 'Kyle', playerIndex: 0, text: 'The rain started one minute later.' },
                { label: 'Elaine', playerIndex: 1, text: 'Still my favorite accidental detour.' },
              ],
              imageDataUrl,
              prompt: 'What detail does the picture leave out?',
            },
            summary: 'One photograph collected two versions of the same memory.',
            text: 'Kyle: The rain started one minute later.\nElaine: Still my favorite accidental detour.',
            title: 'Photo Flashback',
            type: 'photo',
            vibe: 'tender',
          },
        ]}
      />,
    )

    expect(screen.getByText('Bidding Receipt')).toBeInTheDocument()
    expect(screen.getByText('3 promised')).toBeInTheDocument()
    expect(screen.getByText('Moonstruck')).toBeInTheDocument()
    expect(screen.getAllByText('Photo Flashback')).toHaveLength(2)
    expect(screen.getByRole('img', { name: 'Shared Photo Flashback' })).toBeInTheDocument()
    expect(screen.getByText('The rain started one minute later.')).toBeInTheDocument()
    expect(screen.getByText('Still my favorite accidental detour.')).toBeInTheDocument()
  })
})
